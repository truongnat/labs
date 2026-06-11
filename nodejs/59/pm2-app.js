// Bài 59: PM2 - quản lý process Node.js production
// PM2 giúp auto-restart, cluster mode, monitoring, log rotation
// Chạy bằng lệnh: node pm2-app.js
// PM2: pm2 start ecosystem.config.js

const http = require('http');

const PORT = process.env.PORT || 3459;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: 'PM2 Demo App',
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
    }));
});

server.listen(PORT, () => {
    console.log(`PM2 demo app chạy tại http://localhost:${PORT}`);
    console.log(`PID: ${process.pid}`);
});

// Graceful shutdown - PM2 gửi SIGINT khi restart/stop
process.on('SIGINT', () => {
    console.log('Nhận SIGINT - đang shutdown gracefully...');
    server.close(() => {
        console.log('Server đã đóng');
        process.exit(0);
    });
});

/*
=== Hướng dẫn PM2 ===

1. Cài PM2 global:
   npm install -g pm2

2. Chạy app:
   pm2 start ecosystem.config.js

3. Các lệnh hữu ích:
   pm2 list              - xem danh sách process
   pm2 logs pm2-demo     - xem log realtime
   pm2 monit             - dashboard monitoring
   pm2 restart pm2-demo  - restart app
   pm2 reload pm2-demo   - zero-downtime reload (cluster mode)
   pm2 stop pm2-demo     - dừng app
   pm2 delete pm2-demo   - xóa khỏi PM2

4. Auto-start khi reboot server:
   pm2 startup
   pm2 save
*/
