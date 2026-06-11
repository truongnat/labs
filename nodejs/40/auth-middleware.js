// Bài 40: Middleware protect chặn route nếu chưa login
// Middleware này dùng để bảo vệ route yêu cầu xác thực

const jwt = require('jsonwebtoken');

// Middleware kiểm tra token hợp lệ
const protect = (req, res, next) => {
    // Lấy Authorization header
    // Format: "Bearer <token>"
    let token;
    
    // Kiểm tra token từ header Authorization
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Hoặc từ cookie (nếu dùng cookie-parser)
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    
    // Không có token = chưa đăng nhập
    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Bạn cần đăng nhập để truy cập'
        });
    }
    
    try {
        // Xác thực token
        // decoded chứa thông tin user đã lưu trong token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin user vào request để controller dùng
        req.user = decoded;
        
        // Chuyển sang middleware/controller tiếp theo
        next();
    } catch (error) {
        // Token không hợp lệ hoặc hết hạn
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
};

// Middleware kiểm tra quyền admin
const adminOnly = (req, res, next) => {
    // requireRole phải gọi sau protect để req.user tồn tại
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }
    next();
};

module.exports = { protect, adminOnly };

// Sử dụng trong Express:
// const { protect, adminOnly } = require('./middleware/auth');
// app.get('/api/protected', protect, (req, res) => {...}); // Chỉ user đã login
// app.get('/api/admin', protect, adminOnly, (req, res) => {...}); // Chỉ admin