// Bài 3: CommonJS Module - File import và sử dụng module
// Dùng require() để import module trong chuẩn CommonJS

// require('./total') import module total.js ở cùng thư mục
// Khi total.js export một function, require() sẽ trả về function đó trực tiếp
const total = require('./total');

// Gọi hàm đã import với tham số 1 và 2
console.log(total(1, 2)); // Kết quả: 3