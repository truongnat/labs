// Bài 3: CommonJS Module - File module để export
// CommonJS là chuẩn module mặc định của Node.js (trước ES Modules)
// Dùng module.exports hoặc exports để export hàm, object, biến

// Định nghĩa hàm tính tổng
function total(a, b) {
    return a + b; // Trả về tổng 2 số
}

// Export hàm để các file khác có thể require()
// Khi export function, khi import sẽ nhận trực tiếp function đó
module.exports = total;