// Bài 74: Message Queue Pub/Sub (RabbitMQ/Kafka pattern)
// Decouple services: Producer gửi message, Consumer xử lý bất đồng bộ
// Chạy bằng lệnh: node message-queue.js
// RabbitMQ thật: npm install amqplib && node message-queue.js --rabbitmq

const { EventEmitter } = require('events');

// --- Mock Message Broker (simulate RabbitMQ/Kafka) ---
class MockMessageBroker {
    constructor() {
        this.topics = new Map(); // topic -> [handlers]
    }

    publish(topic, message) {
        const handlers = this.topics.get(topic) || [];
        const payload = { topic, message, timestamp: Date.now() };
        handlers.forEach((handler) => setImmediate(() => handler(payload)));
        return Promise.resolve(true);
    }

    subscribe(topic, handler) {
        if (!this.topics.has(topic)) this.topics.set(topic, []);
        this.topics.get(topic).push(handler);
    }
}

// --- RabbitMQ implementation (optional) ---
async function createBroker() {
    if (process.argv.includes('--rabbitmq')) {
        try {
            const amqp = require('amqplib');
            const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            const channel = await conn.createChannel();
            const exchange = 'orders';

            await channel.assertExchange(exchange, 'fanout', { durable: false });
            console.log('[RabbitMQ] Connected');

            return {
                publish: async (topic, message) => {
                    channel.publish(exchange, '', Buffer.from(JSON.stringify({ topic, message })));
                },
                subscribe: async (topic, handler) => {
                    const { queue } = await channel.assertQueue('', { exclusive: true });
                    await channel.bindQueue(queue, exchange, '');
                    channel.consume(queue, (msg) => {
                        const data = JSON.parse(msg.content.toString());
                        handler(data);
                        channel.ack(msg);
                    });
                },
                isMock: false
            };
        } catch (err) {
            console.log('[RabbitMQ] Fallback mock:', err.message);
        }
    }

    const broker = new MockMessageBroker();
    return {
        publish: (topic, message) => broker.publish(topic, message),
        subscribe: (topic, handler) => broker.subscribe(topic, handler),
        isMock: true
    };
}

// --- Services ---
function startEmailService(broker) {
    broker.subscribe('order.created', (event) => {
        console.log(`[Email Service] Gửi email xác nhận đơn #${event.message.orderId}`);
    });
    console.log('[Email Service] Subscribed: order.created');
}

function startAnalyticsService(broker) {
    broker.subscribe('order.created', (event) => {
        console.log(`[Analytics] Track purchase: ${event.message.product} - ${event.message.amount}đ`);
    });
    console.log('[Analytics Service] Subscribed: order.created');
}

function startInventoryService(broker) {
    broker.subscribe('order.created', (event) => {
        console.log(`[Inventory] Trừ kho sản phẩm: ${event.message.product}`);
    });
    console.log('[Inventory Service] Subscribed: order.created');
}

async function main() {
    const broker = await createBroker();

    console.log(`Mode: ${broker.isMock ? 'Mock EventEmitter' : 'RabbitMQ'}\n`);

    // Consumer services subscribe
    startEmailService(broker);
    startAnalyticsService(broker);
    startInventoryService(broker);

    // Producer: Order service publish event
    console.log('\n[Order Service] Publishing orders...\n');

    const orders = [
        { orderId: 1001, product: 'Laptop', amount: 25000000 },
        { orderId: 1002, product: 'Chuột', amount: 500000 }
    ];

    for (const order of orders) {
        await broker.publish('order.created', order);
        console.log(`[Order Service] Published order #${order.orderId}`);
        await new Promise((r) => setTimeout(r, 300));
    }

    console.log('\nPattern: Order Service -> Queue -> Email + Analytics + Inventory');
    console.log('Kafka: dùng topic + consumer group | RabbitMQ: exchange + queue binding');

    setTimeout(() => process.exit(0), 1000);
}

main().catch(console.error);
