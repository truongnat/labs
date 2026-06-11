// Bài 95: Notification System - Queue bất đồng bộ (Push / Email / SMS)
// Worker xử lý hàng đợi tuần tự, mô phỏng gửi đa kênh
// Chạy bằng lệnh: node notification-queue.js
// Demo: curl -X POST http://localhost:3095/api/notifications -H "Content-Type: application/json" -d '{"channel":"email","to":"user@example.com","message":"Xin chào!"}'

const http = require('http');
const { EventEmitter } = require('events');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3095;
const WORKER_INTERVAL_MS = 500;

// Trạng thái job trong queue
const JobStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SENT: 'sent',
    FAILED: 'failed'
};

// === Kênh gửi thông báo (mock provider) ===
const providers = {
    push: async (job) => {
        await sleep(200);
        console.log(`[Push] → device ${job.to}: ${job.message}`);
        return { provider: 'fcm-mock', delivered: true };
    },
    email: async (job) => {
        await sleep(350);
        console.log(`[Email] → ${job.to}: ${job.subject || job.message}`);
        return { provider: 'smtp-mock', messageId: randomUUID() };
    },
    sms: async (job) => {
        await sleep(280);
        console.log(`[SMS] → ${job.to}: ${job.message}`);
        return { provider: 'twilio-mock', segments: 1 };
    }
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// === Async Queue với worker nền ===
class NotificationQueue extends EventEmitter {
    constructor() {
        super();
        this.jobs = new Map();
        this.pending = [];
        this.processing = false;
        this.stats = { enqueued: 0, sent: 0, failed: 0 };
    }

    enqueue(payload) {
        const job = {
            id: randomUUID(),
            channel: payload.channel,
            to: payload.to,
            subject: payload.subject || null,
            message: payload.message,
            status: JobStatus.PENDING,
            attempts: 0,
            createdAt: new Date().toISOString(),
            sentAt: null,
            result: null,
            error: null
        };

        if (!providers[job.channel]) {
            throw new Error(`Kênh không hỗ trợ: ${job.channel}. Dùng push | email | sms`);
        }

        this.jobs.set(job.id, job);
        this.pending.push(job.id);
        this.stats.enqueued++;
        this.emit('enqueued', job);
        return job;
    }

    async processNext() {
        if (this.processing || this.pending.length === 0) return;

        this.processing = true;
        const jobId = this.pending.shift();
        const job = this.jobs.get(jobId);

        job.status = JobStatus.PROCESSING;
        job.attempts++;

        try {
            const send = providers[job.channel];
            job.result = await send(job);
            job.status = JobStatus.SENT;
            job.sentAt = new Date().toISOString();
            this.stats.sent++;
            this.emit('sent', job);
        } catch (err) {
            job.status = JobStatus.FAILED;
            job.error = err.message;
            this.stats.failed++;
            this.emit('failed', job);

            // Retry tối đa 2 lần
            if (job.attempts < 3) {
                job.status = JobStatus.PENDING;
                this.pending.push(job.id);
            }
        } finally {
            this.processing = false;
        }
    }

    getJob(id) {
        return this.jobs.get(id) || null;
    }

    listJobs(limit = 20) {
        return [...this.jobs.values()]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
}

const queue = new NotificationQueue();

queue.on('enqueued', (job) => {
    console.log(`[Queue] + ${job.id.slice(0, 8)} (${job.channel}) chờ xử lý`);
});

queue.on('sent', (job) => {
    console.log(`[Queue] ✓ ${job.id.slice(0, 8)} gửi thành công`);
});

// Worker poll queue định kỳ
setInterval(() => {
    queue.processNext().catch(console.error);
}, WORKER_INTERVAL_MS);

// === HTTP API ===
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

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    try {
        if (req.method === 'POST' && url.pathname === '/api/notifications') {
            const body = await readBody(req);
            if (!body.to || !body.message) {
                return sendJson(res, 400, { error: 'Cần có to và message' });
            }
            const job = queue.enqueue({
                channel: body.channel || 'email',
                to: body.to,
                subject: body.subject,
                message: body.message
            });
            return sendJson(res, 202, { message: 'Đã đưa vào queue', job });
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/notifications/')) {
            const id = url.pathname.split('/').pop();
            const job = queue.getJob(id);
            if (!job) return sendJson(res, 404, { error: 'Job không tồn tại' });
            return sendJson(res, 200, job);
        }

        if (req.method === 'GET' && url.pathname === '/api/notifications') {
            return sendJson(res, 200, {
                stats: queue.stats,
                pending: queue.pending.length,
                jobs: queue.listJobs(Number(url.searchParams.get('limit') || 20))
            });
        }

        if (req.method === 'GET' && url.pathname === '/health') {
            return sendJson(res, 200, { status: 'ok', channels: Object.keys(providers) });
        }

        sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
        sendJson(res, 400, { error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Notification Queue chạy tại http://localhost:${PORT}`);
    console.log('Channels: push | email | sms');
    console.log('POST /api/notifications  |  GET /api/notifications  |  GET /api/notifications/:id');
});
