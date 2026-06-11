// ============================================================
// Bài 51: Đọc file CSV lớn bằng Readable Stream
// ============================================================
// Đây là bài quan trọng về Streams - xử lý file lớn mà không ngốn RAM
//
// Vấn đề:
//   - File CSV 1GB, nếu dùng fs.readFileSync() sẽ load toàn bộ vào RAM
//   - RAM có thể cạn, app crash
//
// Giải pháp:
//   - Dùng Readable Stream để đọc từng chunk nhỏ
//   - readline để xử lý từng dòng một
//   - Memory usage ổn định, không tăng theo kích thước file
//
// Chạy bằng lệnh:
//   node csv-stream.js

// ============================================================
// Import các module
// ============================================================
// fs: File System module
//   - Tạo, đọc, ghi, xóa file
//   - createReadStream(): tạo readable stream từ file
const fs = require('fs');

// readline: module để đọc input line by line
//   - createInterface(): tạo interface để đọc từng dòng
//   - on('line', callback): xử lý từng dòng
const readline = require('readline');

// path: module xử lý đường dẫn file
//   - join(): nối các phần path an toàn trên mọi OS
//   - __dirname: thư mục chứa file hiện tại
const path = require('path');

// ============================================================
// Tạo demo file CSV
// ============================================================
// path.join(__dirname, 'users.csv')
// -------------------------
// Tạo path tuyệt đối tới file users.csv
//
// __dirname
// -------------------------
// Biến toàn cục của Node.js
// Chứa đường dẫn thư mục của file hiện tại
//
// Ví dụ:
//   __dirname = '/Users/truongdq/tx/dev/labs/nodejs/51'
//   path.join(__dirname, 'users.csv')
//   = '/Users/truongdq/tx/dev/labs/nodejs/51/users.csv'
const demoCSV = path.join(__dirname, 'users.csv');

// fs.writeFileSync(file, data)
// -------------------------
// Ghi dữ liệu vào file (đồng bộ)
//
// Tham số:
//   1. file: đường dẫn file
//   2. data: nội dung cần ghi
//
// Nội dung CSV:
//   - Dòng 1: header (id,name,email,age)
//   - Dòng 2-4: dữ liệu mẫu
//
// \n
// -------------------------
// Newline character
// Xuống dòng trong file
fs.writeFileSync(demoCSV,
    'id,name,email,age\n' +
    '1,Nguyen Van A,a@example.com,25\n' +
    '2,Tran Thi B,b@example.com,30\n' +
    '3,Le Van C,c@example.com,35\n'
);

// ============================================================
// Hàm processLargeCSV(filePath)
// ============================================================
// Đọc và xử lý file CSV lớn bằng stream
//
// Tham số:
//   filePath: string - đường dẫn file CSV
//
// Cách hoạt động:
//   1. Tạo readable stream từ file
//   2. Tạo readline interface
//   3. Xử lý từng dòng
//   4. Khi đọc xong, log kết quả
function processLargeCSV(filePath) {

    // ============================================================
    // Tạo readable stream
    // ============================================================
    // fs.createReadStream(filePath)
    // -------------------------
    // Tạo readable stream từ file
    //
    // Readable Stream là gì?
    // -------------------------
    //   - Một luồng dữ liệu có thể đọc được
    //   - Dữ liệu đến theo từng chunk (mảng nhỏ)
    //   - Không load toàn bộ file vào RAM
    //
    // So sánh với fs.readFileSync():
    //   - sync: load toàn bộ file vào RAM
    //   - stream: đọc từng chunk, memory ổn định
    //
    // Ví dụ với file 1GB:
    //   - sync: RAM tăng 1GB
    //   - stream: RAM chỉ tăng vài KB
    const stream = fs.createReadStream(filePath);

    // ============================================================
    // Tạo readline interface
    // ============================================================
    // readline.createInterface(options)
    // -------------------------
    // Tạo interface để đọc input line by line
    //
    // options:
    //   - input: readable stream (từ fs.createReadStream)
    //   - crlfDelay: xử lý cả \r\n và \n
    const rl = readline.createInterface({

        // input: stream
        // -------------------------
        // Input stream để đọc
        // Dữ liệu từ file sẽ chảy qua stream này
        input: stream,

        // crlfDelay: Infinity
        // -------------------------
        // Xử lý cả hai kiểu newline:
        //   - \n (Unix/Linux/macOS)
        //   - \r\n (Windows)
        //
        // Vì sao cần?
        //   - File CSV có thể đến từ nhiều nguồn
        //   - Windows dùng \r\n
        //   - Linux dùng \n
        //
        // Infinity
        // -------------------------
        // Cho phép readline tự động nhận diện cả hai kiểu
        // Không cần quan tâm file đến từ OS nào
        crlfDelay: Infinity
    });

    // ============================================================
    // Mảng users để lưu kết quả
    // ============================================================
    // users = []
    // -------------------------
    // Mảng để lưu các user đã parse từ CSV
    //
    // Lưu ý:
    //   - Trong thực tế với file 1GB, không nên lưu tất cả vào mảng
    //   - Nên xử lý từng dòng và ghi vào DB/file khác
    //   - Ở đây dùng mảng chỉ để demo
    const users = [];

    // ============================================================
    // Counter dòng
    // ============================================================
    // lineNumber = 0
    // -------------------------
    // Đếm số dòng đã đọc
    //
    // Mục đích:
    //   - Bỏ qua dòng header (dòng 1)
    //   - Đếm tổng số dòng đã xử lý
    let lineNumber = 0;

    // ============================================================
    // Event: 'line'
    // ============================================================
    // rl.on('line', callback)
    // -------------------------
    // Lắng nghe event 'line'
    //
    // Event này được phát MỖI KHI readline đọc xong một dòng
    //
    // callback(line)
    // -------------------------
    // line: string - nội dung dòng vừa đọc
    //
    // Ví dụ:
    //   line = '1,Nguyen Van A,a@example.com,25'
    rl.on('line', (line) => {

        // Tăng lineNumber lên 1
        // Mỗi lần event 'line' phát, nghĩa là đã đọc xong 1 dòng
        lineNumber++;

        // ============================================================
        // Bỏ qua dòng header
        // ============================================================
        // if (lineNumber === 1) return
        // -------------------------
        // Dòng đầu tiên của CSV là header
        // Không cần xử lý
        //
        // Ví dụ:
        //   Line 1: id,name,email,age (header)
        //   Line 2: 1,Nguyen Van A,a@example.com,25 (data)
        //
        // return
        // -------------------------
        // Thoát khỏi callback
        // Không xử lý dòng này
        if (lineNumber === 1) return;

        // ============================================================
        // Parse CSV line
        // ============================================================
        // line.split(',')
        // -------------------------
        // Tách dòng CSV theo dấu phẩy
        //
        // Ví dụ:
        //   line = '1,Nguyen Van A,a@example.com,25'
        //
        // Sau split(','):
        //   ['1', 'Nguyen Van A', 'a@example.com', '25']
        //
        // Destructuring:
        //   const [id, name, email, age] = line.split(',')
        //
        // Tương đương:
        //   const id = arr[0]       // '1'
        //   const name = arr[1]     // 'Nguyen Van A'
        //   const email = arr[2]    // 'a@example.com'
        //   const age = arr[3]      // '25'
        const [id, name, email, age] = line.split(',');

        // ============================================================
        // Lưu user vào mảng
        // ============================================================
        // users.push(object)
        // -------------------------
        // Thêm object user vào mảng
        //
        // Object structure:
        //   {
        //     id: '1',
        //     name: 'Nguyen Van A',
        //     email: 'a@example.com',
        //     age: 25
        //   }
        //
        // parseInt(age)
        // -------------------------
        // Chuyển age từ string sang number
        //
        // Ví dụ:
        //   parseInt('25') = 25
        //
        // Vì sao cần?
        //   - CSV đọc được là string
        //   - age nên là number để tính toán
        users.push({ id, name, email, age: parseInt(age) });

        // Trong thực tế:
        //   - Lưu vào database
        //   - Ghi vào file khác
        //   - Gửi qua message queue
        //
        // Quan trọng:
        //   - Không lưu tất cả vào mảng với file lớn
        //   - Xử lý từng dòng và giải phóng memory
    });

    // ============================================================
    // Event: 'close'
    // ============================================================
    // rl.on('close', callback)
    // -------------------------
    // Lắng nghe event 'close'
    //
    // Event này được phát khi đã đọc HẾT file
    //
    // callback()
    // -------------------------
    // Chạy khi stream đã đóng
    rl.on('close', () => {

        // ============================================================
        // Log kết quả
        // ============================================================
        // console.log()
        // -------------------------
        // In kết quả ra console
        //
        // users.length
        // -------------------------
        // Số lượng user đã xử lý
        //
        // Ví dụ:
        //   Đã xử lý 3 users từ CSV
        console.log(`Đã xử lý ${users.length} users từ CSV`);

        // users[0]
        // -------------------------
        // Lấy user đầu tiên từ mảng
        //
        // Ví dụ:
        //   User đầu tiên: { id: '1', name: 'Nguyen Van A', email: 'a@example.com', age: 25 }
        console.log('User đầu tiên:', users[0]);

        // ============================================================
        // Xóa file demo
        // ============================================================
        // fs.unlinkSync(demoCSV)
        // -------------------------
        // Xóa file demo sau khi xử lý xong
        //
        // unlinkSync()
        // -------------------------
        // Xóa file (đồng bộ)
        //
        // Vì sao xóa?
        //   - Đây là file demo
        //   - Không cần giữ lại
        fs.unlinkSync(demoCSV);
    });

    // ============================================================
    // Event: 'error'
    // ============================================================
    // rl.on('error', callback)
    // -------------------------
    // Lắng nghe event 'error'
    //
    // Event này được phát khi có lỗi khi đọc file
    //
    // Các lỗi thường gặp:
    //   - File không tồn tại
    //   - Không có quyền đọc
    //   - File bị khóa
    rl.on('error', (err) => {

        // console.error()
        // -------------------------
        // In lỗi ra stderr
        //
        // err.message
        // -------------------------
        // Lấy thông điệp lỗi từ Error object
        console.error('Lỗi đọc file:', err.message);
    });
}

// ============================================================
// Chạy hàm xử lý
// ============================================================
// processLargeCSV(demoCSV)
// -------------------------
// Gọi hàm để bắt đầu đọc file
//
// demoCSV
// -------------------------
// Đường dẫn file CSV đã tạo
//
// Sau khi chạy:
//   - File users.csv được tạo
//   - Stream đọc từng dòng
//   - Parse và lưu vào users array
//   - Log kết quả
//   - Xóa file demo
processLargeCSV(demoCSV);