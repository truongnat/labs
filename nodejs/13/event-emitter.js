// Bài 13: Tạo EventEmitter tùy chỉnh
// EventEmitter là cơ chế xử lý sự kiện (event-driven) trong Node.js
// Giúp các module trong ứng dụng giao tiếp với nhau

const { EventEmitter } = require('events');

// Tạo class kế thừa từ EventEmitter
class UserEvent extends EventEmitter {}

// Khởi tạo instance
const userEvent = new UserEvent();

// Đăng ký lắng nghe sự kiện 'login'
userEvent.on('login', (username) => {
    console.log(`Người dùng ${username} đã đăng nhập`);
});

// Đăng ký lắng nghe sự kiện 'logout'
userEvent.on('logout', (username) => {
    console.log(`Người dùng ${username} đã đăng xuất`);
});

// Phát (emit) sự kiện login
userEvent.emit('login', 'john_doe');

// Phát sự kiện logout
userEvent.emit('logout', 'john_doe');

// Các method quan trọng khác:
// - once(): chỉ lắng nghe 1 lần rồi tự remove
// - removeListener(): xóa listener cụ thể
// - removeAllListeners(): xóa tất cả listener
// - eventNames(): trả về mảng tên các sự kiện đang lắng nghe