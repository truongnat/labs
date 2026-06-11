// Bài 22: Setup Express.js và tạo routing cơ bản
// Express.js là framework phổ biến nhất cho Node.js web server

const express = require('express'); // Import express framework
const app = express();

// Middleware parse JSON body - cần thiết cho API nhận JSON
app.use(express.json());

// Middleware parse URL-encoded data (form submit)
app.use(express.urlencoded({ extended: true }));

// Route GET - lấy danh sách users
app.get('/api/users', (req, res) => {
    // req (request) chứa thông tin từ client
    // res (response) dùng để trả về dữ liệu
    
    // Trả về JSON danh sách users mẫu
    const users = [
        { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com' },
        { id: 2, name: 'Trần Thị B', email: 'b@example.com' }
    ];
    
    // res.json() tự động set Content-Type: application/json
    // và stringify object thành JSON string
    res.json(users);
});

// Route POST - tạo user mới
// Dùng middleware express.json() ở trên để parse body
app.post('/api/users', (req, res) => {
    // req.body chứa dữ liệu gửi từ client (JSON)
    const newUser = req.body;
    
    // Thêm id giả lập (trong thực tế dùng DB auto-increment)
    newUser.id = Date.now();
    
    // Trả về status 201 (created) và dữ liệu user vừa tạo
    res.status(201).json(newUser);
});

// Route PUT - cập nhật user
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id; // Lấy ID từ URL params
    const updateData = req.body;
    
    // Trả về thông tin đã cập nhật
    res.json({ id: userId, ...updateData });
});

// Route DELETE - xóa user
app.delete('/api/users/:id', (req, res) => {
    // 204 No Content - thành công nhưng không trả về data
    res.status(204).send();
});

// Khởi động server trên port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server đang chạy tại http://localhost:${PORT}`);
});