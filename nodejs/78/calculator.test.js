// Bài 78: Demo Test Coverage > 80%
// Jest báo % dòng code được test cover
// Chạy: npx jest 78 --coverage --collectCoverageFrom='78/calculator.js'

const {
    add,
    subtract,
    multiply,
    divide,
    isEven,
    factorial,
} = require('./calculator');

describe('Calculator — Coverage Demo', () => {
    test('add', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });

    test('subtract', () => {
        expect(subtract(10, 4)).toBe(6);
    });

    test('multiply', () => {
        expect(multiply(3, 4)).toBe(12);
        expect(multiply(0, 5)).toBe(0);
    });

    test('divide bình thường', () => {
        expect(divide(10, 2)).toBe(5);
    });

    test('divide cho 0 ném lỗi', () => {
        expect(() => divide(10, 0)).toThrow('Không thể chia cho 0');
    });

    test('isEven', () => {
        expect(isEven(4)).toBe(true);
        expect(isEven(3)).toBe(false);
    });

    test('factorial', () => {
        expect(factorial(0)).toBe(1);
        expect(factorial(1)).toBe(1);
        expect(factorial(5)).toBe(120);
        expect(() => factorial(-1)).toThrow('n phải >= 0');
    });
});
