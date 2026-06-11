// dotenv.js - Đọc biến môi trường từ file .env
// Bài 5: Sử dụng thư viện dotenv để quản lý cấu hình môi trường
// Đây là cách chuẩn để lưu trữ thông tin nhạy cảnh (API key, DB password) không đưa lên git

const dotenv = require('dotenv'); // Import thư viện dotenv

// dotenv.config() đọc file .env và load vào process.env
// process.env là đối tượng chứa tất cả biến môi trường hệ thống
dotenv.config();

// process.env.NODE_ENV sẽ lấy giá trị từ file .env
// Lưu ý: process.env luôn trả về chuỗi, cần chuyển đổi nếu cần number/boolean
console.log(process.env.NODE_ENV); // môi trường: development/production

// process.env.DEBUG lấy giá trị DEBUG từ file .env
// Khi DEBUG=true trong .env, giá trị này chỉ là chuỗi "true"
console.log(process.env.DEBUG);

// Lưu ý quan trọng:
// - File .env không nên commit lên git (thêm vào .gitignore)
// - Tạo file .env.example để hướng dẫn biến môi trường cần thiết
// - Biến môi trường hệ thống có thể ghi đè biến trong .env nếu trùng tên