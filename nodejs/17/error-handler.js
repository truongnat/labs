// Bài 17: Xử lý uncaughtException và unhandledRejection
// Đây là cơ chế bảo vệ app khỏi crash khi có lỗi không bắt được

// Xử lý lỗi runtime không được catch (ví dụ: lỗi bất đồng bộ)
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    
    // Thực tế nên log lỗi và restart server bằng process.exit()
    // process.exit(1);
});

// Xử lý Promise bị reject mà không có .catch()
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    console.error('Promise:', promise);
    
    // Nên log và xử lý, có thể exit process để PM2 restart
    // process.exit(1);
});

// Ví dụ uncaughtException:
// setTimeout(() => {
//     throw new Error('Lỗi này sẽ crash app nếu không có handler');
// }, 1000);

// Ví dụ unhandledRejection:
// Promise.reject('Lỗi promise không được catch');

console.log('Đã đăng ký handler. Demo uncaughtException + unhandledRejection...\n');

// Demo uncaughtException — handler bắt, app không crash ngay
setTimeout(() => {
    throw new Error('Demo uncaughtException');
}, 100);

// Demo unhandledRejection
setTimeout(() => {
    Promise.reject(new Error('Demo unhandledRejection'));
}, 200);

// Thoát sau demo
setTimeout(() => {
    console.log('\nDemo hoàn tất.');
    process.exit(0);
}, 500);