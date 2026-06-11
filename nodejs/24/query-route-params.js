// Bài 24: Xử lý Query Parameters và Route Parameters
// Query params dùng cho filter/search, Route params dùng cho resource ID

const express = require('express');
const app = express();

// Query Parameters - dùng cho phân trang, lọc, tìm kiếm
// Ví dụ: GET /api/users?page=1&limit=10&sort=name
app.get('/api/users', (req, res) => {
    // req.query chứa các query parameters
    // Khi không có thì trả về undefined, dùng || để set default
    const page = parseInt(req.query.page) || 1;    // Trang hiện tại
    const limit = parseInt(req.query.limit) || 10; // Số items/trang
    const sort = req.query.sort || 'id';           // Trường sắp xếp
    
    // Tính offset (bỏ qua bao nhiêu records)
    const skip = (page - 1) * limit;
    
    res.json({
        page,
        limit,
        sort,
        skip,
        message: 'Query params xử lý thành công'
    });
});

// Route Parameters - dùng để xác định resource cụ thể
// Ví dụ: GET /api/users/123
app.get('/api/users/:id', (req, res) => {
    // req.params chứa các route parameters
    // :id trong route sẽ được truy cập qua params.id
    const userId = req.params.id;
    
    // Kiểm tra id hợp lệ (phải là số)
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID phải là số' });
    }
    
    // Trả về thông tin user
    res.json({
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`
    });
});

// Route với nhiều parameters
// Ví dụ: GET /api/users/123/posts/456
app.get('/api/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    
    res.json({
        userId,
        postId,
        message: `Lấy post ${postId} của user ${userId}`
    });
});

// Middleware kiểm tra params trước khi route
app.get('/api/products/:id', (req, res, next) => {
    // Validate ID
    if (isNaN(req.params.id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    next();
}, (req, res) => {
    res.json({ productId: req.params.id });
});

app.listen(3000);