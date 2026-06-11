// Bài 67: Background Job - gửi email hàng loạt với BullMQ
// Queue tách task nặng khỏi request chính, retry tự động khi fail
// Chạy bằng lệnh: node bullmq-job.js
// BullMQ thật: npm install bullmq && REDIS_URL=redis://localhost:6379 node bullmq-job.js

const { EventEmitter } = require('events');

// Mock Queue khi không có Redis/BullMQ
class MockQueue {
    constructor(name) {
        this.name = name;
        this.emitter = new EventEmitter();
    }

    add(jobName, data) {
        const job = { id: Date.now(), name: jobName, data, attempts: 0 };
        setImmediate(() => this.emitter.emit('job', job));
        return Promise.resolve(job);
    }

    process(handler) {
        this.emitter.on('job', async (job) => {
            try {
                await handler(job);
                console.log(`[MockQueue] Job #${job.id} hoàn thành`);
            } catch (err) {
                job.attempts++;
                if (job.attempts < 3) {
                    console.log(`[MockQueue] Job #${job.id} retry lần ${job.attempts}`);
                    setTimeout(() => this.emitter.emit('job', job), 1000);
                } else {
                    console.error(`[MockQueue] Job #${job.id} failed:`, err.message);
                }
            }
        });
    }
}

async function createEmailQueue() {
    if (process.env.REDIS_URL) {
        try {
            const { Queue, Worker } = require('bullmq');
            const connection = { url: process.env.REDIS_URL };

            const queue = new Queue('email-queue', { connection });

            const worker = new Worker('email-queue', async (job) => {
                console.log(`[BullMQ] Gửi email tới ${job.data.to}: ${job.data.subject}`);
                await simulateSendEmail(job.data);
            }, { connection });

            worker.on('failed', (job, err) => {
                console.error(`[BullMQ] Job ${job.id} failed:`, err.message);
            });

            return { queue, worker, isMock: false };
        } catch (err) {
            console.log('[BullMQ] Fallback mock:', err.message);
        }
    }

    const mock = new MockQueue('email-queue');
    mock.process(async (job) => {
        console.log(`[MockQueue] Gửi email tới ${job.data.to}: ${job.data.subject}`);
        await simulateSendEmail(job.data);
    });
    return { queue: mock, isMock: true };
}

async function simulateSendEmail({ to, subject, body }) {
    await new Promise((r) => setTimeout(r, 300));
    if (to.includes('fail')) throw new Error('SMTP timeout');
    console.log(`  ✓ Email sent -> ${to}`);
}

async function main() {
    const { queue, isMock } = await createEmailQueue();

    console.log(`Mode: ${isMock ? 'Mock Queue' : 'BullMQ + Redis'}`);
    console.log('\nThêm jobs vào queue...');

    const emails = [
        { to: 'user1@example.com', subject: 'Chào mừng!', body: 'Welcome aboard' },
        { to: 'user2@example.com', subject: 'Xác nhận đơn hàng', body: 'Order #123' },
        { to: 'user3@example.com', subject: 'Reset password', body: 'Click link...' }
    ];

    for (const email of emails) {
        await queue.add('send-email', email);
        console.log(`Enqueued: ${email.to}`);
    }

    console.log('\nJobs đang được worker xử lý bất đồng bộ...');
    await new Promise((r) => setTimeout(r, 2000));

    console.log('\nUse case: API nhận request -> enqueue job -> trả 202 Accepted ngay');
    process.exit(0);
}

main().catch(console.error);
