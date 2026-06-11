// es.js - File import module ES6 
// Bài 4: Sử dụng ES Modules (import/export) thay vì CommonJS
// Lưu ý: Cần thiết lập "type": "module" trong package.json

// import ... from ... là cú pháp ES6 để import module
// Không cần dùng require() như CommonJS
// Tên file phải kèm đuôi .js khi dùng ES Modules
import total from './total.js';

// Gọi hàm đã import
console.log(total(1, 2)); // Kết quả: 3