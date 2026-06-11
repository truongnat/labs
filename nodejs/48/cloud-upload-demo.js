// Bài 48: Upload file lên Cloud (AWS S3 / Cloudinary) — mock pattern
// Tách storage adapter để đổi local ↔ S3 ↔ Cloudinary mà không đổi business logic
// Chạy bằng lệnh: cd 48 && npm install && node cloud-upload-demo.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3048;
const UPLOAD_DIR = path.join(__dirname, 'mock-cloud-storage');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// --- Storage Adapter Pattern (giống S3 / Cloudinary SDK) ---

class MockS3Adapter {
    constructor(bucket) {
        this.bucket = bucket;
        this.baseUrl = `https://${bucket}.s3.mock.amazonaws.com`;
    }

    async upload(buffer, key, contentType) {
        const filePath = path.join(UPLOAD_DIR, key.replace(/\//g, '_'));
        fs.writeFileSync(filePath, buffer);

        return {
            provider: 'mock-s3',
            bucket: this.bucket,
            key,
            url: `${this.baseUrl}/${key}`,
            etag: crypto.createHash('md5').update(buffer).digest('hex'),
            contentType,
        };
    }

    async delete(key) {
        const filePath = path.join(UPLOAD_DIR, key.replace(/\//g, '_'));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return { deleted: true, key };
    }
}

class MockCloudinaryAdapter {
    constructor(cloudName) {
        this.cloudName = cloudName;
        this.baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    }

    async upload(buffer, publicId, contentType) {
        const filePath = path.join(UPLOAD_DIR, `cloudinary_${publicId.replace(/\//g, '_')}`);
        fs.writeFileSync(filePath, buffer);

        return {
            provider: 'mock-cloudinary',
            publicId,
            url: `${this.baseUrl}/${publicId}`,
            secureUrl: `${this.baseUrl}/${publicId}`,
            format: path.extname(publicId).slice(1) || 'jpg',
            bytes: buffer.length,
            contentType,
        };
    }
}

const s3 = new MockS3Adapter('my-app-bucket');
const cloudinary = new MockCloudinaryAdapter('demo-cloud');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Cloud upload mock — pattern S3/Cloudinary',
        endpoints: {
            s3: 'POST /api/upload/s3 (field: file)',
            cloudinary: 'POST /api/upload/cloudinary (field: file)',
        },
    });
});

app.post('/api/upload/s3', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file' });

    const key = `uploads/${Date.now()}-${req.file.originalname}`;
    const result = await s3.upload(req.file.buffer, key, req.file.mimetype);
    res.status(201).json(result);
});

app.post('/api/upload/cloudinary', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file' });

    const publicId = `avatars/${Date.now()}_${path.parse(req.file.originalname).name}`;
    const result = await cloudinary.upload(req.file.buffer, publicId, req.file.mimetype);
    res.status(201).json(result);
});

app.delete('/api/upload/s3/:key(*)', async (req, res) => {
    const result = await s3.delete(req.params.key);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Cloud upload mock: http://localhost:${PORT}`);
    console.log(`  curl -F "file=@./package.json" http://localhost:${PORT}/api/upload/s3`);
});
