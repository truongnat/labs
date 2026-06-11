// Bài 9: Đọc/Ghi file với fs.promises và async/await
// Tránh callback hell khi xử lý nhiều thao tác file liên tiếp
// Chạy bằng lệnh: node fs.js

const fs = require('fs/promises'); // fs.promises - API Promise-based
const path = require('path');

const filePath = path.join(__dirname, 'demo.txt');
const newContent = '# Hello from async/await\nCập nhật lúc: ' + new Date().toISOString();

async function readWriteDemo() {
    try {
        // Ghi file (tạo mới hoặc ghi đè)
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log('Ghi file thành công');

        // Đọc lại file vừa ghi
        const data = await fs.readFile(filePath, 'utf-8');
        console.log('\nNội dung sau khi ghi:');
        console.log(data);

        // Kiểm tra file có tồn tại không
        const stats = await fs.stat(filePath);
        console.log('\nKích thước file:', stats.size, 'bytes');
    } catch (err) {
        console.error('Lỗi:', err.message);
    }
}

readWriteDemo();
