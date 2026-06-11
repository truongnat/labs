// Bài 62: Socket.io - Chat Room và Broadcast
// Socket.io cung cấp API dễ dùng hơn WebSocket thuần

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Tạo Socket.io server
const io = socketIo(server, {
    cors: { origin: '*' } // Cho phép mọi origin (production: chỉ định host cụ thể)
});

// Khi client kết nối
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Tham gia room (phòng chat)
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.id} vào phòng ${roomName}`);
        
        // Thông báo cho room
        socket.to(roomName).emit('message', {
            user: 'system',
            text: `User ${socket.id} đã tham gia phòng`
        });
    });
    
    // Nhận tin nhắn
    socket.on('chatMessage', ({ room, message }) => {
        // Gửi tới phòng cụ thể
        io.to(room).emit('message', {
            user: socket.id,
            text: message,
            timestamp: new Date()
        });
    });
    
    // Broadcast tới mọi client trong cùng room
    socket.on('broadcast', (message) => {
        socket.broadcast.emit('notification', message);
    });
    
    // Ngắt kết nối
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Socket.io server chạy tại http://localhost:3000');
});

// Client JavaScript:
// const socket = io('http://localhost:3000');
// socket.emit('joinRoom', 'room1');
// socket.on('message', msg => console.log(msg));