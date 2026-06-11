// Bài 51: Đọc file CSV lớn bằng Readable Stream
// Xử lý file 1GB mà không ngốn RAM - xử lý từng dòng một

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Tạo demo file CSV
const demoCSV = path.join(__dirname, 'users.csv');
fs.writeFileSync(demoCSV, 
    'id,name,email,age\n' +
    '1,Nguyen Van A,a@example.com,25\n' +
    '2,Tran Thi B,b@example.com,30\n' +
    '3,Le Van C,c@example.com,35\n'
);

// Đọc CSV bằng stream - không tải toàn bộ file vào memory
function processLargeCSV(filePath) {
    // Tạo readable stream từ file
    const stream = fs.createReadStream(filePath);
    
    // Tạo interface để đọc từng dòng
    const rl = readline.createInterface({
        input: stream, // Input stream
        crlfDelay: Infinity // Xử lý cả Windows (\r\n) và Unix (\n)
    });
    
    const users = [];
    let lineNumber = 0;
    
    // Xử lý từng dòng
    rl.on('line', (line) => {
        lineNumber++;
        
        // Bỏ qua dòng header
        if (lineNumber === 1) return;
        
        // Parse CSV line: "1,Nguyen Van A,a@example.com,25"
        const [id, name, email, age] = line.split(',');
        
        // Xử lý dữ liệu dòng này (ví dụ: thêm vào mảng)
        users.push({ id, name, email, age: parseInt(age) });
        
        // Trong thực tế: lưu vào DB, ghi vào file khác, v.v.
    });
    
    // Khi đọc xong
    rl.on('close', () => {
        console.log(`Đã xử lý ${users.length} users từ CSV`);
        console.log('User đầu tiên:', users[0]);
        
        // Xóa file demo
        fs.unlinkSync(demoCSV);
    });
    
    // Xử lý lỗi
    rl.on('error', (err) => {
        console.error('Lỗi đọc file:', err.message);
    });
}

// Chạy
processLargeCSV(demoCSV);