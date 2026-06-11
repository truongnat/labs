// Bài 68: Cron Job - lên lịch chạy task định kỳ (dọn dẹp DB, backup, report)
// node-cron dùng cron syntax: '* * * * *' (phút giờ ngày tháng thứ)
// Chạy bằng lệnh: node cron-job.js

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'cron.log');

function log(message) {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(entry.trim());
}

// Mock database records cần dọn
const expiredSessions = [
    { id: 1, userId: 'u1', expiredAt: '2024-01-01' },
    { id: 2, userId: 'u2', expiredAt: '2024-02-01' },
    { id: 3, userId: 'u3', expiredAt: '2024-03-01' }
];

function cleanupExpiredSessions() {
    const removed = expiredSessions.splice(0, expiredSessions.length);
    log(`Cleanup: xóa ${removed.length} session hết hạn`);
    return removed.length;
}

function generateDailyReport() {
    const report = {
        date: new Date().toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 1000),
        revenue: Math.floor(Math.random() * 50000)
    };
    log(`Report: ${JSON.stringify(report)}`);
    return report;
}

// Thử dùng node-cron nếu đã cài
let cron;
try {
    cron = require('node-cron');
} catch {
    cron = null;
}

if (cron) {
    console.log('=== Dùng node-cron ===\n');

    // Mỗi 10 giây (demo - production dùng '0 2 * * *' = 2h sáng hàng ngày)
    cron.schedule('*/10 * * * * *', () => {
        cleanupExpiredSessions();
    });

    // Mỗi 15 giây
    cron.schedule('*/15 * * * * *', () => {
        generateDailyReport();
    });

    console.log('Cron jobs đã lên lịch (demo: chạy mỗi 10s và 15s)');
    console.log('Production examples:');
    console.log('  "0 2 * * *"     - 2:00 AM hàng ngày');
    console.log('  "0 */6 * * *"   - mỗi 6 giờ');
    console.log('  "0 0 * * 0"     - Chủ nhật hàng tuần');
    console.log('\nNhấn Ctrl+C để dừng\n');

} else {
    console.log('=== Fallback: setInterval (cài node-cron: npm install node-cron) ===\n');

    // Fallback runnable không cần npm
    setInterval(cleanupExpiredSessions, 10000);
    setInterval(generateDailyReport, 15000);

    log('Cron fallback started');
    console.log('Chạy cleanup mỗi 10s, report mỗi 15s');
}

// Chạy ngay 1 lần khi start
cleanupExpiredSessions();
generateDailyReport();

process.on('SIGINT', () => {
    log('Cron stopped');
    console.log('\nĐã dừng cron jobs');
    process.exit(0);
});
