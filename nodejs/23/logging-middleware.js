// ============================================================
// Bài 23: Custom Middleware ghi log thời gian xử lý request
// ============================================================
// Middleware là một trong những khái niệm quan trọng nhất của Express
// Hiểu middleware = hiểu cách Express hoạt động
//
// Chạy bằng lệnh:
//   node logging-middleware.js
// Sau đó truy cập:
//   http://localhost:3000/api/test
//   http://localhost:3000/api/delay
//
// Quan sát console để xem log method, URL, status code, thời gian xử lý

// ============================================================
// Import Express
// ============================================================
// require('express') import thư viện Express framework
// Express cung cấp:
//   - Routing
//   - Middleware system
//   - Request/Response helpers
const express = require('express');

// ============================================================
// Tạo Express Application
// ============================================================
// express() tạo một instance của Express
// 'app' là object chứa tất cả cấu hình và routes
const app = express();

// ============================================================
// Custom Middleware: Ghi log request
// ============================================================
// Middleware là function chạy trước các routes
// Nó có thể:
//   - Đọc và sửa đổi req/res
//   - Thực hiện logic (logging, auth, validation)
//   - Gọi next() để chuyển sang middleware/route tiếp theo
//
// Cấu trúc middleware:
//   app.use((req, res, next) => {
//     // Code xử lý
//     next(); // Chuyển sang middleware/route tiếp theo
//   });
//
// 3 tham số:
//   - req: Request object - chứa thông tin từ client
//   - res: Response object - dùng để gửi response
//   - next: Function - gọi để chuyển sang middleware tiếp theo
app.use((req, res, next) => {

    // ============================================================
    // Ghi thời điểm bắt đầu xử lý request
    // ============================================================
    // Date.now() trả về số milliseconds từ Unix epoch
    // Ví dụ: 1718123456789
    //
    // Mục đích:
    //   - Lưu lại thời điểm request bắt đầu
    //   - Sau khi response gửi xong, tính thời gian xử lý
    //
    // Công thức:
    //   duration = Date.now() - startTime
    //
    // Ví dụ:
    //   startTime = 1000ms
    //   finish time = 1250ms
    //   duration = 250ms
    const startTime = Date.now();

    // ============================================================
    // Log thông tin request
    // ============================================================
    // console.log() in ra console để debug
    //
    // new Date().toISOString()
    // -------------------------
    // Tạo timestamp dạng ISO 8601
    // Ví dụ: 2024-06-11T14:30:00.000Z
    //
    // req.method
    // -------------------------
    // HTTP method của request
    // Ví dụ: GET, POST, PUT, DELETE
    //
    // req.url
    // -------------------------
    // URL path của request
    // Ví dụ: /api/users, /api/test
    //
    // Output ví dụ:
    //   [2024-06-11T14:30:00.000Z] GET /api/users
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // ============================================================
    // Lắng nghe sự kiện 'finish' của response
    // ============================================================
    // res.on('finish', callback)
    // -------------------------
    // Event 'finish' được phát khi response đã được gửi xong
    // Đây là thời điểm tốt để log thông tin sau khi xử lý xong
    //
    // res.on(event, callback)
    // -------------------------
    // Đây là EventEmitter pattern
    // Có thể lắng nghe các events:
    //   - 'finish': response đã gửi xong
    //   - 'close': connection đã đóng
    //   - 'error': có lỗi
    res.on('finish', () => {

        // ============================================================
        // Tính thời gian xử lý
        // ============================================================
        // Date.now() - startTime
        // -------------------------
        // Lấy thời điểm hiện tại trừ đi thời điểm bắt đầu
        // Kết quả là thời gian xử lý request (milliseconds)
        //
        // Ví dụ:
        //   Date.now() = 1718123457039
        //   startTime = 1718123456789
        //   duration = 250ms
        const duration = Date.now() - startTime;

        // ============================================================
        // Log status code và thời gian xử lý
        // ============================================================
        // res.statusCode
        // -------------------------
        // HTTP status code của response
        // Ví dụ:
        //   - 200: OK
        //   - 201: Created
        //   - 404: Not Found
        //   - 500: Internal Server Error
        //
        // Output ví dụ:
        //   Response: 200 - 250ms
        console.log(`Response: ${res.statusCode} - ${duration}ms`);
    });

    // ============================================================
    // Chuyển sang middleware/route tiếp theo
    // ============================================================
    // next() là function quan trọng nhất trong middleware
    //
    // Nếu KHÔNG gọi next():
    //   - Request sẽ bị treo (treo connection)
    //   - Client không nhận được response
    //   - Browser sẽ loading mãi
    //
    // Nếu gọi next():
    //   - Request được chuyển sang middleware tiếp theo
    //   - Hoặc route handler nếu không còn middleware nào
    //
    // Trong Express, middleware chạy tuần tự
    // Middleware 1 -> Middleware 2 -> Route handler
    next();
});

// ============================================================
// Route test
// ============================================================
// app.get(path, handler)
// -------------------------
// Định nghĩa route cho HTTP method GET
//
// path: '/api/test'
//   - URL mà client sẽ gọi
//
// handler: (req, res) => {}
//   - Function xử lý request
app.get('/api/test', (req, res) => {

    // ============================================================
    // Gửi response JSON
    // ============================================================
    // res.json(data)
    // -------------------------
    // Helper method của Express
    // Tự động:
    //   1. JSON.stringify(data)
    //   2. Set Content-Type: application/json
    //   3. Gửi response về client
    //
    // Response:
    //   Status: 200
    //   Body: {"message":"Test API"}
    res.json({ message: 'Test API' });
});

// ============================================================
// Route delay để test middleware
// ============================================================
// Route này cố ý delay 1 giây để test middleware logging
// Mục đích: xem thời gian xử lý có đúng ~1000ms không
//
// app.get('/api/delay', (req, res) => {})
// -------------------------
// Định nghĩa route GET cho /api/delay
app.get('/api/delay', (req, res) => {

    // ============================================================
    // Tạo delay bằng setTimeout
    // ============================================================
    // setTimeout(callback, milliseconds)
    // -------------------------
    // Chạy callback sau một khoảng thời gian
    //
    // Trong trường hợp này:
    //   - Sau 1000ms (1 giây), gửi response
    //   - Middleware sẽ log thời gian xử lý ~1000ms
    //
    // setTimeout(() => {
    //   res.json({ message: 'Response sau 1 giây' });
    // }, 1000);
    setTimeout(() => {

        // ============================================================
        // Gửi response sau delay
        // ============================================================
        // res.json(data) gửi JSON response
        //
        // Response:
        //   Status: 200
        //   Body: {"message":"Response sau 1 giây"}
        res.json({ message: 'Response sau 1 giây' });
    }, 1000); // 1000 milliseconds = 1 giây
});

// ============================================================
// Khởi động server
// ============================================================
// app.listen(port, callback)
// -------------------------
// Bắt đầu server lắng nghe trên port 3000
//
// Callback chạy khi server đã sẵn sàng
app.listen(3000, () => {
    console.log('Server chạy port 3000');
});