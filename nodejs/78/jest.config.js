// Bài 78: Cấu hình Jest — ngưỡng coverage tối thiểu 80%
// Chạy: npx jest --config 78/jest.config.js

module.exports = {
    testMatch: ['**/78/calculator.test.js'],
    collectCoverageFrom: ['78/calculator.js'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    coverageReporters: ['text', 'text-summary'],
};
