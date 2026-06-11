// Bài 21: Tạo HTTP Server thuần (không dùng Express)
// Node.js có module http built-in để tạo web server

const http = require('http');
const fs = require('fs');
const path = require('path');

// Tạo HTTP server - callback nhận request và response
const server = http.createServer((req, res) => {
    // req: IncomingMessage - chứa thông tin request từ client
    // res: ServerResponse - dùng để gửi response về client
    
    console.log(`${req.method} ${req.url}`); // Log method và URL
    
    // Xử lý routing cơ bản
    if (req.url === '/') {
        // Thiết lập header cho response
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Trang chủ - HTTP Server thuần</h1>');
        
    } else if (req.url === '/api') {
        // Trả về JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API response', status: 'success' }));
        
    } else if (req.url === '/api/users') {
        // API trả về danh sách users
        const users = [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
        
    } else {
        // Trả về lỗi 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Không tìm thấy trang');
    }
});

// Lắng nghe kết nối trên port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HTTP Server đang chạy tại http://localhost:${PORT}`);
});

// Để dừng server: server.close()
// Xử lý graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server đã dừng');
    });
});