// Bài 66: Redis Pub/Sub - giao tiếp giữa 2 server Node.js
// Server A publish event, Server B subscribe và xử lý
// Chạy bằng lệnh: node redis-pubsub.js
// Với Redis thật: REDIS_URL=redis://localhost:6379 node redis-pubsub.js

const { EventEmitter } = require('events');

// Mock Redis Pub/Sub bằng EventEmitter (chạy được không cần Redis)
class MockRedisPubSub {
    constructor() {
        this.bus = new EventEmitter();
        this.bus.setMaxListeners(50);
    }

    async connect() {
        console.log('[MockRedis] Connected');
    }

    async publish(channel, message) {
        this.bus.emit(channel, message);
        return 1;
    }

    async subscribe(channel, callback) {
        this.bus.on(channel, (msg) => callback(msg));
    }

    duplicate() {
        const sub = new MockRedisPubSub();
        sub.bus = this.bus;
        return sub;
    }
}

// Adapter: dùng Redis thật nếu có, fallback mock
async function createPubSub() {
    if (process.env.REDIS_URL) {
        try {
            const redis = require('redis');
            const publisher = redis.createClient({ url: process.env.REDIS_URL });
            const subscriber = publisher.duplicate();
            await publisher.connect();
            await subscriber.connect();
            console.log('[Redis] Connected:', process.env.REDIS_URL);
            return { publisher, subscriber, isMock: false };
        } catch (err) {
            console.log('[Redis] Không kết nối được, dùng mock:', err.message);
        }
    }

    const mock = new MockRedisPubSub();
    await mock.connect();
    return {
        publisher: mock,
        subscriber: mock.duplicate(),
        isMock: true
    };
}

// --- Server B: Subscriber (nhận message) ---
async function startSubscriber(subscriber, isMock) {
    console.log('\n[Server B] Subscriber đang lắng nghe channel "orders"...');

    await subscriber.subscribe('orders', (message) => {
        const order = JSON.parse(message);
        const extra = isMock ? ` - ${order.amount}đ` : '';
        console.log(`[Server B] Nhận order: #${order.id} - ${order.product}${extra}`);
    });
}

// --- Server A: Publisher (gửi message) ---
async function startPublisher(publisher) {
    console.log('\n[Server A] Publisher gửi orders...');

    const orders = [
        { id: 1001, product: 'Áo thun', amount: 250000 },
        { id: 1002, product: 'Giày sneaker', amount: 1200000 },
        { id: 1003, product: 'Túi xách', amount: 890000 }
    ];

    for (const order of orders) {
        await publisher.publish('orders', JSON.stringify(order));
        console.log(`[Server A] Published order #${order.id}`);
        await new Promise((r) => setTimeout(r, 500));
    }
}

async function main() {
    const { publisher, subscriber, isMock } = await createPubSub();

    await startSubscriber(subscriber, isMock);
    await startPublisher(publisher);

    console.log('\nUse case: Order service publish -> Notification/Analytics service subscribe');
    console.log('Production: npm install redis, chạy Redis server, set REDIS_URL');

    setTimeout(() => process.exit(0), 2000);
}

main().catch(console.error);
