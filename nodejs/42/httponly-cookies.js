// Bài 42: Xử lý Cookie (cookie-parser) và HttpOnly Cookie
// HttpOnly ngăn JavaScript đọc cookie → giảm rủi ro XSS đánh cắp session
// Chạy bằng lệnh: cd 42 && npm install && node httponly-cookies.js

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3042;
const JWT_SECRET = process.env.JWT_SECRET || 'cookie-demo-secret';

app.use(express.json());
app.use(cookieParser());

// Login — set token vào HttpOnly cookie thay vì trả về body
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Thiếu email/password' });
    }

    const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

    // httpOnly: JS không đọc được document.cookie
    // secure: chỉ gửi qua HTTPS (bật khi deploy production)
    // sameSite: 'strict' chống CSRF cơ bản
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
    });

    res.json({ message: 'Đăng nhập thành công — token lưu trong HttpOnly cookie' });
});

// Middleware đọc token từ cookie (không cần Authorization header)
function authFromCookie(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Cookie token hết hạn hoặc không hợp lệ' });
    }
}

app.get('/api/me', authFromCookie, (req, res) => {
    res.json({ user: req.user });
});

// Logout — xóa cookie bằng cách set maxAge=0
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, path: '/' });
    res.json({ message: 'Đã đăng xuất' });
});

// Cookie thường (JS đọc được) — demo so sánh rủi ro
app.get('/api/set-theme', (req, res) => {
    res.cookie('theme', 'dark', { httpOnly: false, maxAge: 86400000 });
    res.json({ message: 'theme cookie không HttpOnly — OK cho preference UI' });
});

app.listen(PORT, () => {
    console.log(`HttpOnly cookie demo: http://localhost:${PORT}`);
    console.log('Thử với curl (lưu cookie vào file):');
    console.log(`  curl -c cookies.txt -X POST http://localhost:${PORT}/api/login -H "Content-Type: application/json" -d '{"email":"a@test.com","password":"123"}'`);
    console.log(`  curl -b cookies.txt http://localhost:${PORT}/api/me`);
});
