// Bài 43: Implement Refresh Token & Access Token flow
// Access token ngắn hạn (API) + Refresh token dài hạn (renew) — giảm rủi ro token bị lộ
// Chạy bằng lệnh: cd 43 && npm install && node refresh-token-flow.js

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3043;
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret-demo';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-demo';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

// Refresh token store in-memory (production: lưu Redis/DB, có thể revoke)
const refreshTokenStore = new Map();

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

function createAccessToken(user) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES,
    });
}

function createRefreshToken(user) {
    const token = generateRefreshToken();
    refreshTokenStore.set(token, {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: Date.now(),
    });
    return token;
}

function authenticateAccess(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Thiếu access token' });
    }

    try {
        req.user = jwt.verify(auth.split(' ')[1], ACCESS_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Access token hết hạn hoặc không hợp lệ',
            hint: 'Gọi POST /api/refresh với refreshToken',
        });
    }
}

const demoUser = { id: 1, email: 'user@test.com', role: 'user' };

// Login — trả cả access + refresh token
app.post('/api/login', (req, res) => {
    const accessToken = createAccessToken(demoUser);
    const refreshToken = createRefreshToken(demoUser);

    res.json({
        accessToken,
        refreshToken,
        expiresIn: ACCESS_EXPIRES,
        tokenType: 'Bearer',
    });
});

// Refresh — đổi refresh token lấy access token mới (rotation optional)
app.post('/api/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokenStore.has(refreshToken)) {
        return res.status(401).json({ error: 'Refresh token không hợp lệ' });
    }

    const stored = refreshTokenStore.get(refreshToken);

    // Token rotation: xóa cũ, cấp mới — phát hiện reuse attack
    refreshTokenStore.delete(refreshToken);

    const user = { id: stored.userId, email: stored.email, role: stored.role };
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_EXPIRES,
    });
});

// Protected route — chỉ cần access token
app.get('/api/protected', authenticateAccess, (req, res) => {
    res.json({ message: 'Truy cập thành công', user: req.user });
});

// Logout — revoke refresh token
app.post('/api/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) refreshTokenStore.delete(refreshToken);
    res.json({ message: 'Đã revoke refresh token' });
});

app.listen(PORT, () => {
    console.log(`Refresh token flow: http://localhost:${PORT}`);
    console.log('Flow: POST /api/login → dùng accessToken → hết hạn → POST /api/refresh');
});
