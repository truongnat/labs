// Bài 92: Prometheus Metrics & APM Demo
// Expose /metrics endpoint — Prometheus scrape → Grafana dashboard
// Chạy: node 92/prometheus-metrics.js
// Prometheus config: scrape http://localhost:3092/metrics

const http = require('http');

// === METRICS STORE — mô phỏng prom-client khi chưa cài package ===
class MetricsRegistry {
    constructor() {
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
    }

    counter(name, help, labels = []) {
        if (!this.counters.has(name)) {
            this.counters.set(name, { help, labels, values: new Map() });
        }
        return {
            inc: (labelValues = {}, amount = 1) => {
                const key = this._labelKey(labelValues);
                const c = this.counters.get(name);
                c.values.set(key, (c.values.get(key) || 0) + amount);
            },
        };
    }

    gauge(name, help, labels = []) {
        if (!this.gauges.has(name)) {
            this.gauges.set(name, { help, labels, values: new Map() });
        }
        return {
            set: (labelValues = {}, value) => {
                const key = this._labelKey(labelValues);
                this.gauges.get(name).values.set(key, value);
            },
            inc: (labelValues = {}) => {
                const key = this._labelKey(labelValues);
                const g = this.gauges.get(name);
                g.values.set(key, (g.values.get(key) || 0) + 1);
            },
        };
    }

    histogram(name, help, buckets = [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]) {
        if (!this.histograms.has(name)) {
            this.histograms.set(name, { help, buckets, observations: [] });
        }
        return {
            observe: (value) => {
                this.histograms.get(name).observations.push(value);
            },
        };
    }

    _labelKey(labels) {
        return Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
    }

    // Xuất format Prometheus text exposition
    toPrometheus() {
        const lines = [];

        for (const [name, c] of this.counters) {
            lines.push(`# HELP ${name} ${c.help}`);
            lines.push(`# TYPE ${name} counter`);
            for (const [labels, value] of c.values) {
                const labelStr = labels ? `{${labels}}` : '';
                lines.push(`${name}${labelStr} ${value}`);
            }
        }

        for (const [name, g] of this.gauges) {
            lines.push(`# HELP ${name} ${g.help}`);
            lines.push(`# TYPE ${name} gauge`);
            for (const [labels, value] of g.values) {
                const labelStr = labels ? `{${labels}}` : '';
                lines.push(`${name}${labelStr} ${value}`);
            }
        }

        for (const [name, h] of this.histograms) {
            lines.push(`# HELP ${name} ${h.help}`);
            lines.push(`# TYPE ${name} histogram`);
            const obs = h.observations;
            const sum = obs.reduce((a, b) => a + b, 0);
            for (const bucket of h.buckets) {
                const count = obs.filter((v) => v <= bucket).length;
                lines.push(`${name}_bucket{le="${bucket}"} ${count}`);
            }
            lines.push(`${name}_bucket{le="+Inf"} ${obs.length}`);
            lines.push(`${name}_sum ${sum}`);
            lines.push(`${name}_count ${obs.length}`);
        }

        return lines.join('\n') + '\n';
    }
}

// === KHỞI TẠO METRICS ===
const registry = new MetricsRegistry();

const httpRequestsTotal = registry.counter(
    'http_requests_total',
    'Tổng số HTTP requests',
    ['method', 'route', 'status']
);
const activeConnections = registry.gauge(
    'active_connections',
    'Số kết nối đang active'
);
const httpRequestDuration = registry.histogram(
    'http_request_duration_seconds',
    'Thời gian xử lý request (giây)',
    [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
);

// prom-client alternative (khi đã cài):
/*
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, memory, event loop
const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
register.registerMetric(httpDuration);
*/

let currentConnections = 0;

// Middleware đo metrics mỗi request
function metricsMiddleware(handler) {
    return async (req, res) => {
        const start = process.hrtime.bigint();
        currentConnections++;
        activeConnections.set({}, currentConnections);

        res.on('finish', () => {
            const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
            const route = req.url.split('?')[0];
            const labels = {
                method: req.method,
                route,
                status: String(res.statusCode),
            };

            httpRequestsTotal.inc(labels);
            httpRequestDuration.observe(durationSec);
            currentConnections = Math.max(0, currentConnections - 1);
            activeConnections.set({}, currentConnections);
        });

        return handler(req, res);
    };
}

// === HTTP SERVER ===
const server = http.createServer(
    metricsMiddleware(async (req, res) => {
        if (req.url === '/metrics') {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(registry.toPrometheus());
            return;
        }

        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok' }));
            return;
        }

        // Giả lập xử lý chậm ngẫu nhiên
        await new Promise((r) => setTimeout(r, Math.random() * 200));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hello', path: req.url }));
    })
);

const PORT = process.env.PORT || 3092;

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Metrics server: http://localhost:${PORT}`);
        console.log(`Prometheus scrape: http://localhost:${PORT}/metrics`);
        console.log('\n--- prometheus.yml scrape config ---');
        console.log(`  - job_name: 'nodejs-app'
    static_configs:
      - targets: ['localhost:${PORT}']`);
        console.log('\nThử: curl http://localhost:3092/metrics');
    });
}

module.exports = { MetricsRegistry, registry };
