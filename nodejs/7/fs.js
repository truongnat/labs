// Bài 7: Đọc file đồng bộ với fs.readFileSync
// readFileSync là blocking - main thread dừng cho đến khi đọc xong
// Chỉ nên dùng cho file nhỏ (config, template) khi khởi động app
// Chạy bằng lệnh: node fs.js

const fs = require('fs');
const path = require('path');

// path.join(__dirname, 'demo.txt') tạo đường dẫn tuyệt đối an toàn
// __dirname = thư mục chứa file script hiện tại
// Không dùng './demo.txt' vì sẽ lỗi nếu chạy từ thư mục khác
const filePath = path.join(__dirname, 'demo.txt');

try {
    // 'utf-8' để đọc nội dung dạng text (không phải Buffer)
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log('Nội dung file demo.txt:');
    console.log(content);
} catch (err) {
    // err.code thường là 'ENOENT' nếu file không tồn tại
    console.error('Lỗi đọc file:', err.message);
}
