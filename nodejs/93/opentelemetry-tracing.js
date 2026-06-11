// Bài 93: OpenTelemetry Distributed Tracing Demo
// Theo dõi 1 request đi qua nhiều service/microservice
// Chạy: node 93/opentelemetry-tracing.js
// Jaeger UI: http://localhost:16686

const http = require('http');

// === TRACER — mô phỏng OpenTelemetry SDK (không cần cài package) ===
// Production: @opentelemetry/sdk-node + @opentelemetry/exporter-jaeger

class Span {
    constructor(tracer, name, parentContext = null) {
        this.tracer = tracer;
        this.name = name;
        this.traceId = parentContext?.traceId || tracer.generateId(32);
        this.spanId = tracer.generateId(16);
        this.parentSpanId = parentContext?.spanId || null;
        this.startTime = Date.now();
        this.attributes = {};
        this.events = [];
        this.status = 'OK';
    }

    setAttribute(key, value) {
        this.attributes[key] = value;
        return this;
    }

    addEvent(name, attributes = {}) {
        this.events.push({ name, attributes, timestamp: Date.now() });
        return this;
    }

    setStatus(code, message) {
        this.status = code;
        if (message) this.statusMessage = message;
        return this;
    }

    end() {
        this.endTime = Date.now();
        this.durationMs = this.endTime - this.startTime;
        this.tracer._recordSpan(this);
    }
}

class Tracer {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.spans = [];
    }

    generateId(hexLen) {
        return Array.from({ length: hexLen }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }

    startSpan(name, parentContext = null) {
        return new Span(this, name, parentContext);
    }

    _recordSpan(span) {
        this.spans.push(span);
        // Export span (gửi tới Jaeger/OTLP collector)
        this._export(span);
    }

    _export(span) {
        const payload = {
            service: this.serviceName,
            traceId: span.traceId,
            spanId: span.spanId,
            parentSpanId: span.parentSpanId,
            name: span.name,
            durationMs: span.durationMs,
            attributes: span.attributes,
            events: span.events,
            status: span.status,
        };

        // Gửi tới Jaeger collector (nếu chạy) hoặc log local
        this._sendToCollector(payload).catch(() => {
            console.log('[TRACE]', JSON.stringify(payload));
        });
    }

    async _sendToCollector(payload) {
        const data = JSON.stringify(payload);
        return new Promise((resolve, reject) => {
            const req = http.request(
                {
                    hostname: 'localhost',
                    port: 4318,
                    path: '/v1/traces',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data),
                    },
                    timeout: 1000,
                },
                (res) => (res.statusCode < 300 ? resolve() : reject())
            );
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('timeout'));
            });
            req.write(data);
            req.end();
        });
    }
}

// Context propagation — truyền trace context qua HTTP headers
const TRACE_HEADER = 'traceparent';

function injectContext(span) {
    return `${span.traceId}:${span.spanId}:1`;
}

function extractContext(header) {
    if (!header) return null;
    const [traceId, spanId] = header.split(':');
    return { traceId, spanId };
}

// === MICROSERVICES DEMO ===
const apiTracer = new Tracer('api-gateway');
const userTracer = new Tracer('user-service');
const orderTracer = new Tracer('order-service');

async function userServiceGetUser(userId, parentContext) {
    const span = userTracer.startSpan('user.getById', parentContext);
    span.setAttribute('user.id', userId);

    await new Promise((r) => setTimeout(r, 50)); // Giả lập DB query
    span.addEvent('db.query', { table: 'users', query: 'SELECT * WHERE id=?' });
    span.setAttribute('db.rows', 1);
    span.end();

    return { id: userId, name: 'Nguyễn Văn A' };
}

async function orderServiceGetOrders(userId, parentContext) {
    const span = orderTracer.startSpan('order.listByUser', parentContext);
    span.setAttribute('user.id', userId);

    await new Promise((r) => setTimeout(r, 80));
    span.addEvent('db.query', { table: 'orders' });
    span.end();

    return [{ id: 'ORD-1', amount: 150000 }];
}

// API Gateway — nhận request, gọi nhiều service
async function handleGetUserProfile(userId) {
    const rootSpan = apiTracer.startSpan('GET /users/:id/profile');
    rootSpan.setAttribute('http.method', 'GET');
    rootSpan.setAttribute('http.route', '/users/:id/profile');
    rootSpan.setAttribute('user.id', userId);

    const ctx = { traceId: rootSpan.traceId, spanId: rootSpan.spanId };

    // Gọi song song 2 service — cùng traceId, khác spanId
    const [user, orders] = await Promise.all([
        userServiceGetUser(userId, ctx),
        orderServiceGetOrders(userId, ctx),
    ]);

    rootSpan.setAttribute('orders.count', orders.length);
    rootSpan.end();

    return { user, orders, traceId: rootSpan.traceId };
}

// === HTTP SERVER ===
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost`);

    if (url.pathname.startsWith('/users/') && url.pathname.endsWith('/profile')) {
        const userId = url.pathname.split('/')[2];
        const parentCtx = extractContext(req.headers[TRACE_HEADER]);
        const result = await handleGetUserProfile(userId);

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Trace-Id': result.traceId,
        });
        res.end(JSON.stringify(result));
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

const PORT = process.env.PORT || 3093;

if (require.main === module) {
    server.listen(PORT, async () => {
        console.log(`Tracing demo: http://localhost:${PORT}`);
        console.log('\n--- OpenTelemetry setup (production) ---');
        console.log('npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node');
        console.log('Jaeger: docker run -d -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one');
        console.log('Jaeger UI: http://localhost:16686\n');

        // Demo request
        const result = await handleGetUserProfile('u123');
        console.log('Kết quả:', JSON.stringify(result, null, 2));
        console.log(`\nTrace ID: ${result.traceId}`);
        console.log(`Tổng spans: ${apiTracer.spans.length + userTracer.spans.length + orderTracer.spans.length}`);
        console.log('\nThử: curl http://localhost:3093/users/u123/profile');
    });
}

module.exports = { Tracer, Span, handleGetUserProfile, injectContext, extractContext };
