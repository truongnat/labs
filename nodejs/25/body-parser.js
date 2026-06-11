// Bài 25: Parse JSON body và URL-encoded data
// Express cung cấp middleware để parse request body tự động

const express = require('express');
const app = express();

// Middleware parse JSON body
// Dùng cho API nhận JSON (Content-Type: application/json)
app.use(express.json());

// Middleware parse URL-encoded data  
// Dùng cho form submit (Content-Type: application/x-www-form-urlencoded)
// extended: true cho phép nested object (sử dụng qs library)
// extended: false chỉ cho ph� JSON string (sử dụng querystring)
app.use(express.urlencoded({ extended: true }));

// Route nhận JSON body
app.post('/api/json', (req, res) => {
    // req.body chứa dữ liệu đã được parse từ JSON
    console.log('Dữ liệu JSON nhận được:', req.body);
    res.json({
        received: req.body,
        type: 'json'
    });
});

// Route nhận form data
app.post('/api/form', (req, res) => {
    // req.body chứa dữ liệu từ form submit
    console.log('Dữ liệu form nhận được:', req.body);
    res.json({
        received: req.body,
        type: 'form'
    });
});

// Route nhận file upload (sẽ dùng Multer cho phần này)
// app.post('/api/upload', upload.single('file'), (req, res) => {...

// Test bằng curl:
// curl -X POST http://localhost:3000/api/json -H "Content-Type: application/json" -d '{"name":"John"}'
// curl -X POST http://localhost:3000/api/form -d "name=John&email=john@example.com"

app.listen(3000, () => console.log('Server chạy port 3000'));