// Bài 52: Ghi log file bằng Writable Stream
// Ghi log liên tục mà không block main thread

const fs = require('fs');
const path = require('path');

// Tạo writable stream ghi log
const logStream = fs.createWriteStream(
    path.join(__dirname, 'app.log'),
    { flags: 'a' } // Append mode - ghi tiếp vào file
);

// Hàm ghi log với thời gian
function writeLog(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
    
    // Ghi vào stream - không block
    logStream.write(logEntry);
    console.log(logEntry.trim());
}

// Ghi log mẫu
writeLog('info', 'Server khởi động thành công');
writeLog('warn', 'Cảnh báo: Bộ nhớ đang giảm');
writeLog('error', 'Lỗi kết nối database');

// Auto-flush mỗi 5 giây để đảm bảo log được ghi
setInterval(() => {
    logStream.write(`[${new Date().toISOString()}] DEBUG: Heartbeat\n`);
}, 5000);

// Đóng stream khi process kết thúc
process.on('exit', () => {
    logStream.end();
    console.log('Log stream đã đóng');
});

// Lưu ý:
// - Writable stream mặc định buffer, dùng { flags: 'a' } để append
// - Có thể dùng fs.createWriteStream với encoding: 'utf-8'
// - Trong production nên dùng thư viện logging như Winston/Pino