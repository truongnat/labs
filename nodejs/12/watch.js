// Bài 12: Theo dõi sự thay đổi của file với fs.watch
// Bài tập này giúp bạn tạo được tính năng auto-reload như nodemon

const fs = require('fs');
const path = require('path');

// fs.watch(path, callback) theo dõi thay đổi file/thư mục
// eventType: 'change' (sửa file) hoặc 'rename' (đổi tên/xóa)
// filename: tên file bị thay đổi (chỉ có trên macOS/Linux)
const watchFile = (filename) => {
    const filePath = path.join(__dirname, filename);
    
    fs.watch(filePath, (eventType, changedFilename) => {
        console.log(`Sự kiện: ${eventType}`);
        console.log(`File thay đổi: ${changedFilename || filename}`);
    });
    
    console.log(`Đang theo dõi file: ${filename}`);
};

// Demo: ghi file → watch bắt sự kiện → thoát (tránh treo terminal)
const demoPath = path.join(__dirname, 'demo.txt');

// Tạo file nếu chưa có
if (!fs.existsSync(demoPath)) {
    fs.writeFileSync(demoPath, '# Demo watch\n', 'utf-8');
}

watchFile('demo.txt');

// Ghi đè file sau 500ms để trigger sự kiện change
setTimeout(() => {
    fs.writeFileSync(demoPath, '# Demo watch - đã sửa\n', 'utf-8');
    console.log('Demo hoàn tất. Thoát sau 1 giây...');
    setTimeout(() => process.exit(0), 1000);
}, 500);

// Lưu ý:
// - fs.watch có thể gọi callback nhiều lần cho 1 thay đổi
// - fs.watchFile là phiên bản polling (chậm hơn nhưng chính xác hơn)
// - File phải tồn tại trước khi watch, nếu không sẽ throw error
// - Trên Windows đôi khi không báo filename