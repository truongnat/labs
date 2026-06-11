// Bài 41: Phân quyền RBAC (Role-Based Access Control: Admin vs User)
// RBAC tách quyền theo role thay vì gán quyền từng user — dễ scale
// Chạy bằng lệnh: cd 41 && npm install && node rbac-roles.js

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3041;
const JWT_SECRET = process.env.JWT_SECRET || 'rbac-demo-secret';

// "Database" users in-memory
const users = {
    admin: { id: 1, email: 'admin@test.com', role: 'admin' },
    user: { id: 2, email: 'user@test.com', role: 'user' },
};

// Ma trận quyền: role → danh sách permission
const permissions = {
    admin: ['read:users', 'write:users', 'delete:users', 'read:reports'],
    user: ['read:own-profile', 'write:own-profile'],
};

function hasPermission(role, permission) {
    return (permissions[role] || []).includes(permission);
}

// Middleware xác thực JWT
function authenticate(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Cần đăng nhập' });
    }

    try {
        req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
}

// Factory middleware kiểm tra permission — tái sử dụng cho nhiều route
function authorize(...requiredPermissions) {
    return (req, res, next) => {
        const allowed = requiredPermissions.every((p) => hasPermission(req.user.role, p));

        if (!allowed) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Role "${req.user.role}" không có quyền: ${requiredPermissions.join(', ')}`,
            });
        }
        next();
    };
}

// Login giả — trả token theo role (demo)
app.post('/api/login', (req, res) => {
    const { email } = req.body;
    const account = Object.values(users).find((u) => u.email === email);

    if (!account) {
        return res.status(401).json({ error: 'Email không tồn tại' });
    }

    const token = jwt.sign(
        { id: account.id, email: account.email, role: account.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token, role: account.role });
});

// Route công khai
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// User đã login — mọi role
app.get('/api/profile', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Chỉ admin — xem danh sách users
app.get('/api/users', authenticate, authorize('read:users'), (req, res) => {
    res.json(Object.values(users));
});

// Chỉ admin — xóa user
app.delete('/api/users/:id', authenticate, authorize('delete:users'), (req, res) => {
    res.json({ message: `Đã xóa user ${req.params.id} (demo)` });
});

// Chỉ admin — báo cáo
app.get('/api/reports', authenticate, authorize('read:reports'), (req, res) => {
    res.json({ reports: [{ id: 1, title: 'Doanh thu tháng' }] });
});

app.listen(PORT, () => {
    console.log(`RBAC demo: http://localhost:${PORT}`);
    console.log('Thử:');
    console.log(`  curl -X POST http://localhost:${PORT}/api/login -H "Content-Type: application/json" -d '{"email":"admin@test.com"}'`);
    console.log(`  curl -X POST http://localhost:${PORT}/api/login -H "Content-Type: application/json" -d '{"email":"user@test.com"}'`);
});
