// Bài 78: Test Coverage > 80% — Module Calculator
// Viết đủ test để coverage vượt ngưỡng 80%
// Chạy test + coverage: npx jest 78 --coverage --collectCoverageFrom='78/calculator.js'

/**
 * Calculator — các phép toán cơ bản
 * Mỗi hàm cần có ít nhất 1 test case
 */
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error('Không thể chia cho 0');
    }
    return a / b;
}

function isEven(n) {
    return n % 2 === 0;
}

function factorial(n) {
    if (n < 0) throw new Error('n phải >= 0');
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

module.exports = { add, subtract, multiply, divide, isEven, factorial };
