// Bài 23: Custom Middleware ghi log thời gian xử lý request

const express = require('express');
const app = express();

// Middleware ghi log - chạy trước mọi route
// req, res, next là ba tham số chuẩn của middleware
app.use((req, res, next) => {
    // Ghi thời điểm bắt đầu xử lý request
    const startTime = Date.now();
    
    // Log method (GET, POST, PUT...) và URL
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Khi response gửi về client, tính thời gian xử lý
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        // Log thời gian xử lý và status code
        console.log(`Response: ${res.statusCode} - ${duration}ms`);
    });
    
    // next() để chuyển sang middleware hoặc route tiếp theo
    next();
});

// Route test
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test API' });
});

// Route delay để test middleware
app.get('/api/delay', (req, res) => {
    setTimeout(() => {
        res.json({ message: 'Response sau 1 giây' });
    }, 1000);
});

app.listen(3000, () => console.log('Server chạy port 3000'));