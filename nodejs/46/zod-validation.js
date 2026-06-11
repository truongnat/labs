// Bài 46: Validate Input data dùng Zod
// Validate sớm ở boundary API — tránh data rác vào business logic / DB
// Chạy bằng lệnh: cd 46 && npm install && node zod-validation.js

const express = require('express');
const { z } = require('zod');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3046;

// Schema đăng ký user — single source of truth cho validation
const registerSchema = z.object({
    name: z.string().min(2, 'Tên ít nhất 2 ký tự').max(100),
    email: z.string().email('Email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Password ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Cần ít nhất 1 số'),
    age: z.number().int().min(18, 'Phải đủ 18 tuổi').optional(),
});

// Middleware factory — tái sử dụng cho nhiều route
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        req.validated = result.data;
        next();
    };
}

app.post('/api/register', validate(registerSchema), (req, res) => {
    res.status(201).json({
        message: 'Đăng ký thành công',
        user: { ...req.validated, password: '[hidden]' },
    });
});

// Query params validation
const listUsersQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

app.get('/api/users', (req, res, next) => {
    const result = listUsersQuery.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
    }
    res.json({ page: result.data.page, limit: result.data.limit, users: [] });
});

app.listen(PORT, () => {
    console.log(`Zod validation demo: http://localhost:${PORT}`);
    console.log('Thử invalid:');
    console.log(`  curl -X POST http://localhost:${PORT}/api/register -H "Content-Type: application/json" -d '{"name":"A","email":"bad","password":"123"}'`);
});
