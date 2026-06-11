// Bài 26: Serve static files (HTML, CSS, JS, Images)

const express = require('express');
const path = require('path');
const app = express();

// express.static là middleware phục vụ file tĩnh
// Các file trong thư mục 'public' sẽ được truy cập trực tiếp
// Ví dụ: public/images/logo.png -> http://localhost:3000/images/logo.png

// Phục vụ file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Phục vụ file tĩnh với prefix path
// Ví dụ: http://localhost:3000/static/css/style.css
app.use('/static', express.static(path.join(__dirname, 'public')));

// Cache control cho static files
app.use(express.static('public', {
    maxAge: '1d',        // Cache 1 ngày
    etag: true,          // Dùng ETag để cache
    lastModified: true,  // Dùng Last-Modified header
}));

// Index route trả về file HTML
app.get('/', (req, res) => {
    // res.sendFile gửi file HTML cho client
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tạo file public/index.html và public/style.css để test
// public/
//   ├── index.html
//   ├── style.css
//   └── images/
//       └── logo.png

app.listen(3000, () => {
    console.log('Server chạy tại http://localhost:3000');
    console.log('Truy cập / hoặc /static/style.css để xem kết quả');
});