// Bài 19: Lấy thông tin hệ thống với module os
// Module os cung cấp thông tin về hệ điều hành và phần cứng

const os = require('os');

// Thông tin CPU
console.log('Số lõi CPU:', os.cpus().length);
console.log('CPU trung bình tải:', os.loadavg()); // [1m, 5m, 15m]

// Thông tin bộ nhớ
console.log('Tổng RAM:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('RAM còn trống:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Home directory:', os.homedir());

// Thông tin hệ điều hành
console.log('Platform:', os.platform()); // darwin, linux, win32
console.log('OS:', os.type()); // Darwin, Linux, Windows_NT
console.log('Phiên bản OS:', os.version());
console.log('Thời gian chạy hệ thống:', os.uptime(), 'giây');

// Thông tin mạng
console.log('Hostname:', os.hostname());
const networkInterfaces = os.networkInterfaces();
console.log('Network Interfaces:', Object.keys(networkInterfaces));

// Uptime của process
console.log('Thời gian chạy process:', process.uptime(), 'giây');