// Bài 98: Mini Express-like Framework
// Tự implement routing + middleware chain trên http.createServer
// Chạy bằng lệnh: node mini-express.js
// Demo: curl http://localhost:3098/  |  curl http://localhost:3098/api/users

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3098;

// === Mini Express core ===
class MiniExpress {
    constructor() {
        this.stack = []; // middleware + route handlers
    }

    use(...handlers) {
        for (const handler of handlers) {
            this.stack.push({ type: 'middleware', handler });
        }
        return this;
    }

    _route(method, path, ...handlers) {
        for (const handler of handlers) {
            this.stack.push({ type: 'route', method, path, handler });
        }
        return this;
    }

    get(path, ...handlers) { return this._route('GET', path, ...handlers); }
    post(path, ...handlers) { return this._route('POST', path, ...handlers); }
    put(path, ...handlers) { return this._route('PUT', path, ...handlers); }
    delete(path, ...handlers) { return this._route('DELETE', path, ...handlers); }

    listen(port, callback) {
        const server = http.createServer((req, res) => this.handle(req, res));
        server.listen(port, callback);
        return server;
    }

    async handle(req, res) {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        req.params = {};
        req.query = Object.fromEntries(url.searchParams);
        req.path = url.pathname;
        req.body = await readBody(req);

        let idx = 0;

        const next = (err) => {
            if (err) {
                console.error('[MiniExpress Error]', err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message || 'Internal error' }));
                }
                return;
            }

            const layer = this.stack[idx++];
            if (!layer) {
                if (!res.headersSent) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
                return;
            }

            if (layer.type === 'middleware') {
                return layer.handler(req, res, next);
            }

            if (layer.method !== req.method) {
                return next();
            }

            const match = matchRoute(layer.path, url.pathname);
            if (!match) {
                return next();
            }

            req.params = match.params;
            return layer.handler(req, res, next);
        };

        next();
    }
}

function matchRoute(pattern, pathname) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pp = patternParts[i];
        const pv = pathParts[i];

        if (pp.startsWith(':')) {
            params[pp.slice(1)] = decodeURIComponent(pv);
        } else if (pp !== pv) {
            return null;
        }
    }

    return { params };
}

function readBody(req) {
    return new Promise((resolve) => {
        if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
            return resolve({});
        }
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch { resolve({}); }
        });
    });
}

// Helper giống Express
function json() {
    return (req, res, next) => {
        res.json = (payload, status = 200) => {
            res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(payload, null, 2));
        };
        next();
    };
}

function logger() {
    return (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
        });
        next();
    };
}

// Patch writeHead để emit 'finish' event
const originalWriteHead = http.ServerResponse.prototype.writeHead;
http.ServerResponse.prototype.writeHead = function (...args) {
    this.emit('finish');
    return originalWriteHead.apply(this, args);
};

// === Demo app ===
const app = new MiniExpress();
const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
];

app
    .use(logger(), json())
    .use((req, res, next) => {
        // Middleware thêm request id
        req.requestId = `req-${Date.now()}`;
        next();
    })
    .get('/', (req, res) => {
        res.json({
            framework: 'MiniExpress',
            message: 'Routing + middleware chain tự viết',
            requestId: req.requestId
        });
    })
    .get('/api/users', (req, res) => {
        res.json({ users, requestId: req.requestId });
    })
    .get('/api/users/:id', (req, res) => {
        const user = users.find((u) => String(u.id) === req.params.id);
        if (!user) return res.json({ error: 'User không tồn tại' }, 404);
        res.json({ user, requestId: req.requestId });
    })
    .post('/api/users', (req, res) => {
        const newUser = { id: Date.now(), ...req.body };
        users.push(newUser);
        res.json(newUser, 201);
    })
    .use((req, res, next) => {
        // Error middleware cuối chain
        next(new Error(`Route không khớp: ${req.method} ${req.path}`));
    });

app.listen(PORT, () => {
    console.log(`MiniExpress demo chạy tại http://localhost:${PORT}`);
    console.log('GET /  |  GET /api/users  |  GET /api/users/:id  |  POST /api/users');
});

module.exports = { MiniExpress };
