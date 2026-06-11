// Bài 84: Graceful Shutdown — đóng DB, hoàn thành request trước khi tắt
// Xử lý SIGTERM/SIGINT từ PM2, Docker, Kubernetes
// Chạy: node 84/graceful-shutdown.js  (Ctrl+C để test shutdown)

const http = require('http');

// Giả lập kết nối database — trong thực tế: mongoose.connection.close()
const db = {
    connected: true,
    async connect() {
        this.connected = true;
        console.log('[DB] Đã kết nối');
    },
    async close() {
        await new Promise((r) => setTimeout(r, 500)); // Giả lập đóng connection
        this.connected = false;
        console.log('[DB] Đã đóng kết nối an toàn');
    },
};

// Theo dõi request đang xử lý
let activeRequests = 0;
let isShuttingDown = false;

const server = http.createServer(async (req, res) => {
    if (isShuttingDown) {
        // Từ chối request mới khi đang shutdown
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server đang tắt, thử lại sau' }));
        return;
    }

    activeRequests++;
    console.log(`[HTTP] ${req.method} ${req.url} — active: ${activeRequests}`);

    // Giả lập xử lý request mất 2 giây
    await new Promise((r) => setTimeout(r, 2000));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'OK', url: req.url }));
    activeRequests--;
    console.log(`[HTTP] Hoàn thành — active: ${activeRequests}`);
});

const PORT = process.env.PORT || 3084;

/**
 * Graceful shutdown sequence:
 * 1. Ngừng nhận connection mới (server.close)
 * 2. Chờ request đang chạy hoàn thành
 * 3. Đóng DB, Redis, queue connections
 * 4. Thoát process
 */
async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[SHUTDOWN] Nhận ${signal}, bắt đầu graceful shutdown...`);

    // Timeout cứng — buộc thoát nếu quá lâu (tránh treo vô hạn)
    const forceExitTimer = setTimeout(() => {
        console.error('[SHUTDOWN] Timeout 30s — buộc thoát');
        process.exit(1);
    }, 30000);
    forceExitTimer.unref(); // Không giữ process sống chỉ vì timer

    // Bước 1: Ngừng nhận request mới
    server.close(() => {
        console.log('[SHUTDOWN] HTTP server đã đóng, không nhận request mới');
    });

    // Bước 2: Chờ request đang xử lý xong
    while (activeRequests > 0) {
        console.log(`[SHUTDOWN] Chờ ${activeRequests} request hoàn thành...`);
        await new Promise((r) => setTimeout(r, 500));
    }

    // Bước 3: Đóng DB và resource khác
    await db.close();

    console.log('[SHUTDOWN] Hoàn tất — thoát process');
    clearTimeout(forceExitTimer);
    process.exit(0);
}

// Lắng nghe tín hiệu tắt từ OS / container orchestrator
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Xử lý lỗi không bắt được
process.on('uncaughtException', (err) => {
    console.error('[FATAL] uncaughtException:', err);
    gracefulShutdown('uncaughtException');
});

async function start() {
    await db.connect();
    server.listen(PORT, () => {
        console.log(`Server chạy tại http://localhost:${PORT}`);
        console.log('Thử: curl http://localhost:3084/test');
        console.log('Nhấn Ctrl+C để test graceful shutdown');
        console.log('Hoặc: node graceful-shutdown.js --demo (tự chạy demo rồi thoát)');

        // Chế độ demo: gửi request → trigger SIGTERM → thoát (không treo terminal)
        if (process.argv.includes('--demo')) {
            setTimeout(async () => {
                activeRequests++;
                await new Promise((r) => setTimeout(r, 100));
                activeRequests--;
                console.log('\n[DEMO] Trigger SIGTERM...');
                process.emit('SIGTERM');
            }, 300);
        }
    });
}

start();
