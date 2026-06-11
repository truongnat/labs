// Bài 86: JSON Logging với Pino (hoặc Winston)
// Log structured JSON — dễ parse bởi ELK, Loki, CloudWatch
// Chạy: node 86/json-logging.js
// Cài pino: npm install pino  (hoặc dùng fallback JSON logger bên dưới)

const http = require('http');

// === FALLBACK LOGGER — không cần cài package, vẫn output JSON ===
function createJsonLogger(serviceName = 'nodejs-app') {
    const base = { service: serviceName, pid: process.pid, hostname: require('os').hostname() };

    const log = (level, message, extra = {}) => {
        const entry = {
            ...base,
            level,
            time: new Date().toISOString(),
            msg: message,
            ...extra,
        };
        // stderr cho error, stdout cho info/debug
        const stream = level === 'error' || level === 'fatal' ? process.stderr : process.stdout;
        stream.write(JSON.stringify(entry) + '\n');
    };

    return {
        debug: (msg, extra) => log('debug', msg, extra),
        info: (msg, extra) => log('info', msg, extra),
        warn: (msg, extra) => log('warn', msg, extra),
        error: (msg, extra) => log('error', msg, extra),
        child: (bindings) => createJsonLogger(`${serviceName}:${bindings.module || 'child'}`),
    };
}

// === PINO LOGGER (khi đã cài pino) ===
function createPinoLogger() {
    try {
        const pino = require('pino');
        return pino({
            level: process.env.LOG_LEVEL || 'info',
            // Production: log JSON thuần; Development: dùng pino-pretty
            transport:
                process.env.NODE_ENV === 'development'
                    ? { target: 'pino-pretty', options: { colorize: true } }
                    : undefined,
            base: { service: 'nodejs-app', pid: process.pid },
        });
    } catch {
        console.error('[WARN] pino chưa cài — dùng fallback JSON logger');
        return createJsonLogger();
    }
}

// === WINSTON LOGGER (alternative) ===
/*
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()]
});
*/

const logger = createPinoLogger();

// Request logging middleware pattern
function requestLogger(req, res, next) {
    const start = Date.now();
    const requestId = `req-${Date.now()}`;

    logger.info('request_started', {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
    });

    res.on('finish', () => {
        logger.info('request_completed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
        });
    });

    next();
}

// === DEMO SERVER ===
const server = http.createServer((req, res) => {
    requestLogger(req, res, () => {
        if (req.url === '/error') {
            logger.error('simulated_error', { url: req.url, code: 'DEMO_ERR' });
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Lỗi demo' }));
            return;
        }

        logger.debug('processing_request', { url: req.url });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'OK' }));
    });
});

const PORT = process.env.PORT || 3086;

if (require.main === module) {
    logger.info('server_starting', { port: PORT });
    server.listen(PORT, () => {
        logger.info('server_ready', { port: PORT });
        console.log('\nThử: curl http://localhost:3086/ && curl http://localhost:3086/error');
    });
}

module.exports = { createJsonLogger, createPinoLogger, requestLogger };
