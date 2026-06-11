// total.js - Module ES6 export function
// ES Modules là chuẩn module hiện đại của JavaScript (ES6)
// Dùng export default để export một giá trị chính

// Định nghĩa hàm tính tổng
function total(a, b) {
    return a + b; // Trả về tổng của 2 tham số
}

// export default cho phép export duy nhất một giá trị
// Khi import, không cần dùng dấu {} như named export
export default total;