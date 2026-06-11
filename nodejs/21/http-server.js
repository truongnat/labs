// ============================================================
// Bài 21: Tạo HTTP Server thuần (không dùng Express)
// ============================================================
// Đây là bài đầu tiên trong phần Web Server
// Mục tiêu: hiểu cách HTTP server hoạt động ở cấp thấp nhất
// Không dùng framework (Express/Fastify) để nắm bản chất
//
// Chạy bằng lệnh:
//   node http-server.js
// Sau đó truy cập:
//   http://localhost:3000/
//   http://localhost:3000/api
//   http://localhost:3000/api/users

// ============================================================
// Import các module built-in của Node.js
// ============================================================

// require('http') import module HTTP built-in
// Module này cung cấp các function để tạo web server
// Không cần npm install vì đã có sẵn trong Node.js runtime
const http = require('http');

// require('fs') import File System module
// Dùng để đọc/ghi file trong bài này
// Ví dụ: đọc file HTML, CSS, images để gửi cho client
const fs = require('fs');

// require('path') import Path module
// Dùng để xử lý đường dẫn file an toàn trên mọi hệ điều hành
// path.join() tự động xử lý dấu / hoặc \ tùy OS
const path = require('path');

// ============================================================
// Tạo HTTP Server
// ============================================================
// http.createServer(callback) tạo một web server
// Callback này sẽ được gọi MỖI KHI có request từ client
//
// Tham số:
// - req (IncomingMessage): chứa thông tin request từ client
//   + req.method: GET, POST, PUT, DELETE...
//   + req.url: path của request (ví dụ: /api/users)
//   + req.headers: các header gửi từ client
//
// - res (ServerResponse): dùng để gửi response về client
//   + res.writeHead(statusCode, headers): gửi status code và headers
//   + res.end(data): gửi body và kết thúc response
const server = http.createServer((req, res) => {

    // ============================================================
    // Logging request
    // ============================================================
    // In ra thông tin request để debug
    // req.method: phương thức HTTP (GET, POST, PUT, DELETE)
    // req.url: đường dẫn URL mà client yêu cầu
    //
    // Ví dụ output:
    //   GET /
    //   GET /api/users
    //   POST /api
    console.log(`${req.method} ${req.url}`);

    // ============================================================
    // Routing cơ bản
    // ============================================================
    // Routing là việc phân loại request dựa trên URL
    // Mỗi route sẽ xử lý một chức năng khác nhau

    // ----------------------------------------------------------
    // Route 1: Trang chủ (/)
    // ----------------------------------------------------------
    // Khi client truy cập http://localhost:3000/
    // URL sẽ là "/" (root path)
    if (req.url === '/') {

        // res.writeHead(statusCode, headers)
        // -------------------------
        // Gửi HTTP status code và headers về client
        // 200 = OK (thành công)
        // Content-Type: text/html; charset=utf-8
        //   - text/html: trình duyệt hiểu đây là HTML
        //   - charset=utf-8: mã hóa UTF-8 để hiển thị tiếng Việt
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        // res.end(data)
        // -------------------------
        // Gửi body của response và kết thúc
        // Body là HTML string
        // <h1>...</h1> là thẻ heading cấp 1
        res.end('<h1>Trang chủ - HTTP Server thuần</h1>');

    // ----------------------------------------------------------
    // Route 2: API endpoint (/api)
    // ----------------------------------------------------------
    // Khi client truy cập http://localhost:3000/api
    // Đây là endpoint trả về JSON
    } else if (req.url === '/api') {

        // res.writeHead(200, { 'Content-Type': 'application/json' })
        // -------------------------
        // 200 = OK
        // application/json = nói client đây là JSON data
        res.writeHead(200, { 'Content-Type': 'application/json' });

        // JSON.stringify(object)
        // -------------------------
        // Chuyển JavaScript object thành JSON string
        // Vì HTTP chỉ truyền được text, không truyền được object
        //
        // { message: 'API response', status: 'success' }
        //   - message: thông báo trả về
        //   - status: trạng thái của request
        res.end(JSON.stringify({ message: 'API response', status: 'success' }));

    // ----------------------------------------------------------
    // Route 3: API lấy danh sách users (/api/users)
    // ----------------------------------------------------------
    // Khi client truy cập http://localhost:3000/api/users
    // Đây là endpoint RESTful để lấy danh sách users
    } else if (req.url === '/api/users') {

        // Tạo mảng users mẫu
        // Mỗi user là một object với các properties:
        //   - id: định danh duy nhất
        //   - name: tên người dùng
        const users = [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' }
        ];

        // Gửi response với status 200 và Content-Type JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });

        // Chuyển mảng users thành JSON string và gửi về client
        res.end(JSON.stringify(users));

    // ----------------------------------------------------------
    // Route mặc định: 404 Not Found
    // ----------------------------------------------------------
    // Khi client truy cập URL không tồn tại
    // Ví dụ: /abc, /xyz, /api/not-found
    } else {

        // res.writeHead(404, { 'Content-Type': 'text/plain' })
        // -------------------------
        // 404 = Not Found (không tìm thấy)
        // text/plain = trả về text thuần (không phải HTML/JSON)
        res.writeHead(404, { 'Content-Type': 'text/plain' });

        // Gửi thông báo lỗi 404
        res.end('404 - Không tìm thấy trang');
    }
});

// ============================================================
// Lắng nghe kết nối
// ============================================================
// server.listen(port, callback) bắt đầu server lắng nghe trên port
//
// PORT = process.env.PORT || 3000
// -------------------------
// Lấy port từ biến môi trường nếu có
// Nếu không có, dùng mặc định là 3000
//
// process.env.PORT:
//   - Khi chạy trong Docker/Kubernetes, port được set từ môi trường
//   - Khi chạy local, không có biến này, dùng 3000
const PORT = process.env.PORT || 3000;

// Bắt đầu server
server.listen(PORT, () => {
    // Callback này chạy khi server đã sẵn sàng nhận request
    console.log(`HTTP Server đang chạy tại http://localhost:${PORT}`);
});

// ============================================================
// Graceful Shutdown
// ============================================================
// server.close() dùng để dừng server một cách lịch sự
//
// process.on('SIGTERM', callback)
// -------------------------
// Lắng nghe tín hiệu SIGTERM (khi Docker stop, PM2 stop, hoặc Ctrl+C)
// Khi nhận tín hiệu, thực hiện cleanup trước khi thoát
process.on('SIGTERM', () => {
    // Đóng server để không nhận request mới
    server.close(() => {
        // Callback chạy khi server đã đóng hoàn toàn
        console.log('Server đã dừng');
    });
});