// Bài 61: Tạo Chat Server bằng WebSocket (ws)
// WebSocket cho phép giao tiếp hai chiều realtime

const WebSocket = require('ws');
const http = require('http');

// Tạo HTTP server (WebSocket thường chạy cùng HTTP)
const server = http.createServer();

// Tạo WebSocket server
const wss = new WebSocket.Server({ 
    server, // Share cùng HTTP server
    path: '/ws' // WebSocket endpoint
});

// Lưu trữ client đã kết nối
const clients = new Set();

// Khi có client kết nối
wss.on('connection', (ws) => {
    console.log('Client mới kết nối');
    
    // Thêm client vào Set
    clients.add(ws);
    
    // Unique ID cho mỗi client
    ws.id = Date.now();
    
    // Khi client gửi tin nhắn
    ws.on('message', (data) => {
        console.log(`Nhận: ${data}`);
        
        // Broadcast tin nhắn tới tất cả client khác
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`User ${ws.id}: ${data}`);
            }
        });
        
        // Gửi lại cho chính sender (echo)
        ws.send(`Bạn đã gửi: ${data}`);
    });
    
    // Khi client ngắt kết nối
    ws.on('close', () => {
        console.log('Client ngắt kết nối');
        clients.delete(ws);
    });
    
    // Lỗi
    ws.on('error', (err) => {
        console.error('WebSocket lỗi:', err.message);
    });
});

// Khởi động server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server chạy tại ws://localhost:${PORT}/ws`);
});

// Test bằng wscat:
// npm install -g wscat
// wscat -c ws://localhost:8080/ws
// Gõ tin nhắn để test