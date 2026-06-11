// Bài 87: Đẩy log tập trung về ELK Stack hoặc Loki
// Config mẫu: filebeat.yml, promtail.yml — code ship log qua HTTP
// Chạy demo: node 87/elk-loki-shipping.js
// Xem config: 87/filebeat-elk.yml, 87/promtail-loki.yml

const http = require('http');
const { createJsonLogger } = require('../86/json-logging');

const logger = createJsonLogger('log-shipping-demo');

// === LOG SHIPPER — gửi log tới Loki hoặc Logstash ===
class LogShipper {
    constructor(options = {}) {
        this.endpoint = options.endpoint || 'http://localhost:3100/loki/api/v1/push';
        this.buffer = [];
        this.batchSize = options.batchSize || 10;
        this.flushIntervalMs = options.flushIntervalMs || 5000;
        this.labels = options.labels || { job: 'nodejs-app', env: 'development' };
        this.enabled = options.enabled !== false;

        if (this.enabled) {
            this._timer = setInterval(() => this.flush(), this.flushIntervalMs);
            this._timer.unref();
        }
    }

    // Thêm log vào buffer
    ship(level, message, extra = {}) {
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...extra,
        };
        this.buffer.push(entry);
        logger.info('log_buffered', { level, bufferSize: this.buffer.length });

        if (this.buffer.length >= this.batchSize) {
            this.flush();
        }
    }

    // Gửi batch log tới Loki (Push API)
    async flush() {
        if (this.buffer.length === 0) return;

        const batch = this.buffer.splice(0);
        const payload = this._formatForLoki(batch);

        try {
            await this._post(this.endpoint, payload);
            logger.info('logs_shipped', { count: batch.length, target: 'loki' });
        } catch (err) {
            // Fallback: in ra console nếu Loki chưa chạy
            logger.warn('ship_failed_fallback', {
                error: err.message,
                hint: 'Chạy docker-compose up loki để nhận log',
                droppedCount: batch.length,
            });
            batch.forEach((e) => logger.info('fallback_log', e));
        }
    }

    // Format theo Loki Push API
    _formatForLoki(entries) {
        const labelStr = Object.entries(this.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');

        const values = entries.map((e) => [
            String(Date.parse(e.timestamp) * 1e6), // nanoseconds
            JSON.stringify(e),
        ]);

        return {
            streams: [{ stream: this.labels, values }],
        };
    }

    // Format cho Logstash HTTP input (ELK)
    _formatForLogstash(entries) {
        return entries.map((e) => ({ '@timestamp': e.timestamp, ...e }));
    }

    async _post(url, body) {
        const data = JSON.stringify(body);
        const urlObj = new URL(url);

        return new Promise((resolve, reject) => {
            const req = http.request(
                {
                    hostname: urlObj.hostname,
                    port: urlObj.port,
                    path: urlObj.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data),
                    },
                    timeout: 3000,
                },
                (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                }
            );
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            req.write(data);
            req.end();
        });
    }

    async close() {
        clearInterval(this._timer);
        await this.flush();
    }
}

// === DEMO ===
async function demo() {
    const shipper = new LogShipper({
        endpoint: process.env.LOKI_URL || 'http://localhost:3100/loki/api/v1/push',
        labels: { job: 'nodejs-labs', env: process.env.NODE_ENV || 'dev' },
    });

    shipper.ship('info', 'User đăng nhập', { userId: 'u123', ip: '192.168.1.1' });
    shipper.ship('warn', 'Rate limit gần đạt ngưỡng', { endpoint: '/api/search', count: 95 });
    shipper.ship('error', 'Payment gateway timeout', { orderId: 'ORD-456', retry: 3 });

    await shipper.flush();
    await shipper.close();

    console.log('\n--- Cấu hình ELK/Loki ---');
    console.log('ELK: xem 87/filebeat-elk.yml');
    console.log('Loki: xem 87/promtail-loki.yml');
    console.log('Grafana: http://localhost:3000 → Explore → Loki');
}

if (require.main === module) {
    demo();
}

module.exports = { LogShipper };
