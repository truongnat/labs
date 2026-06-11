// Bài 83: Dependency Injection (DI) trong Node.js
// Demo 2 cách: Manual DI (không thư viện) và tsyringe-style container
// Chạy demo: node 83/dependency-injection.js

// ═══════════════════════════════════════════════════════════
// CÁCH 1: MANUAL DI — inject dependency qua constructor
// Đơn giản, rõ ràng, phù hợp project nhỏ-vừa
// ═══════════════════════════════════════════════════════════

class EmailService {
    async send(to, subject, body) {
        return { sent: true, to, subject, body };
    }
}

class NotificationService {
    constructor(emailService) {
        this.emailService = emailService; // Dependency được inject
    }

    async notifyUser(email, message) {
        return this.emailService.send(email, 'Thông báo', message);
    }
}

function manualDI() {
    const emailService = new EmailService();
    const notificationService = new NotificationService(emailService);
    return notificationService;
}

// ═══════════════════════════════════════════════════════════
// CÁCH 2: DI CONTAINER — đăng ký và resolve tự động
// Mô phỏng tsyringe/inversify không cần cài package
// ═══════════════════════════════════════════════════════════

class DIContainer {
    constructor() {
        this.services = new Map();
        this.factories = new Map();
    }

    // Đăng ký singleton instance
    register(token, instance) {
        this.services.set(token, instance);
    }

    // Đăng ký factory function — tạo instance khi resolve
    registerFactory(token, factory) {
        this.factories.set(token, factory);
    }

    resolve(token) {
        if (this.services.has(token)) {
            return this.services.get(token);
        }
        if (this.factories.has(token)) {
            const instance = this.factories.get(token)(this);
            this.services.set(token, instance); // Cache singleton
            return instance;
        }
        throw new Error(`Service '${token}' chưa được đăng ký`);
    }
}

// === Services dùng với Container ===
class Logger {
    info(msg) {
        console.log(`[INFO] ${msg}`);
    }
}

class OrderRepository {
    constructor(logger) {
        this.logger = logger;
        this.orders = [];
    }

    save(order) {
        this.logger.info(`Lưu order ${order.id}`);
        this.orders.push(order);
        return order;
    }
}

class OrderServiceDI {
    constructor(orderRepo, logger) {
        this.orderRepo = orderRepo;
        this.logger = logger;
    }

    createOrder(items) {
        const order = { id: `ORD-${Date.now()}`, items, status: 'pending' };
        this.logger.info(`Tạo order ${order.id}`);
        return this.orderRepo.save(order);
    }
}

function setupContainer() {
    const container = new DIContainer();

    container.registerFactory('logger', () => new Logger());
    container.registerFactory('orderRepo', (c) =>
        new OrderRepository(c.resolve('logger'))
    );
    container.registerFactory('orderService', (c) =>
        new OrderServiceDI(c.resolve('orderRepo'), c.resolve('logger'))
    );

    return container;
}

// ═══════════════════════════════════════════════════════════
// CÁCH 3: tsyringe (comment) — dùng decorator khi có TypeScript
// ═══════════════════════════════════════════════════════════
/*
import 'reflect-metadata';
import { injectable, inject, container } from 'tsyringe';

@injectable()
class EmailService { ... }

@injectable()
class NotificationService {
    constructor(@inject(EmailService) private email: EmailService) {}
}

container.register(EmailService, { useClass: EmailService });
const service = container.resolve(NotificationService);
*/

// === DEMO ===
async function demo() {
    console.log('--- Manual DI ---');
    const notify = manualDI();
    const result = await notify.notifyUser('user@test.com', 'Chào bạn!');
    console.log(result);

    console.log('\n--- DI Container ---');
    const container = setupContainer();
    const orderService = container.resolve('orderService');
    const order = orderService.createOrder(['item1', 'item2']);
    console.log('Order:', order);
}

if (require.main === module) {
    demo();
}

module.exports = {
    DIContainer,
    NotificationService,
    EmailService,
    setupContainer,
    manualDI,
};
