// Bài 63: Socket.io - xử lý Reconnect và Disconnect
// Client mất mạng tạm thời cần reconnect; server cần cleanup state khi disconnect
// Chạy bằng lệnh: node socket-reconnect.js
// Cài đặt: npm install socket.io socket.io-client

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    pingInterval: 5000,   // Gửi ping mỗi 5s
    pingTimeout: 10000    // Coi là disconnect nếu không pong trong 10s
});

// Lưu trạng thái user online (production: dùng Redis)
const onlineUsers = new Map();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId || socket.id;
    console.log(`[CONNECT] User ${userId} (${socket.id})`);

    onlineUsers.set(socket.id, { userId, connectedAt: Date.now() });

    // Thông báo reconnect thành công
    socket.emit('connected', {
        socketId: socket.id,
        message: 'Kết nối thành công',
        onlineCount: onlineUsers.size
    });

    // Client báo đang reconnect (có thể gửi lại state)
    socket.on('rejoin', (room) => {
        socket.join(room);
        console.log(`[REJOIN] ${userId} vào lại phòng ${room}`);
        socket.to(room).emit('user-rejoined', { userId, room });
    });

    socket.on('chat', (msg) => {
        io.emit('chat', { userId, text: msg, at: new Date().toISOString() });
    });

    // Disconnect - cleanup state
    socket.on('disconnect', (reason) => {
        console.log(`[DISCONNECT] User ${userId} - reason: ${reason}`);
        onlineUsers.delete(socket.id);

        // reason phổ biến:
        // - 'transport close': mất mạng / tab đóng
        // - 'ping timeout': không phản hồi ping
        // - 'client namespace disconnect': client gọi socket.disconnect()
        io.emit('user-offline', { userId, reason, onlineCount: onlineUsers.size });
    });

    socket.on('error', (err) => {
        console.error(`[ERROR] Socket ${socket.id}:`, err.message);
    });
});

// Trang demo client với auto-reconnect
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><title>Socket.io Reconnect Demo</title></head>
<body>
<h1>Socket.io Reconnect Demo</h1>
<div id="status">Đang kết nối...</div>
<div id="log"></div>
<script src="/socket.io/socket.io.js"></script>
<script>
const log = (msg) => {
    document.getElementById('log').innerHTML += '<p>' + msg + '</p>';
};

const socket = io({
    query: { userId: 'user-' + Math.floor(Math.random() * 1000) },
    reconnection: true,           // Bật auto reconnect
    reconnectionAttempts: 10,     // Thử tối đa 10 lần
    reconnectionDelay: 1000,      // Chờ 1s trước lần reconnect đầu
    reconnectionDelayMax: 5000    // Max delay 5s (exponential backoff)
});

socket.on('connect', () => {
    document.getElementById('status').textContent = 'Đã kết nối: ' + socket.id;
    log('Connected: ' + socket.id);
    socket.emit('rejoin', 'lobby');
});

socket.on('disconnect', (reason) => {
    document.getElementById('status').textContent = 'Mất kết nối: ' + reason;
    log('Disconnected: ' + reason);
});

socket.on('reconnect', (attempt) => {
    log('Reconnect thành công sau ' + attempt + ' lần thử');
});

socket.on('reconnect_attempt', (n) => log('Đang thử reconnect lần ' + n));
socket.on('reconnect_failed', () => log('Reconnect thất bại - reload trang'));

socket.on('connected', (data) => log('Server: ' + JSON.stringify(data)));
socket.on('user-offline', (data) => log('Offline: ' + JSON.stringify(data)));
</script>
</body></html>`);
});

const PORT = 3463;
server.listen(PORT, () => {
    console.log(`Socket.io reconnect demo: http://localhost:${PORT}`);
    console.log('Mở browser, tắt/bật server để test reconnect');
});
