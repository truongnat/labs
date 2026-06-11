// Bài 2: CLI tool tính tổng 2 số với process.argv
// process.argv là mảng chứa các đối số từ command line
// Cấu trúc: [0] là đường dẫn tới node, [1] là đường dẫn file script
// Các phần tử từ [2] trở đi là đối số người dùng truyền vào

// Hàm tính tổng 2 số (pure function)
function total(a, b) {
    return a + b; // Trả về tổng của 2 tham số
}

// process.argv.slice(2) bỏ đi 2 phần tử đầu để lấy các đối số thực sự
// Ví dụ: node argv.js 10 20 -> args = ['10', '20']
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Cách dùng: node argv.js <số1> <số2>');
    console.log('Ví dụ: node argv.js 10 20');
    process.exit(1);
}

// Lưu ý quan trọng: process.argv luôn trả về chuỗi (string)
// Do đó cần dùng toán tử + hoặc parseInt() để chuyển sang number
// Ví dụ: "10" + "20" = "1020" (nối chuỗi), nhưng +10 + +20 = 30 (tổng số)
const a = Number(args[0]);
const b = Number(args[1]);

if (Number.isNaN(a) || Number.isNaN(b)) {
    console.log('Lỗi: hai tham số phải là số hợp lệ');
    process.exit(1);
}

console.log(total(a, b));

// Cách chạy: node argv.js 10 20
// Kết quả: 30