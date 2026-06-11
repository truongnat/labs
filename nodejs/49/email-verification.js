// Bài 49: Gửi Email xác thực tài khoản dùng Nodemailer (mock transport)
// Mock transport ghi email ra console — không cần SMTP thật khi học/demo
// Chạy bằng lệnh: cd 49 && npm install && node email-verification.js

const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3049;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// In-memory user store + verification tokens
const users = new Map();
const verificationTokens = new Map();

// Mock transport — in production dùng SMTP/Gmail/SendGrid
const transporter = nodemailer.createTransport({
    jsonTransport: true,
});

async function sendVerificationEmail(email, token) {
    const verifyUrl = `${APP_URL}/api/verify?token=${token}`;

    const info = await transporter.sendMail({
        from: '"Demo App" <noreply@demo.app>',
        to: email,
        subject: 'Xác thực tài khoản của bạn',
        html: `
            <h2>Chào mừng!</h2>
            <p>Nhấn link bên dưới để xác thực email (hết hạn sau 24h):</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
        `,
    });

    const parsed = JSON.parse(info.message);
    console.log('\n📧 [MOCK EMAIL]');
    console.log('  To:', parsed.to);
    console.log('  Subject:', parsed.subject);
    console.log('  Verify URL:', verifyUrl);
    console.log('');
}

function createVerificationToken(email) {
    const token = crypto.randomBytes(32).toString('hex');
    verificationTokens.set(token, {
        email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return token;
}

app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Thiếu email/password' });
    }

    if (users.has(email)) {
        return res.status(409).json({ error: 'Email đã tồn tại' });
    }

    users.set(email, {
        email,
        name: name || email.split('@')[0],
        password,
        verified: false,
    });

    const token = createVerificationToken(email);
    await sendVerificationEmail(email, token);

    res.status(201).json({
        message: 'Đăng ký thành công — kiểm tra console để lấy link xác thực',
        email,
    });
});

app.get('/api/verify', (req, res) => {
    const { token } = req.query;

    if (!token || !verificationTokens.has(token)) {
        return res.status(400).json({ error: 'Token không hợp lệ' });
    }

    const record = verificationTokens.get(token);

    if (Date.now() > record.expiresAt) {
        verificationTokens.delete(token);
        return res.status(400).json({ error: 'Token đã hết hạn' });
    }

    const user = users.get(record.email);
    if (user) user.verified = true;

    verificationTokens.delete(token);

    res.json({ message: 'Email đã xác thực thành công', email: record.email });
});

app.get('/api/users/:email', (req, res) => {
    const user = users.get(req.params.email);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy' });

    res.json({
        email: user.email,
        name: user.name,
        verified: user.verified,
    });
});

app.listen(PORT, () => {
    console.log(`Email verification demo: http://localhost:${PORT}`);
    console.log('Thử:');
    console.log(`  curl -X POST http://localhost:${PORT}/api/register -H "Content-Type: application/json" -d '{"email":"test@demo.com","password":"Secret@123","name":"Test"}'`);
});
