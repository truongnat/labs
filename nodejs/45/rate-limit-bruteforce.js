// Bài 45: Chống Brute-force Attack bằng express-rate-limit
// Giới hạn số request/IP trong cửa sổ thời gian — làm chậm đoán password
// Chạy bằng lệnh: cd 45 && npm install && node rate-limit-bruteforce.js

const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3045;

// Rate limit chung cho toàn API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều request — thử lại sau 15 phút' },
});

app.use('/api/', apiLimiter);

// Rate limit nghiêm cho login — chống brute-force password
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        error: 'Quá nhiều lần đăng nhập sai',
        retryAfter: '15 phút',
    },
    handler: (req, res, next, options) => {
        console.warn(`⚠️  Brute-force attempt blocked: ${req.ip} → ${req.path}`);
        res.status(429).json(options.message);
    },
});

const VALID = { email: 'admin@test.com', password: 'Secret@123' };

app.post('/api/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;

    if (email === VALID.email && password === VALID.password) {
        return res.json({ message: 'Đăng nhập thành công', token: 'demo-token' });
    }

    res.status(401).json({ error: 'Email hoặc password sai' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Rate limit demo: http://localhost:${PORT}`);
    console.log('Thử brute-force (sẽ bị 429 sau 5 lần sai):');
    console.log(`  for i in {1..7}; do curl -s -X POST http://localhost:${PORT}/api/login -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'; echo; done`);
});
