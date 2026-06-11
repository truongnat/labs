// Bài 14: Xử lý lỗi trong EventEmitter
// Khi EventEmitter phát sự kiện 'error', cần xử lý để tránh crash app

const { EventEmitter } = require('events');

const emitter = new EventEmitter();

// Đăng ký listener cho sự kiện error
// Nếu không có listener error, EventEmitter sẽ throw uncaught exception
emitter.on('error', (err) => {
    console.error('Có lỗi xảy ra:', err.message);
});

// Phát sự kiện error với đối tượng Error
emitter.emit('error', new Error('Kết nối database thất bại!'));

// Cách khác: sử dụng domain (deprecated) hoặc process.on('uncaughtException')
// Luôn luôn phải có listener cho error event trong EventEmitter