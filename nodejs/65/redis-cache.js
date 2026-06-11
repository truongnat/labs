// Bài 65: Redis Cache - Cache kết quả truy vấn Database
// Redis in-memory cache giúp giảm tải database và tăng tốc API

const redis = require('redis');
const mongoose = require('mongoose');

// Kết nối Redis
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log('Redis connected'));

// Model User mẫu
const User = mongoose.model('User', {
    name: String,
    email: String
});

// Hàm lấy users với cache
async function getCachedUsers() {
    const cacheKey = 'users:all';
    
    try {
        // Kiểm tra cache trước
        const cached = await redisClient.get(cacheKey);
        
        if (cached) {
            console.log('Lấy từ Redis cache');
            return JSON.parse(cached); // Trả về cache nếu có
        }
        
        // Nếu không có cache, query database
        console.log('Query từ MongoDB');
        const users = await User.find().lean(); // lean() trả về plain JS objects
        
        // Lưu vào Redis với TTL 1 giờ
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(users));
        
        return users;
        
    } catch (error) {
        console.error('Lỗi cache:', error);
        // Fallback: vẫn trả kết quả từ DB nếu Redis lỗi
        return await User.find().lean();
    }
}

// Hàm xóa cache khi có thay đổi data
async function invalidateUserCache() {
    await redisClient.del('users:all');
    console.log('Cache đã bị xóa');
}

// Express route
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
    try {
        const users = await getCachedUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    // Tạo user mới
    const user = await User.create(req.body);
    // Xóa cache để force reload
    await invalidateUserCache();
    res.status(201).json(user);
});

app.listen(3000);