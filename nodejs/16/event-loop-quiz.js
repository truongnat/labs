// Bài 16: Bài tập Event Loop - Dự đoán thứ tự thực thi
// Bài tập này giúp bạn nắm vững hoạt động của Event Loop

const fs = require('fs');

console.log('1. Start - đồng bộ');

setTimeout(() => {
    console.log('2. setTimeout 1');
}, 0);

setImmediate(() => {
    console.log('3. setImmediate 1');
});

Promise.resolve().then(() => {
    console.log('4. Promise 1');
});

process.nextTick(() => {
    console.log('5. nextTick 1');
});

setTimeout(() => {
    console.log('6. setTimeout 2');
}, 0);

setImmediate(() => {
    console.log('7. setImmediate 2');
});

process.nextTick(() => {
    console.log('8. nextTick 2');
});

Promise.resolve().then(() => {
    console.log('9. Promise 2');
});

console.log('10. End - đồng bộ');

// Kết quả dự kiến:
// 1. Start - đồng bộ
// 10. End - đồng bộ
// 5. nextTick 1
// 8. nextTick 2
// 4. Promise 1
// 9. Promise 2
// 2. setTimeout 1
// 6. setTimeout 2
// 3. setImmediate 1
// 7. setImmediate 2

// Giải thích:
// - NextTick luôn chạy đầu tiên trong mỗi tick
// - Promise và microtask sau đó
// - Tiếp theo là Timer phase (setTimeout)
// - Cuối cùng là Check phase (setImmediate)

// Thoát sau khi Event Loop chạy xong các callback
setTimeout(() => process.exit(0), 100);