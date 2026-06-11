// Bài 15: Phân biệt setTimeout, setInterval, setImmediate, process.nextTick
// Understanding thứ tự thực thi trong Event Loop Node.js

console.log('1. Đồng bộ - chạy ngay');

// setTimeout: chạy sau thời gian timeout (đơn vị ms)
// Cả setTimeout và setInterval đều vào phase Timer của Event Loop
setTimeout(() => {
    console.log('2. setTimeout (0ms) - phase Timer');
}, 0);

// setInterval: chạy lặp lại sau mỗi khoảng thời gian (phase Timer)
// Demo chỉ chạy 1 lần rồi clear để script không treo terminal
const intervalId = setInterval(() => {
    console.log('2b. setInterval (1 lần demo) - phase Timer');
    clearInterval(intervalId);
}, 10);

// setImmediate: chạy trong phase I/O callbacks (check phase)
// Thực thi ngay sau khi I/O callbacks hoàn thành
setImmediate(() => {
    console.log('3. setImmediate - phase Check');
});

// process.nextTick: chạy ngay sau microtask queue
// Có độ ưu tiên cao nhất, chạy trước cả Promise
process.nextTick(() => {
    console.log('4. process.nextTick - microtask');
});

// Promise: cũng trong microtask queue, nhưng sau nextTick
Promise.resolve().then(() => {
    console.log('5. Promise.then - microtask');
});

// Thứ tự dự kiến output:
// 1. Đồng bộ - chạy ngay
// 4. process.nextTick - microtask
// 5. Promise.then - microtask
// 2. setTimeout (0ms) - phase Timer
// 3. setImmediate - phase Check

// Thoát sau khi in hết output (setTimeout/setImmediate cần thời gian chạy)
setTimeout(() => process.exit(0), 100);