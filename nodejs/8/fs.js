// Bài 8: Đọc file bất đồng bộ với fs.readFile (Callback)
// Khác readFileSync: không block main thread, phù hợp I/O trên server
// Chạy bằng lệnh: node fs.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'demo.txt');

console.log('Bắt đầu đọc file (async)...');
console.log('Dòng này in TRƯỚC khi đọc xong file - chứng minh không blocking');

// Callback pattern: (err, data) => {}
// Quy ước Node.js: tham số đầu luôn là lỗi (null nếu thành công)
fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Lỗi đọc file:', err.message);
        return;
    }

    console.log('\nNội dung file (callback):');
    console.log(data);
});

console.log('Script vẫn chạy tiếp trong khi fs.readFile đang xử lý ở background');
