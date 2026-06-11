// Bài 100: Final Project - Hệ thống đặt vé xem phim (monolith demo)
// Auth JWT, cache in-memory, WebSocket chọn ghế real-time, queue gửi email
// Chạy bằng lệnh: node movie-ticket-booking.js
// Demo:
//   curl -X POST http://localhost:3100/api/auth/register -H "Content-Type: application/json" -d '{"email":"a@test.com","password":"123456","name":"An"}'
//   curl -X POST http://localhost:3100/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@test.com","password":"123456"}'

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const { EventEmitter } = require('events');

const PORT = process.env.PORT || 3100;
const JWT_SECRET = process.env.JWT_SECRET || 'movie-demo-secret';
const SEAT_HOLD_MS = 5 * 60 * 1000; // Giữ ghế 5 phút

// === In-memory stores ===
const users = new Map();
const sessions = new Map(); // token -> userId
const cache = new Map();    // key -> { value, expiresAt }
const bookings = new Map();
const emailQueue = [];
const emailJobs = new Map();

const seatEvents = new EventEmitter();

// === Movies & showtimes ===
const movies = [
    { id: 'm1', title: 'Avengers: Endgame', duration: 181, rating: '13+' },
    { id: 'm2', title: 'Interstellar', duration: 169, rating: '13+' }
];

const showtimes = [
    { id: 's1', movieId: 'm1', room: 'R1', startAt: '2026-06-11T19:00:00+07:00', price: 85000 },
    { id: 's2', movieId: 'm2', room: 'R2', startAt: '2026-06-11T21:30:00+07:00', price: 95000 }
];

// Ghế: 6 hàng x 8 cột
function initSeats(showtimeId) {
    const seats = {};
    for (let row = 1; row <= 6; row++) {
        for (let col = 1; col <= 8; col++) {
            const id = `${String.fromCharCode(64 + row)}${col}`;
            seats[id] = { id, status: 'available', heldBy: null, holdExpiresAt: null };
        }
    }
    return seats;
}

const seatMaps = new Map(showtimes.map((s) => [s.id, initSeats(s.id)]));

// === Cache helper ===
function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function cacheSet(key, value, ttlMs = 60000) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// === Auth (JWT-like với crypto, không cần thư viện) ===
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

function createToken(userId) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');
    const token = `${header}.${payload}.${signature}`;
    sessions.set(token, userId);
    return token;
}

function verifyToken(token) {
    if (!token) return null;
    const cached = sessions.get(token);
    if (cached) return { userId: cached };

    try {
        const [header, payload, signature] = token.split('.');
        const expected = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64url');
        if (signature !== expected) return null;

        const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
        if (data.exp < Math.floor(Date.now() / 1000)) return null;
        return { userId: data.sub };
    } catch {
        return null;
    }
}

function authMiddleware(req) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const session = verifyToken(token);
    if (!session) throw new Error('Unauthorized');
    req.userId = session.userId;
}

// === Seat hold logic ===
function holdSeat(showtimeId, seatId, userId) {
    const map = seatMaps.get(showtimeId);
    if (!map) throw new Error('Suất chiếu không tồn tại');

    const seat = map[seatId];
    if (!seat) throw new Error('Ghế không tồn tại');

    if (seat.status === 'booked') throw new Error('Ghế đã được đặt');
    if (seat.status === 'held' && seat.heldBy !== userId && seat.holdExpiresAt > Date.now()) {
        throw new Error('Ghế đang được giữ bởi người khác');
    }

    seat.status = 'held';
    seat.heldBy = userId;
    seat.holdExpiresAt = Date.now() + SEAT_HOLD_MS;

    setTimeout(() => {
        if (seat.status === 'held' && seat.heldBy === userId) {
            seat.status = 'available';
            seat.heldBy = null;
            seat.holdExpiresAt = null;
            broadcastSeats(showtimeId);
        }
    }, SEAT_HOLD_MS);

    broadcastSeats(showtimeId);
    return seat;
}

function bookSeats(showtimeId, seatIds, userId) {
    const show = showtimes.find((s) => s.id === showtimeId);
    if (!show) throw new Error('Suất chiếu không tồn tại');

    const map = seatMaps.get(showtimeId);
    for (const seatId of seatIds) {
        const seat = map[seatId];
        if (!seat || seat.status === 'booked') throw new Error(`Ghế ${seatId} không khả dụng`);
        if (seat.status === 'held' && seat.heldBy !== userId) {
            throw new Error(`Ghế ${seatId} đang được giữ`);
        }
    }

    for (const seatId of seatIds) {
        map[seatId].status = 'booked';
        map[seatId].heldBy = userId;
        map[seatId].holdExpiresAt = null;
    }

    const bookingId = crypto.randomUUID();
    const total = show.price * seatIds.length;
    const booking = {
        id: bookingId,
        userId,
        showtimeId,
        seatIds,
        total,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    bookings.set(bookingId, booking);

    enqueueEmail({
        to: users.get(userId)?.email,
        subject: 'Xác nhận đặt vé',
        body: `Đặt vé thành công ${seatIds.join(', ')} - Tổng: ${total.toLocaleString('vi-VN')}đ`
    });

    broadcastSeats(showtimeId);
    return booking;
}

// === Email queue (mock BullMQ) ===
function enqueueEmail(payload) {
    const job = {
        id: crypto.randomUUID(),
        ...payload,
        status: 'queued',
        createdAt: new Date().toISOString()
    };
    emailJobs.set(job.id, job);
    emailQueue.push(job.id);
    return job;
}

async function processEmailQueue() {
    if (emailQueue.length === 0) return;
    const jobId = emailQueue.shift();
    const job = emailJobs.get(jobId);
    job.status = 'processing';
    await new Promise((r) => setTimeout(r, 300));
    console.log(`[EmailQueue] Gửi tới ${job.to}: ${job.subject}`);
    job.status = 'sent';
    job.sentAt = new Date().toISOString();
}

setInterval(() => processEmailQueue().catch(console.error), 800);

// === WebSocket clients cho realtime ghế ===
const wsClients = new Map(); // showtimeId -> Set<socket>

function broadcastSeats(showtimeId) {
    const map = seatMaps.get(showtimeId);
    const payload = JSON.stringify({ type: 'seats', showtimeId, seats: map });
    const clients = wsClients.get(showtimeId);
    if (!clients) return;
    for (const socket of clients) {
        socket.write(`data: ${payload}\n\n`);
    }
    seatEvents.emit(`seats:${showtimeId}`, map);
}

// === HTTP helpers ===
function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch { reject(new Error('JSON không hợp lệ')); }
        });
        req.on('error', reject);
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

// === Server ===
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    try {
        // SSE realtime ghế (thay WebSocket đơn giản, không cần thư viện)
        if (req.method === 'GET' && url.pathname.match(/^\/api\/showtimes\/[^/]+\/seats\/stream$/)) {
            const showtimeId = url.pathname.split('/')[3];
            if (!seatMaps.has(showtimeId)) {
                return sendJson(res, 404, { error: 'Suất chiếu không tồn tại' });
            }

            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            });
            res.write(`data: ${JSON.stringify({ type: 'seats', showtimeId, seats: seatMaps.get(showtimeId) })}\n\n`);

            if (!wsClients.has(showtimeId)) wsClients.set(showtimeId, new Set());
            wsClients.get(showtimeId).add(res);

            req.on('close', () => {
                wsClients.get(showtimeId)?.delete(res);
            });
            return;
        }

        if (req.method === 'POST' && url.pathname === '/api/auth/register') {
            const body = await readBody(req);
            if (!body.email || !body.password) {
                return sendJson(res, 400, { error: 'Cần email và password' });
            }
            if (users.has(body.email)) {
                return sendJson(res, 409, { error: 'Email đã tồn tại' });
            }
            const userId = crypto.randomUUID();
            users.set(body.email, {
                id: userId,
                email: body.email,
                name: body.name || body.email,
                passwordHash: hashPassword(body.password)
            });
            return sendJson(res, 201, { message: 'Đăng ký thành công', userId });
        }

        if (req.method === 'POST' && url.pathname === '/api/auth/login') {
            const body = await readBody(req);
            const user = users.get(body.email);
            if (!user || user.passwordHash !== hashPassword(body.password)) {
                return sendJson(res, 401, { error: 'Sai email hoặc mật khẩu' });
            }
            const token = createToken(user.id);
            return sendJson(res, 200, { token, user: { id: user.id, email: user.email, name: user.name } });
        }

        if (req.method === 'GET' && url.pathname === '/api/movies') {
            const cacheKey = 'movies:all';
            let data = cacheGet(cacheKey);
            if (!data) {
                data = { movies, showtimes };
                cacheSet(cacheKey, data, 30000);
            }
            return sendJson(res, 200, data);
        }

        if (req.method === 'GET' && url.pathname.match(/^\/api\/showtimes\/[^/]+\/seats$/)) {
            const showtimeId = url.pathname.split('/')[3];
            const map = seatMaps.get(showtimeId);
            if (!map) return sendJson(res, 404, { error: 'Suất chiếu không tồn tại' });
            return sendJson(res, 200, { showtimeId, seats: map });
        }

        if (req.method === 'POST' && url.pathname.match(/^\/api\/showtimes\/[^/]+\/hold$/)) {
            authMiddleware(req);
            const showtimeId = url.pathname.split('/')[3];
            const body = await readBody(req);
            const seat = holdSeat(showtimeId, body.seatId, req.userId);
            return sendJson(res, 200, { message: 'Giữ ghế thành công', seat, holdMinutes: SEAT_HOLD_MS / 60000 });
        }

        if (req.method === 'POST' && url.pathname === '/api/bookings') {
            authMiddleware(req);
            const body = await readBody(req);
            const booking = bookSeats(body.showtimeId, body.seatIds || [], req.userId);
            return sendJson(res, 201, { message: 'Đặt vé thành công', booking });
        }

        if (req.method === 'GET' && url.pathname === '/api/bookings/me') {
            authMiddleware(req);
            const mine = [...bookings.values()].filter((b) => b.userId === req.userId);
            return sendJson(res, 200, { bookings: mine });
        }

        if (req.method === 'GET' && url.pathname === '/health') {
            return sendJson(res, 200, {
                status: 'ok',
                users: users.size,
                bookings: bookings.size,
                emailQueue: emailQueue.length
            });
        }

        sendJson(res, 404, {
            error: 'Not found',
            routes: [
                'POST /api/auth/register',
                'POST /api/auth/login',
                'GET /api/movies',
                'GET /api/showtimes/:id/seats',
                'GET /api/showtimes/:id/seats/stream (SSE realtime)',
                'POST /api/showtimes/:id/hold (Bearer token)',
                'POST /api/bookings (Bearer token)',
                'GET /api/bookings/me (Bearer token)'
            ]
        });
    } catch (err) {
        const status = err.message === 'Unauthorized' ? 401 : 400;
        sendJson(res, status, { error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Movie Ticket Booking monolith chạy tại http://localhost:${PORT}`);
    console.log('Auth + Cache + SSE realtime ghế + Email queue');
    console.log('1. POST /api/auth/register  2. POST /api/auth/login  3. GET /api/movies');
});
