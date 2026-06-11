// Jest config chung cho các bài test (75-79)
// Chạy tất cả test: npx jest
// Chạy 1 bài: npx jest 76/orderService.test.js

module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js', '**/*.integration.test.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: [
        '**/*.js',
        '!**/*.test.js',
        '!**/*.integration.test.js',
        '!jest.config.js',
    ],
};
