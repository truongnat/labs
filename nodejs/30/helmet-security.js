// Bài 30: Cấu hình helmet để bảo mật HTTP Headers
// helmet giúp chặn các lỗ hổng phổ biến bằng cách set header bảo mật chuẩn
// Chạy bằng lệnh: cd 30 && npm install && node helmet-security.js

const express = require('express');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3030;

// helmet() gom nhiều middleware bảo mật — tránh phải tự set từng header
// Ví dụ: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security...
app.use(helmet());

// Tùy chỉnh CSP (Content Security Policy) — hạn chế nguồn script/style được load
// Quan trọng vì XSS thường inject script từ domain lạ
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
        },
    })
);

// Ẩn header X-Powered-By — không tiết lộ tech stack cho attacker
app.disable('x-powered-by');

app.get('/', (req, res) => {
    res.json({
        message: 'Server đã bật helmet — kiểm tra response headers bằng curl -I',
        tip: 'curl -I http://localhost:' + PORT,
    });
});

app.get('/api/users', (req, res) => {
    res.json([{ id: 1, name: 'Demo User' }]);
});

app.listen(PORT, () => {
    console.log(`Helmet demo: http://localhost:${PORT}`);
    console.log('Thử: curl -I http://localhost:' + PORT + '  → xem security headers');
});
