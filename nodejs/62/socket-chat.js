// ============================================================
// Bài 62: Socket.io - Chat Room và Broadcast
// ============================================================
// Đây là bài nâng cao hơn bài 61 (WebSocket thuần)
//
// Socket.io là gì?
// -------------------------
//   - Thư viện real-time communication
//   - Dựa trên WebSocket nhưng có thêm features:
//     + Auto reconnect
//     + Rooms
//     + Broadcasting
//     + Fallback nếu WebSocket không hỗ trợ
//     + ACK callbacks
//
// So với ws thuần:
//   - ws: đơn giản, nhẹ, ít features
//   - socket.io: nhiều features hơn, dễ dùng hơn
//
// Use cases:
//   - Chat application với rooms
//   - Real-time notifications
//   - Live dashboard
//   - Collaborative tools
//
// Chạy bằng lệnh:
//   node socket-chat.js

// ============================================================
// Import thư viện express
// ============================================================
// express là web framework cho Node.js
//
// Cài đặt:
//   npm install express
//
// Vì sao cần Express?
// -------------------------
//   - Socket.io cần HTTP server
//   - Express tạo HTTP server dễ hơn
//   - Có thể thêm routes HTTP khác nếu cần
const express = require('express');

// ============================================================
// Import module http
// ============================================================
// http là module built-in của Node.js
//
// Vì sao cần HTTP server?
// -------------------------
//   - Socket.io chạy trên HTTP server
//   - HTTP server xử lý initial handshake
//   - Sau handshake, connection được nâng cấp lên WebSocket
const http = require('http');

// ============================================================
// Import thư viện socket.io
// ============================================================
// socket.io là thư viện real-time communication
//
// Cài đặt:
//   npm install socket.io
//
// socketIo(server, options)
// -------------------------
// Tạo Socket.io server attached vào HTTP server
const socketIo = require('socket.io');

// ============================================================
// Tạo Express application
// ============================================================
// express()
// -------------------------
// Tạo Express application instance
//
// app
// -------------------------
// Object chứa:
//   - Routes
//   - Middleware
//   - Cấu hình
const app = express();

// ============================================================
// Tạo HTTP server từ Express app
// ============================================================
// http.createServer(app)
// -------------------------
// Tạo HTTP server với Express app làm request handler
//
// app
// -------------------------
// Express app function
//   - Nhận req, res
//   - Xử lý routing
//   - Gửi response
const server = http.createServer(app);

// ============================================================
// Tạo Socket.io server
// ============================================================
// socketIo(server, options)
// -------------------------
// Tạo Socket.io server attached vào HTTP server
//
// server
// -------------------------
// HTTP server đã tạo ở trên
//
// options
// -------------------------
// Cấu hình cho Socket.io
const io = socketIo(server, {

    // cors
    // -------------------------
    // Cấu hình Cross-Origin Resource Sharing
    //
    // origin: '*'
    // -------------------------
    // Cho phép mọi origin kết nối
    //
    // Trong production:
    //   - KHÔNG dùng '*'
    //   - Chỉ định domains cụ thể
    //   - Ví dụ: { origin: 'https://yourdomain.com' }
    //
    // Vì sao cần CORS?
    // -------------------------
    //   - Browser có security policy
    //   - Chỉ cho phép kết nối từ cùng origin
    //   - CORS cho phép cross-origin connections
    cors: { origin: '*' }
});

// ============================================================
// Event: 'connection'
// ============================================================
// io.on('connection', callback)
// -------------------------
// Lắng nghe event 'connection'
//
// Event này được phát khi có client mới kết nối
//
// callback(socket)
// -------------------------
// socket: Socket object
//   - Đại diện cho connection của client
//   - Có các methods:
//     + emit(event, data): gửi event tới client
//     + join(room): tham gia room
//     + leave(room): rời room
//     + to(room).emit(): gửi tới room
//     + broadcast.emit(): broadcast tới các client khác
//   - Có các events:
//     + 'message': khi client gửi message
//     + 'disconnect': khi client ngắt kết nối
io.on('connection', (socket) => {

    // ============================================================
    // Log user kết nối
    // ============================================================
    // console.log()
    // -------------------------
    // In ra console
    //
    // socket.id
    // -------------------------
    // ID duy nhất của socket connection
    //
    // Ví dụ:
    //   'abc123xyz'
    //
    // Mỗi client có một socket.id duy nhất
    console.log('User connected:', socket.id);

    // ============================================================
    // Event: 'joinRoom'
    // ============================================================
    // socket.on('joinRoom', callback)
    // -------------------------
    // Lắng nghe event 'joinRoom' từ client
    //
    // Event này được phát khi client muốn tham gia room
    //
    // callback(roomName)
    // -------------------------
    // roomName: tên room muốn tham gia
    //
    // Client gửi:
    //   socket.emit('joinRoom', 'room1')
    socket.on('joinRoom', (roomName) => {

        // ============================================================
        // Tham gia room
        // ============================================================
        // socket.join(roomName)
        // -------------------------
        // Cho socket tham gia room
        //
        // Room là gì?
        // -------------------------
        //   - Một nhóm các socket connections
        //   - Có thể gửi message tới tất cả sockets trong room
        //   - Dùng cho chat rooms, private messaging
        //
        // Ví dụ:
        //   socket.join('room1')
        //   => Socket này thuộc room 'room1'
        socket.join(roomName);

        // ============================================================
        // Log thông báo
        // ============================================================
        // console.log()
        // -------------------------
        // In ra console
        //
        // Template string:
        //   `User ${socket.id} vào phòng ${roomName}`
        //
        // Ví dụ:
        //   User abc123xyz vào phòng room1
        console.log(`User ${socket.id} vào phòng ${roomName}`);

        // ============================================================
        // Thông báo cho các users khác trong room
        // ============================================================
        // socket.to(roomName).emit('message', data)
        // -------------------------
        // Gửi event tới các socket trong room
        //
        // socket.to(roomName)
        // -------------------------
        //   - Gửi tới roomName
        //   - KHÔNG gửi tới chính socket này
        //
        // .emit('message', data)
        // -------------------------
        //   - Gửi event tên 'message'
        //   - Kèm theo data object
        //
        // data object:
        //   {
        //     user: 'system',
        //     text: 'User abc123xyz đã tham gia phòng'
        //   }
        socket.to(roomName).emit('message', {

            // user: 'system'
            // -------------------------
            // Sender là hệ thống
            // Không phải user cụ thể
            user: 'system',

            // text
            // -------------------------
            // Nội dung thông báo
            //
            // Template string:
            //   `User ${socket.id} đã tham gia phòng`
            text: `User ${socket.id} đã tham gia phòng`
        });
    });

    // ============================================================
    // Event: 'chatMessage'
    // ============================================================
    // socket.on('chatMessage', callback)
    // -------------------------
    // Lắng nghe event 'chatMessage' từ client
    //
    // Event này được phát khi client gửi tin nhắn chat
    //
    // callback({ room, message })
    // -------------------------
    // Destructuring object
    //
    // Client gửi:
    //   socket.emit('chatMessage', {
    //     room: 'room1',
    //     message: 'Xin chào'
    //   })
    //
    // Sau destructuring:
    //   room = 'room1'
    //   message = 'Xin chào'
    socket.on('chatMessage', ({ room, message }) => {

        // ============================================================
        // Gửi message tới room
        // ============================================================
        // io.to(room).emit('message', data)
        // -------------------------
        // Gửi event tới tất cả sockets trong room
        //
        // io.to(room)
        // -------------------------
        //   - Chọn room
        //   - io là Socket.io server instance
        //   - to(room) trả về Broadcaster
        //
        // .emit('message', data)
        // -------------------------
        //   - Gửi event 'message'
        //   - Kèm data object
        io.to(room).emit('message', {

            // user: socket.id
            // -------------------------
            // Sender là socket.id của người gửi
            //
            // Ví dụ:
            //   'abc123xyz'
            user: socket.id,

            // text: message
            // -------------------------
            // Nội dung tin nhắn từ client
            //
            // Ví dụ:
            //   'Xin chào'
            text: message,

            // timestamp: new Date()
            // -------------------------
            // Thời gian gửi message
            //
            // new Date()
            // -------------------------
            // Tạo Date object với thời gian hiện tại
            //
            // Khi gửi qua Socket.io, Date object được serialize
            // Client nhận được ISO string
            timestamp: new Date()
        });
    });

    // ============================================================
    // Event: 'broadcast'
    // ============================================================
    // socket.on('broadcast', callback)
    // -------------------------
    // Lắng nghe event 'broadcast' từ client
    //
    // Event này được phát khi client muốn broadcast message
    //
    // callback(message)
    // -------------------------
    // message: nội dung cần broadcast
    socket.on('broadcast', (message) => {

        // ============================================================
        // Broadcast tới các client khác trong cùng room
        // ============================================================
        // socket.broadcast.emit('notification', message)
        // -------------------------
        // Gửi event tới TẤT CẢ các client KHÁC
        //
        // socket.broadcast
        // -------------------------
        //   - Broadcast tới các socket khác
        //   - KHÔNG gửi tới chính socket này
        //
        // .emit('notification', message)
        // -------------------------
        //   - Gửi event tên 'notification'
        //   - Kèm message
        //
        // Khác với io.to(room).emit():
        //   - io.to(room).emit(): gửi tới tất cả trong room (bao gồm sender)
        //   - socket.broadcast.emit(): gửi tới tất cả TRỪ sender
        socket.broadcast.emit('notification', message);
    });

    // ============================================================
    // Event: 'disconnect'
    // ============================================================
    // socket.on('disconnect', callback)
    // -------------------------
    // Lắng nghe event 'disconnect'
    //
    // Event này được phát khi client ngắt kết nối
    //
    // Các trường hợp:
    //   - Client đóng browser
    //   - Client mất kết nối mạng
    //   - Socket.io timeout
    socket.on('disconnect', () => {

        // ============================================================
        // Log user disconnect
        // ============================================================
        // console.log()
        // -------------------------
        // In ra console
        //
        // socket.id
        // -------------------------
        // ID của socket đã disconnect
        console.log('User disconnected:', socket.id);
    });
});

// ============================================================
// Khởi động server
// ============================================================
// server.listen(port, callback)
// -------------------------
// Bắt đầu HTTP server lắng nghe trên port 3000
//
// callback()
// -------------------------
// Chạy khi server đã sẵn sàng
server.listen(3000, () => {

    // console.log()
    // -------------------------
    // In thông báo server đã chạy
    console.log('Socket.io server chạy tại http://localhost:3000');
});

// ============================================================
// Client JavaScript code
// ============================================================
// Đây là code phía client (browser)
//
// const socket = io('http://localhost:3000');
// -------------------------
// Tạo Socket.io client connection
//
// socket.emit('joinRoom', 'room1');
// -------------------------
// Gửi event 'joinRoom' tới server
//
// socket.on('message', msg => console.log(msg));
// -------------------------
// Lắng nghe event 'message' từ server