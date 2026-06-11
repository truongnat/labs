// Bài 28: Error Handling Middleware tập trung
// Middleware này bắt mọi lỗi từ các route/middleware khác

const express = require('express');
const app = express();

// Middleware xử lý lỗi - luôn phải có 4 tham số (err, req, res, next)
// Express sẽ tự động nhận diện đây là error middleware
const errorHandler = (err, req, res, next) => {
    console.error('Lỗi:', err.stack);
    
    // Kiểm tra môi trường
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Trả về thông báo lỗi
    // Khi production: chỉ trả về thông báo chung
    // Khi development: trả về chi tiết lỗi
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Lỗi server nội bộ',
        // Chỉ hiện stack trace ở môi trường development
        ...(isDevelopment && { stack: err.stack })
    });
};

// Route gây lỗi (ví dụ: database connection failed)
app.get('/api/error', (req, res, next) => {
    const error = new Error('Có lỗi xảy ra!');
    error.statusCode = 400; // Bad Request
    next(error); // Chuyển lỗi tới error handler
});

// Route không tồn tại
app.use((req, res, next) => {
    const error = new Error('Không tìm thấy API này');
    error.statusCode = 404;
    next(error);
});

// Đăng ký error handler CUỐI CÙNG (sau tất cả routes)
app.use(errorHandler);

app.listen(3000);