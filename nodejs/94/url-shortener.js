// Bài 94: Design - URL Shortener System
// Hệ thống rút link chịu tải cao (Redis hoặc in-memory fallback)
// Chạy bằng lệnh: node url-shortener.js
// Demo: curl -X POST http://localhost:3094/api/shorten -H "Content-Type: application/json" -d '{"longUrl":"https://google.com"}'

const http = require('http');
const { URL } = require('url');

// Base62 character set để encode ID thành short code
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(num) {
    let result = '';
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result || '0';
}

// === In-memory store (mặc định, không cần Redis) ===
class MemoryStore {
    constructor() {
        this.strings = new Map(); // key -> { value, expiresAt }
        this.counters = new Map();
    }

    async incr(key) {
        const next = (this.counters.get(key) || 0) + 1;
        this.counters.set(key, next);
        return next;
    }

    async setEx(key, ttlSeconds, value) {
        this.strings.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }

    async get(key) {
        const entry = this.strings.get(key);
        if (!entry) return null;
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.strings.delete(key);
            return null;
        }
        return entry.value;
    }
}

// === Redis store (tùy chọn khi có REDIS_URL) ===
async function createStore() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.log('[Store] Dùng in-memory Map (không cần Redis)');
        return new MemoryStore();
    }

    try {
        const redis = require('redis');
        const client = redis.createClient({ url: redisUrl });
        client.on('error', (err) => console.error('Redis error:', err.message));
        await client.connect();
        console.log('[Store] Đã kết nối Redis:', redisUrl);

        return {
            incr: (key) => client.incr(key),
            setEx: (key, ttl, value) => client.setEx(key, ttl, value),
            get: (key) => client.get(key)
        };
    } catch (err) {
        console.warn('[Store] Redis không khả dụng, fallback in-memory:', err.message);
        return new MemoryStore();
    }
}

let store;

async function generateShortCode() {
    const id = await store.incr('url_counter');
    return encodeBase62(id);
}

async function saveUrl(longUrl) {
    const shortCode = await generateShortCode();
    await store.setEx(`url:${shortCode}`, 86400 * 30, longUrl);
    return shortCode;
}

async function getLongUrl(shortCode) {
    const longUrl = await store.get(`url:${shortCode}`);
    if (!longUrl) return null;
    await store.incr(`click:${shortCode}`);
    return longUrl;
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch {
                reject(new Error('JSON không hợp lệ'));
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload, null, 2));
}

async function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && url.pathname === '/api/shorten') {
        try {
            const body = await readBody(req);
            const { longUrl } = body;

            if (!longUrl) {
                return sendJson(res, 400, { error: 'Missing longUrl' });
            }

            const shortCode = await saveUrl(longUrl);
            const host = req.headers.host || 'localhost:3094';
            return sendJson(res, 201, {
                shortUrl: `http://${host}/${shortCode}`,
                shortCode,
                longUrl
            });
        } catch (err) {
            return sendJson(res, 400, { error: err.message });
        }
    }

    if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { status: 'ok', service: 'url-shortener' });
    }

    const shortCode = url.pathname.slice(1);
    if (req.method === 'GET' && shortCode && !shortCode.includes('/')) {
        const longUrl = await getLongUrl(shortCode);
        if (!longUrl) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('URL không tồn tại');
        }
        res.writeHead(302, { Location: longUrl });
        return res.end();
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found. POST /api/shorten hoặc GET /:shortCode');
}

async function main() {
    store = await createStore();

    const PORT = process.env.PORT || 3094;
    const server = http.createServer((req, res) => {
        handleRequest(req, res).catch((err) => {
            console.error(err);
            sendJson(res, 500, { error: 'Internal server error' });
        });
    });

    server.listen(PORT, () => {
        console.log(`URL Shortener chạy tại http://localhost:${PORT}`);
        console.log('POST /api/shorten  |  GET /:shortCode  |  GET /health');
    });
}

main();
