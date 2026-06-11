// Bài 99: Rate Limiter - Token Bucket & Sliding Window
// Hỗ trợ Redis hoặc in-memory fallback
// Chạy bằng lệnh: node rate-limiter.js
// Demo: for i in {1..12}; do curl -s http://localhost:3099/api/data; echo; done

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3099;

// === In-memory store ===
class MemoryStore {
    constructor() {
        this.data = new Map();
    }

    async get(key) {
        const entry = this.data.get(key);
        if (!entry) return null;
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.data.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key, value, ttlMs) {
        this.data.set(key, {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : null
        });
    }

    async incr(key) {
        const raw = await this.get(key);
        const next = Number(raw || 0) + 1;
        await this.set(key, String(next), null);
        return next;
    }
}

async function createStore() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.log('[RateLimiter] Dùng in-memory store');
        return new MemoryStore();
    }

    try {
        const redis = require('redis');
        const client = redis.createClient({ url: redisUrl });
        await client.connect();
        console.log('[RateLimiter] Redis connected');
        return {
            get: (key) => client.get(key),
            set: (key, value, ttlMs) => client.set(key, value, { PX: ttlMs }),
            incr: (key) => client.incr(key)
        };
    } catch (err) {
        console.warn('[RateLimiter] Redis fallback in-memory:', err.message);
        return new MemoryStore();
    }
}

// === Token Bucket ===
// Mỗi client có bucket tokens; mỗi request tiêu tốn 1 token; tokens nạp lại theo rate
function createTokenBucketLimiter(store, { capacity = 10, refillRate = 2, windowMs = 1000 } = {}) {
    return async (key) => {
        const now = Date.now();
        const stateKey = `tb:${key}`;
        const raw = await store.get(stateKey);

        let tokens = capacity;
        let lastRefill = now;

        if (raw) {
            const parsed = JSON.parse(raw);
            tokens = parsed.tokens;
            lastRefill = parsed.lastRefill;

            const elapsed = now - lastRefill;
            const refill = Math.floor(elapsed / windowMs) * refillRate;
            if (refill > 0) {
                tokens = Math.min(capacity, tokens + refill);
                lastRefill = now;
            }
        }

        if (tokens <= 0) {
            await store.set(stateKey, JSON.stringify({ tokens, lastRefill }), windowMs * 2);
            return { allowed: false, remaining: 0, algorithm: 'token-bucket' };
        }

        tokens -= 1;
        await store.set(stateKey, JSON.stringify({ tokens, lastRefill }), windowMs * 10);
        return { allowed: true, remaining: tokens, algorithm: 'token-bucket' };
    };
}

// === Sliding Window ===
// Đếm request trong cửa sổ trượt windowMs
function createSlidingWindowLimiter(store, { limit = 10, windowMs = 60000 } = {}) {
    return async (key) => {
        const now = Date.now();
        const stateKey = `sw:${key}`;
        const raw = await store.get(stateKey);

        let timestamps = raw ? JSON.parse(raw) : [];
        timestamps = timestamps.filter((t) => now - t < windowMs);

        if (timestamps.length >= limit) {
            await store.set(stateKey, JSON.stringify(timestamps), windowMs);
            return {
                allowed: false,
                remaining: 0,
                retryAfterMs: windowMs - (now - timestamps[0]),
                algorithm: 'sliding-window'
            };
        }

        timestamps.push(now);
        await store.set(stateKey, JSON.stringify(timestamps), windowMs);
        return {
            allowed: true,
            remaining: limit - timestamps.length,
            algorithm: 'sliding-window'
        };
    };
}

function getClientKey(req) {
    return req.headers['x-api-key']
        || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || 'anonymous';
}

function sendJson(res, status, data, headers = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
    res.end(JSON.stringify(data, null, 2));
}

async function main() {
    const store = await createStore();

    const tokenBucket = createTokenBucketLimiter(store, {
        capacity: 5,
        refillRate: 1,
        windowMs: 1000
    });

    const slidingWindow = createSlidingWindowLimiter(store, {
        limit: 20,
        windowMs: 60000
    });

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const clientKey = getClientKey(req);
        const algorithm = url.searchParams.get('algo') || 'token-bucket';

        const limiter = algorithm === 'sliding-window' ? slidingWindow : tokenBucket;
        const result = await limiter(clientKey);

        const rateHeaders = {
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Algorithm': result.algorithm
        };

        if (!result.allowed) {
            if (result.retryAfterMs) {
                rateHeaders['Retry-After'] = String(Math.ceil(result.retryAfterMs / 1000));
            }
            return sendJson(res, 429, {
                error: 'Too Many Requests',
                message: 'Vượt giới hạn rate limit',
                ...result
            }, rateHeaders);
        }

        if (req.method === 'GET' && url.pathname === '/api/data') {
            return sendJson(res, 200, {
                message: 'Request được phép',
                clientKey,
                ...result
            }, rateHeaders);
        }

        if (req.method === 'GET' && url.pathname === '/health') {
            return sendJson(res, 200, {
                status: 'ok',
                algorithms: ['token-bucket', 'sliding-window'],
                usage: 'GET /api/data?algo=token-bucket | GET /api/data?algo=sliding-window'
            });
        }

        sendJson(res, 404, { error: 'Not found' });
    });

    server.listen(PORT, () => {
        console.log(`Rate Limiter chạy tại http://localhost:${PORT}`);
        console.log('Token Bucket (mặc định): GET /api/data');
        console.log('Sliding Window: GET /api/data?algo=sliding-window');
    });
}

main();
