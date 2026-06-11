// Bài 6: Thông tin process - PID và memory usage
// process là global object của Node.js, chứa thông tin về tiến trình đang chạy
// Chạy bằng lệnh: node pid.js

// process.pid - Process ID duy nhất do hệ điều hành cấp
// Hữu ích khi debug, kill process, hoặc monitor trên server (PM2, Docker)
console.log('Process ID (PID):', process.pid);

// process.env - Biến môi trường (NODE_ENV, PATH, custom vars từ .env hoặc shell)
// In một vài biến phổ biến để thấy cấu trúc
console.log('NODE_ENV:', process.env.NODE_ENV || '(chưa set)');
console.log('Platform:', process.platform); // darwin, linux, win32

// process.memoryUsage() - Thống kê bộ nhớ của process (đơn vị: bytes)
const memoryUsage = process.memoryUsage();

// Chuyển bytes sang MB cho dễ đọc
const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

console.log('\n--- Memory Usage (MB) ---');
// heapTotal: tổng heap mà V8 cấp phát (kể cả vùng chưa dùng)
console.log('heapTotal:', toMB(memoryUsage.heapTotal), 'MB');
// heapUsed: heap đang thực sự sử dụng
console.log('heapUsed:', toMB(memoryUsage.heapUsed), 'MB');
// external: bộ nhớ C++ bindings bên ngoài V8 heap
console.log('external:', toMB(memoryUsage.external), 'MB');
// arrayBuffers: bộ nhớ ArrayBuffer / TypedArray
console.log('arrayBuffers:', toMB(memoryUsage.arrayBuffers), 'MB');
