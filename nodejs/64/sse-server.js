// Bài 64: Server-Sent Events (SSE) - đẩy thông báo 1 chiều Server → Client
// SSE dùng HTTP thuần, auto-reconnect built-in, phù hợp notification/feed
// Chạy bằng lệnh: node sse-server.js
// Mở browser: http://localhost:3464

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3464;
const clients = new Set();

// Format message theo chuẩn SSE
function formatSSE(event, data, id) {
    let msg = '';
    if (id) msg += `id: ${id}\n`;
    if (event) msg += `event: ${event}\n`;
    msg += `data: ${JSON.stringify(data)}\n\n`;
    return msg;
}

// Broadcast tới tất cả client đang kết nối
function broadcast(event, data) {
    const message = formatSSE(event, data, Date.now());
    clients.forEach((res) => {
        res.write(message);
    });
}

const server = http.createServer((req, res) => {
    if (req.url === '/events') {
        // Thiết lập SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        clients.add(res);
        console.log(`Client mới kết nối SSE (tổng: ${clients.size})`);

        // Gửi event welcome
        res.write(formatSSE('welcome', { message: 'SSE connected', time: new Date() }));

        // Heartbeat mỗi 15s giữ connection sống (tránh proxy timeout)
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n'); // Comment line - không trigger event
        }, 15000);

        req.on('close', () => {
            clearInterval(heartbeat);
            clients.delete(res);
            console.log(`Client ngắt SSE (còn: ${clients.size})`);
        });

    } else if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(path.join(__dirname, 'sse-client.html'), 'utf-8'));

    } else if (req.url === '/notify') {
        // API trigger gửi notification (simulate admin push)
        broadcast('notification', {
            title: 'Thông báo mới',
            body: 'Đơn hàng #1234 đã được xác nhận',
            time: new Date().toISOString()
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sent: clients.size }));

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Demo: push event định kỳ
let counter = 0;
setInterval(() => {
    counter++;
    broadcast('tick', { counter, time: new Date().toISOString() });
}, 5000);

server.listen(PORT, () => {
    console.log(`SSE server: http://localhost:${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/events`);
    console.log(`Trigger notify: curl http://localhost:${PORT}/notify`);
});
