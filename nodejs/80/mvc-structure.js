// Bài 80: Kiến trúc MVC (Model-View-Controller)
// Cấu trúc code chuẩn cho web application

// Thư mục cấu trúc:
// src/
// ├── models/        # Model - tương tác database
// |   └── User.js    # Schema và logic DB
// ├── controllers/   # Controller - xử lý business logic
// |   └── userController.js
// ├── routes/       # Routes - định nghĩa endpoint
// |   └── userRoutes.js
// ├── views/        # View - template (EJS/Pug)
// |   └── users/
// └── app.js        # Entry point

// === models/User.js ===
/*
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }
});

module.exports = mongoose.model('User', userSchema);
*/

// === controllers/userController.js ===
const User = require('../models/User');

// Lấy danh sách users
const getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Lấy tất cả từ DB
        res.json(users); // Trả về JSON
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tạo user mới
const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body); // Tạo user
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lấy/Cập nhật/Xóa user theo ID
const getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
};

module.exports = { getUsers, createUser, getUser };

// === routes/userRoutes.js ===
/*
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);

module.exports = router;
*/