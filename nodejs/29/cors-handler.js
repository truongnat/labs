// Bài 29: Xử lý CORS (Cross-Origin Resource Sharing)
// CORS cho phép browser gọi API từ domain khác — mặc định browser chặn vì Same-Origin Policy
// Chạy bằng lệnh: cd 29 && npm install && node cors-handler.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3029;

// Cách 1: cors package — cấu hình chi tiết (khuyến nghị production)
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Cách 2: Custom middleware — hiểu cơ chế bên dưới thư viện
// (Comment block trên nếu muốn thử cách này thay cors package)
/*
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});
*/

app.get('/api/data', (req, res) => {
    res.json({
        message: 'Dữ liệu từ API — frontend domain khác có thể fetch nếu CORS đúng',
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`CORS demo: http://localhost:${PORT}/api/data`);
    console.log('Test từ browser console (origin khác): fetch("http://localhost:' + PORT + '/api/data")');
});
