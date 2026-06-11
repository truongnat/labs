// Bài 76: Mock Database và External APIs trong Unit Test (Jest)
// Service gọi DB và API bên ngoài — sẽ được mock khi test
// Chạy test: npx jest 76/orderService.test.js

/**
 * Repository giả lập truy cập database
 * Trong production: thay bằng Mongoose/Prisma
 */
class UserRepository {
    async findById(id) {
        throw new Error('Phải mock findById trong unit test');
    }
}

/**
 * Client gọi Payment Gateway (Stripe, VNPay, v.v.)
 */
class PaymentApi {
    async charge(userId, amount) {
        throw new Error('Phải mock charge trong unit test');
    }
}

/**
 * OrderService — logic nghiệp vụ cần test
 * Phụ thuộc vào UserRepository và PaymentApi
 */
class OrderService {
    constructor(userRepo, paymentApi) {
        this.userRepo = userRepo;
        this.paymentApi = paymentApi;
    }

    async createOrder(userId, amount) {
        if (amount <= 0) {
            throw new Error('Số tiền phải lớn hơn 0');
        }

        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy user');
        }

        const payment = await this.paymentApi.charge(userId, amount);
        return {
            orderId: `ORD-${Date.now()}`,
            userId,
            amount,
            status: payment.status,
            transactionId: payment.transactionId,
        };
    }
}

module.exports = { OrderService, UserRepository, PaymentApi };
