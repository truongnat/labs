// Bài 10: Tạo, xóa, đổi tên thư mục bằng fs
// Dùng khi app cần tự tạo thư mục upload, logs, cache...
// Chạy bằng lệnh: node fs.js

const fs = require('fs/promises');
const path = require('path');

const demoDir = path.join(__dirname, 'demo-folder');
const renamedDir = path.join(__dirname, 'demo-folder-renamed');

async function manageDirectories() {
    try {
        // fs.mkdir - tạo thư mục mới
        // recursive: true cho phép tạo nested path (a/b/c)
        await fs.mkdir(demoDir, { recursive: true });
        console.log('Đã tạo thư mục:', demoDir);

        // Tạo file bên trong để demo rename thư mục
        await fs.writeFile(
            path.join(demoDir, 'readme.txt'),
            'Thư mục demo cho bài 10',
            'utf-8'
        );
        console.log('Đã tạo file readme.txt bên trong');

        // fs.rename - đổi tên hoặc di chuyển thư mục
        await fs.rename(demoDir, renamedDir);
        console.log('Đã đổi tên thư mục thành:', renamedDir);

        // fs.rm - xóa thư mục (Node 14.14+)
        // recursive: true bắt buộc khi xóa thư mục có nội dung bên trong
        await fs.rm(renamedDir, { recursive: true, force: true });
        console.log('Đã xóa thư mục demo');
    } catch (err) {
        console.error('Lỗi:', err.message);
    }
}

manageDirectories();
