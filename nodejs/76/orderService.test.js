// Bài 76: Unit Test với Mock DB và External API
// jest.mock() / mockImplementation thay thế dependency thật
// Chạy: npx jest 76/orderService.test.js

const { OrderService, UserRepository, PaymentApi } = require('./orderService');

describe('OrderService — Mock DB & External API', () => {
    let userRepo;
    let paymentApi;
    let orderService;

    beforeEach(() => {
        // Tạo mock object — không gọi DB/API thật
        userRepo = {
            findById: jest.fn(),
        };
        paymentApi = {
            charge: jest.fn(),
        };
        orderService = new OrderService(userRepo, paymentApi);
    });

    test('tạo order thành công khi user tồn tại và thanh toán OK', async () => {
        // Arrange: định nghĩa hành vi mock trả về
        userRepo.findById.mockResolvedValue({ id: 'u1', name: 'An' });
        paymentApi.charge.mockResolvedValue({
            status: 'paid',
            transactionId: 'TXN-123',
        });

        // Act
        const order = await orderService.createOrder('u1', 100000);

        // Assert
        expect(order.userId).toBe('u1');
        expect(order.amount).toBe(100000);
        expect(order.status).toBe('paid');
        expect(userRepo.findById).toHaveBeenCalledWith('u1');
        expect(paymentApi.charge).toHaveBeenCalledWith('u1', 100000);
    });

    test('ném lỗi khi user không tồn tại', async () => {
        userRepo.findById.mockResolvedValue(null);

        await expect(orderService.createOrder('u99', 50000)).rejects.toThrow(
            'Không tìm thấy user'
        );
        // Payment API không được gọi nếu user không tồn tại
        expect(paymentApi.charge).not.toHaveBeenCalled();
    });

    test('ném lỗi khi số tiền <= 0', async () => {
        await expect(orderService.createOrder('u1', 0)).rejects.toThrow(
            'Số tiền phải lớn hơn 0'
        );
        expect(userRepo.findById).not.toHaveBeenCalled();
    });

    test('mock class method bằng jest.spyOn', async () => {
        const repo = new UserRepository();
        const api = new PaymentApi();
        const service = new OrderService(repo, api);

        jest.spyOn(repo, 'findById').mockResolvedValue({ id: 'u2' });
        jest.spyOn(api, 'charge').mockResolvedValue({
            status: 'paid',
            transactionId: 'TXN-456',
        });

        const order = await service.createOrder('u2', 200000);
        expect(order.transactionId).toBe('TXN-456');
    });
});
