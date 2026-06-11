// Bài 47: Upload file local dùng Multer
// Multer xử lý multipart/form-data — stream file vào disk thay vì load hết RAM
// Chạy bằng lệnh: cd 47 && npm install && node multer-upload.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3047;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình lưu file — đặt tên unique tránh ghi đè
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    },
});

// Filter loại file — chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận JPEG, PNG, WebP'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

app.get('/', (req, res) => {
    res.type('html').send(`
        <h1>Multer Upload Demo</h1>
        <form action="/api/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="avatar" accept="image/*" required />
            <button type="submit">Upload</button>
        </form>
        <p>Hoặc: curl -F "avatar=@/path/to/image.jpg" http://localhost:${PORT}/api/upload</p>
    `);
});

app.post('/api/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Không có file' });
    }

    res.json({
        message: 'Upload thành công',
        file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path,
        },
    });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Multer upload: http://localhost:${PORT}`);
});
