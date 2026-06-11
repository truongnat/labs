// Bài 75: Unit Test hàm tiện ích bằng Jest
// Chạy bằng lệnh: npx jest 75/math.test.js

const { add, divide } = require('./math');

describe('Math functions', () => {
    test('add 2 số dương', () => {
        expect(add(2, 3)).toBe(5);
    });

    test('add số âm', () => {
        expect(add(-1, 1)).toBe(0);
    });

    test('divide bình thường', () => {
        expect(divide(10, 2)).toBe(5);
    });

    test('divide cho 0 ném lỗi', () => {
        expect(() => divide(10, 0)).toThrow('Không thể chia cho 0');
    });
});
