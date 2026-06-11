// Bài 39: Tạo và Verify JSON Web Token (JWT)
// JWT dùng để authentication (xác thực) và authorization (phân quyền)

const jwt = require('jsonwebtoken');

// Secret key dùng để ký token
// Trong thực tế nên đặt trong biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Token có 3 phần: Header.Payload.Signature
// Header: thuật toán (HS256), loại (JWT)
// Payload: chứa thông tin (userId, role, v.v.)
// Signature: chữ ký bảo mật

// Tạo JWT token
function createToken() {
    // jwt.sign(payload, secret, options)
    const payload = {
        userId: 123,
        email: 'user@example.com',
        role: 'user'
    };
    
    const options = {
        expiresIn: '1h',     // Token hết hạn sau 1 giờ
        issuer: 'your-app',  // Người tạo token
        subject: 'auth'      // Chủ đề token
    };
    
    const token = jwt.sign(payload, JWT_SECRET, options);
    console.log('Token đã tạo:', token);
    console.log('Token gồm 3 phần:', token.split('.').map(p => p.substring(0, 20) + '...'));
    return token;
}

// Verify JWT token
function verifyToken(token) {
    try {
        // jwt.verify(token, secret) trả về payload nếu hợp lệ
        // Ném lỗi nếu token hết hạn hoặc không hợp lệ
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token hợp lệ, payload:', decoded);
        return decoded;
    } catch (error) {
        console.error('Token lỗi:', error.message);
        return null;
    }
}

// Demo
const token = createToken();
verifyToken(token);

// Giải mã (decode) không cần secret (không bảo mật)
const decoded = jwt.decode(token);
console.log('Decode (không verify):', decoded);

// Lưu ý:
// - Access token: ngắn hạn (5-15 phút), dùng cho API call
// - Refresh token: dài hạn (7-30 ngày), dùng để renew access token
// - Không bao giờ lưu JWT trong localStorage (dễ bị XSS), dùng cookie HttpOnly