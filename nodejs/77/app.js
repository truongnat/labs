// Bài 77: Integration Test API với Supertest
// Express app đơn giản để test end-to-end HTTP request
// Chạy server: node 77/app.js
// Chạy test: npx jest 77/app.integration.test.js

const express = require('express');

const app = express();
app.use(express.json());

// In-memory store — đủ cho integration test, không cần DB thật
const users = [];
let nextId = 1;

// GET /health — kiểm tra server sống
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// GET /users — danh sách users
app.get('/users', (req, res) => {
    res.json(users);
});

// POST /users — tạo user mới
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'name và email là bắt buộc' });
    }
    const user = { id: nextId++, name, email };
    users.push(user);
    res.status(201).json(user);
});

// GET /users/:id — lấy user theo ID
app.get('/users/:id', (req, res) => {
    const user = users.find((u) => u.id === Number(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
    }
    res.json(user);
});

// DELETE /users/:id — xóa user
app.delete('/users/:id', (req, res) => {
    const index = users.findIndex((u) => u.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Không tìm thấy user' });
    }
    users.splice(index, 1);
    res.status(204).send();
});

// Chỉ listen khi chạy trực tiếp (không listen khi Supertest import)
if (require.main === module) {
    const PORT = process.env.PORT || 3077;
    app.listen(PORT, () => {
        console.log(`Server chạy tại http://localhost:${PORT}`);
    });
}

module.exports = app;
