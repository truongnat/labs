// ============================================================
// Bài 22: Setup Express.js và tạo routing cơ bản
// ============================================================
// Đây là bài đầu tiên dùng framework Express.js
// Express giúp viết server đơn giản hơn nhiều so với HTTP thuần
//
// Chạy bằng lệnh:
//   node express-routing.js
// Sau đó test bằng curl hoặc Postman:
//   GET  http://localhost:3000/api/users
//   POST http://localhost:3000/api/users
//   PUT  http://localhost:3000/api/users/123
//   DELETE http://localhost:3000/api/users/123

// ============================================================
// Import Express
// ============================================================
// require('express') import thư viện Express
// Express là framework web phổ biến nhất cho Node.js
// Cung cấp:
//   - Routing dễ dùng (app.get, app.post, app.put, app.delete)
//   - Middleware system
//   - Request/Response helpers
//   - Static file serving
//   - Error handling
//
// Lưu ý: Express không có sẵn trong Node.js
// Cần cài đặt bằng: npm install express
const express = require('express');

// ============================================================
// Tạo Express Application
// ============================================================
// express() tạo một instance của Express application
// 'app' là object chứa tất cả cấu hình và routes của server
//
// Khi request đến server, Express sẽ:
//   1. Chạy qua các middleware đã đăng ký (app.use)
//   2. Tìm route phù hợp với method + URL
//   3. Gọi handler của route đó
//   4. Gửi response về client
const app = express();

// ============================================================
// Middleware: Parse JSON Body
// ============================================================
// app.use() đăng ký middleware
// Middleware là function chạy trước mọi route
//
// express.json() là middleware built-in của Express
// Nó tự động parse JSON từ request body
//
// Ví dụ:
//   Client gửi: {"name":"John","email":"john@example.com"}
//   Express.json() parse thành: req.body = { name: 'John', email: 'john@example.com' }
//
// Không có middleware này, req.body sẽ là undefined
app.use(express.json());

// ============================================================
// Middleware: Parse URL-encoded Data
// ============================================================
// express.urlencoded() parse dữ liệu từ form submit
// Content-Type: application/x-www-form-urlencoded
//
// Ví dụ form HTML:
//   <form method="POST" action="/api/users">
//     <input name="name" value="John">
//     <input name="email" value="john@example.com">
//   </form>
//
// extended: true
// -------------------------
// Cho phép parse nested object
// Ví dụ: user[name]=John&user[email]=john@example.com
// sẽ thành: { user: { name: 'John', email: 'john@example.com' } }
//
// extended: false
// -------------------------
// Chỉ parse được flat object
// Dùng thư viện querystring (built-in)
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Route GET: Lấy danh sách users
// ============================================================
// app.get(path, handler)
// -------------------------
// Định nghĩa route cho HTTP method GET
//
// path: '/api/users'
//   - URL mà client sẽ gọi
//
// handler: (req, res) => {}
//   - req (Request): chứa thông tin từ client
//   - res (Response): dùng để gửi response về client
app.get('/api/users', (req, res) => {

    // ============================================================
    // Tạo dữ liệu mẫu
    // ============================================================
    // Trong thực tế, dữ liệu này sẽ lấy từ database
    // Ví dụ: const users = await User.find()
    //
    // Đây là mảng các object user
    // Mỗi user có các fields:
    //   - id: định danh duy nhất
    //   - name: tên người dùng
    //   - email: email liên hệ
    const users = [
        { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
        { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
    ];

    // ============================================================
    // Gửi response JSON
    // ============================================================
    // res.json(data)
    // -------------------------
    // Helper method của Express để gửi JSON response
    // Tự động làm 3 việc:
    //   1. JSON.stringify(data) - chuyển object thành JSON string
    //   2. Set header: Content-Type: application/json
    //   3. res.end() - gửi response về client
    //
    // So với HTTP thuần:
    //   res.writeHead(200, { 'Content-Type': 'application/json' });
    //   res.end(JSON.stringify(users));
    //
    // Express giúp code ngắn gọn hơn nhiều!
    res.json(users);
});

// ============================================================
// Route POST: Tạo user mới
// ============================================================
// app.post(path, handler)
// -------------------------
// Định nghĩa route cho HTTP method POST
// Dùng để tạo resource mới
//
// Ví dụ client gửi:
//   POST /api/users
//   Body: {"name":"Lê Văn C","email":"c@example.com"}
app.post('/api/users', (req, res) => {

    // ============================================================
    // Lấy dữ liệu từ request body
    // ============================================================
    // req.body chứa dữ liệu JSON đã được parse bởi express.json()
    // Nếu client gửi {"name":"Lê Văn C","email":"c@example.com"}
    // thì req.body = { name: 'Lê Văn C', email: 'c@example.com' }
    const newUser = req.body;

    // ============================================================
    // Thêm id giả lập
    // ============================================================
    // Trong thực tế, database sẽ tự tạo id (MongoDB ObjectId)
    // Ở đây dùng Date.now() để tạo id duy nhất tạm thời
    //
    // Date.now() trả về số milliseconds từ Unix epoch
    // Ví dụ: 1718123456789
    // Xác suất trùng rất thấp
    newUser.id = Date.now();

    // ============================================================
    // Gửi response với status 201
    // ============================================================
    // res.status(code)
    // -------------------------
    // Set HTTP status code cho response
    //
    // 201 = Created
    // Ý nghĩa: Resource đã được tạo thành công
    //
    // res.json(newUser)
    // -------------------------
    // Gửi dữ liệu user vừa tạo về client
    //
    // Response sẽ có:
    //   - Status: 201
    //   - Body: { id: 1718123456789, name: 'Lê Văn C', email: 'c@example.com' }
    res.status(201).json(newUser);
});

// ============================================================
// Route PUT: Cập nhật user
// ============================================================
// app.put(path, handler)
// -------------------------
// Định nghĩa route cho HTTP method PUT
// Dùng để cập nhật toàn bộ resource
//
// Route params:
//   '/api/users/:id'
//   - :id là route parameter
//   - Client gọi /api/users/123 thì id = '123'
//
// Ví dụ:
//   PUT /api/users/123
//   Body: {"name":"Nguyễn Văn D","email":"d@example.com"}
app.put('/api/users/:id', (req, res) => {

    // ============================================================
    // Lấy route parameter
    // ============================================================
    // req.params chứa các route parameters
    // Với route '/api/users/:id':
    //   - req.params.id = '123' (khi gọi /api/users/123)
    //
    // Route params khác với query params:
    //   - Route params: /api/users/123 (req.params.id)
    //   - Query params: /api/users?id=123 (req.query.id)
    const userId = req.params.id;

    // ============================================================
    // Lấy dữ liệu cập nhật từ body
    // ============================================================
    // req.body chứa JSON đã parse
    // Ví dụ: { name: 'Nguyễn Văn D', email: 'd@example.com' }
    const updateData = req.body;

    // ============================================================
    // Trả về dữ liệu đã cập nhật
    // ============================================================
    // Spread operator (...) copy các properties từ updateData
    // Kết hợp với id
    //
    // Kết quả:
    //   { id: '123', name: 'Nguyễn Văn D', email: 'd@example.com' }
    res.json({ id: userId, ...updateData });
});

// ============================================================
// Route DELETE: Xóa user
// ============================================================
// app.delete(path, handler)
// -------------------------
// Định nghĩa route cho HTTP method DELETE
// Dùng để xóa resource
//
// Ví dụ:
//   DELETE /api/users/123
app.delete('/api/users/:id', (req, res) => {

    // ============================================================
    // Gửi response 204 No Content
    // ============================================================
    // 204 = No Content
    // Ý nghĩa: Thao tác thành công nhưng không có data trả về
    //
    // res.send()
    // -------------------------
    // Gửi response không có body
    //
    // Khi xóa resource, thường không cần trả về dữ liệu
    // Chỉ cần status code để client biết đã thành công
    res.status(204).send();
});

// ============================================================
// Khởi động server
// ============================================================
// PORT = process.env.PORT || 3000
// -------------------------
// Lấy port từ biến môi trường nếu có
// Nếu không có, dùng mặc định 3000
//
// Khi deploy lên server:
//   - Heroku, Railway, Render thường set process.env.PORT
//   - Khi chạy local, không có biến này, dùng 3000
const PORT = process.env.PORT || 3000;

// ============================================================
// app.listen(port, callback)
// ============================================================
// Bắt đầu server lắng nghe trên port
//
// Callback chạy khi server đã sẵn sàng
// Đây là lúc in log thông báo cho developer biết server đã chạy
app.listen(PORT, () => {
    console.log(`Express server đang chạy tại http://localhost:${PORT}`);
});