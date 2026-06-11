// ============================================================
// Bài 61: Tạo Chat Server bằng WebSocket (ws)
// ============================================================
// Đây là bài quan trọng về Real-time Communication
//
// WebSocket là gì?
// -------------------------
//   - Giao thức giao tiếp hai chiều (full-duplex)
//   - Client và server có thể gửi message cho nhau bất cứ lúc nào
//   - Khác với HTTP:
//     + HTTP: client gửi request, server trả response, rồi đóng connection
//     + WebSocket: connection được giữ mở, gửi/nhận liên tục
//
// Use cases:
//   - Chat application
//   - Real-time notifications
//   - Live score updates
//   - Collaborative editing
//   - Multiplayer games
//
// Chạy bằng lệnh:
//   node chat-ws.js
//
// Test:
//   npm install -g wscat
//   wscat -c ws://localhost:8080/ws

// ============================================================
// Import thư viện ws
// ============================================================
// ws là thư viện WebSocket cho Node.js
//
// Cài đặt:
//   npm install ws
//
// Không có sẵn trong Node.js runtime
// Cần npm install
const WebSocket = require('ws');

// ============================================================
// Import module http
// ============================================================
// http là module built-in của Node.js
//
// Vì sao cần HTTP server?
// -------------------------
//   - WebSocket thường chạy cùng HTTP server
//   - WebSocket handshake bắt đầu bằng HTTP request
//   - Sau khi handshake thành công, connection được nâng cấp lên WebSocket
//
// Không cần npm install
// Đã có sẵn trong Node.js runtime
const http = require('http');

// ============================================================
// Tạo HTTP server
// ============================================================
// http.createServer()
// -------------------------
// Tạo HTTP server
//
// Không có callback
// -------------------------
// Nếu không có callback, server vẫn hoạt động
// Nhưng không xử lý HTTP requests
//
// Vì sao?
// -------------------------
//   - WebSocket server sẽ share cùng HTTP server
//   - HTTP server chỉ dùng để handle WebSocket handshake
//   - Không cần xử lý HTTP routes ở đây
const server = http.createServer();

// ============================================================
// Tạo WebSocket server
// ============================================================
// new WebSocket.Server(options)
// -------------------------
// Tạo WebSocket server
//
// options:
//   - server: HTTP server để share
//   - path: endpoint path cho WebSocket
const wss = new WebSocket.Server({

    // server
    // -------------------------
    // Share cùng HTTP server
    //
    // Vì sao cần?
    // -------------------------
    //   - WebSocket handshake dùng HTTP protocol
    //   - Cần HTTP server để nhận handshake request
    //   - Sau handshake, connection được nâng cấp lên WebSocket
    server,

    // path
    // -------------------------
    // Endpoint path cho WebSocket
    //
    // Client sẽ connect tới:
    //   ws://localhost:8080/ws
    //
    // Nếu không có path:
    //   - WebSocket server lắng nghe trên mọi path
    //   - Không an toàn
    path: '/ws'
});

// ============================================================
// Set để lưu trữ clients
// ============================================================
// clients = new Set()
// -------------------------
// Set là collection không trùng lặp
//
// Vì sao dùng Set?
// -------------------------
//   - Mỗi client là một object WebSocket
//   - Không muốn trùng lặp client
//   - Set tự động loại bỏ duplicates
//
// So với Array:
//   - Array: cần kiểm tra trùng bằng includes()
//   - Set: tự động không trùng
//
// clients chứa:
//   - Tất cả WebSocket connections đang active
const clients = new Set();

// ============================================================
// Event: 'connection'
// ============================================================
// wss.on('connection', callback)
// -------------------------
// Lắng nghe event 'connection'
//
// Event này được phát khi có client mới kết nối
//
// callback(ws)
// -------------------------
// ws: WebSocket object
//   - Đại diện cho connection của client
//   - Có các methods:
//     + send(data): gửi message tới client
//     + close(): đóng connection
//   - Có các events:
//     + 'message': khi client gửi message
//     + 'close': khi client ngắt kết nối
//     + 'error': khi có lỗi
wss.on('connection', (ws) => {

    // ============================================================
    // Log client mới kết nối
    // ============================================================
    // console.log()
    // -------------------------
    // In ra console để debug
    //
    // Khi client connect, server log:
    //   Client mới kết nối
    console.log('Client mới kết nối');

    // ============================================================
    // Thêm client vào Set
    // ============================================================
    // clients.add(ws)
    // -------------------------
    // Thêm WebSocket object vào Set
    //
    // Vì sao cần lưu?
    // -------------------------
    //   - Để broadcast message tới tất cả clients
    //   - Để biết có bao nhiêu clients đang kết nối
    //
    // clients có:
    //   - ws1 (client 1)
    //   - ws2 (client 2)
    //   - ws3 (client 3)
    clients.add(ws);

    // ============================================================
    // Gán unique ID cho client
    // ============================================================
    // ws.id = Date.now()
    // -------------------------
    // Gán ID duy nhất cho mỗi client
    //
    // Date.now()
    // -------------------------
    // Trả về milliseconds từ Unix epoch
    //
    // Ví dụ:
    //   1718123456789
    //
    // Xác suất trùng rất thấp
    //
    // Vì sao cần ID?
    // -------------------------
    //   - Để hiển thị user nào gửi message
    //   - Để debug
    ws.id = Date.now();

    // ============================================================
    // Event: 'message'
    // ============================================================
    // ws.on('message', callback)
    // -------------------------
    // Lắng nghe event 'message' từ client
    //
    // Event này được phát khi client gửi message
    //
    // callback(data)
    // -------------------------
    // data: message từ client
    //   - Type: Buffer hoặc string
    //   - Trong ví dụ này, data là Buffer
    ws.on('message', (data) => {

        // ============================================================
        // Log message nhận được
        // ============================================================
        // console.log()
        // -------------------------
        // In message ra console
        //
        // Template string:
        //   `Nhận: ${data}`
        //
        // Vì data là Buffer, khi convert to string sẽ hiển thị nội dung
        console.log(`Nhận: ${data}`);

        // ============================================================
        // Broadcast message tới tất cả clients khác
        // ============================================================
        // clients.forEach(callback)
        // -------------------------
        // Lặp qua tất cả clients trong Set
        //
        // callback(client)
        // -------------------------
        // client: WebSocket object của mỗi client
        //
        // clients.forEach(client => {
        //   ...
        // })
        clients.forEach(client => {

            // ============================================================
            // Kiểm tra điều kiện
            // ============================================================
            // if (client !== ws && client.readyState === WebSocket.OPEN)
            // -------------------------
            // client !== ws
            //   - Không gửi lại cho chính sender
            //   - Vì sender đã nhận echo message riêng
            //
            // client.readyState === WebSocket.OPEN
            //   - Kiểm tra connection còn mở không
            //   - Chỉ gửi message nếu connection còn active
            //
            // readyState values:
            //   - WebSocket.CONNECTING (0): đang kết nối
            //   - WebSocket.OPEN (1): đã kết nối
            //   - WebSocket.CLOSING (2): đang đóng
            //   - WebSocket.CLOSED (3): đã đóng
            if (client !== ws && client.readyState === WebSocket.OPEN) {

                // ============================================================
                // Gửi message tới client
                // ============================================================
                // client.send(data)
                // -------------------------
                // Gửi message tới client
                //
                // Template string:
                //   `User ${ws.id}: ${data}`
                //
                // Ví dụ:
                //   User 1718123456789: Xin chào
                //
                // ws.id
                // -------------------------
                // ID của sender
                //
                // data
                // -------------------------
                // Message từ sender
                client.send(`User ${ws.id}: ${data}`);
            }
        });

        // ============================================================
        // Echo message cho sender
        // ============================================================
        // ws.send(data)
        // -------------------------
        // Gửi message lại cho chính sender
        //
        // Vì sao cần echo?
        // -------------------------
        //   - Để sender biết message đã được gửi
        //   - Trong chat app, sender thấy message của mình
        //
        // Template string:
        //   `Bạn đã gửi: ${data}`
        //
        // Ví dụ:
        //   Bạn đã gửi: Xin chào
        ws.send(`Bạn đã gửi: ${data}`);
    });

    // ============================================================
    // Event: 'close'
    // ============================================================
    // ws.on('close', callback)
    // -------------------------
    // Lắng nghe event 'close'
    //
    // Event này được phát khi client ngắt kết nối
    //
    // Các trường hợp:
    //   - Client đóng browser
    //   - Client gọi ws.close()
    //   - Connection timeout
    ws.on('close', () => {

        // ============================================================
        // Log client ngắt kết nối
        // ============================================================
        // console.log()
        // -------------------------
        // In ra console
        console.log('Client ngắt kết nối');

        // ============================================================
        // Xóa client khỏi Set
        // ============================================================
        // clients.delete(ws)
        // -------------------------
        // Xóa WebSocket object khỏi Set
        //
        // Vì sao cần xóa?
        // -------------------------
        //   - Tránh memory leak
        //   - Không broadcast tới client đã disconnect
        //   - clients Set chỉ chứa active connections
        clients.delete(ws);
    });

    // ============================================================
    // Event: 'error'
    // ============================================================
    // ws.on('error', callback)
    // -------------------------
    // Lắng nghe event 'error'
    //
    // Event này được phát khi có lỗi với WebSocket connection
    //
    // Các lỗi thường gặp:
    //   - Connection reset
    //   - Network error
    //   - Protocol error
    ws.on('error', (err) => {

        // ============================================================
        // Log lỗi
        // ============================================================
        // console.error()
        // -------------------------
        // In lỗi ra stderr
        //
        // err.message
        // -------------------------
        // Lấy thông điệp lỗi từ Error object
        console.error('WebSocket lỗi:', err.message);
    });
});

// ============================================================
// Khởi động server
// ============================================================
// PORT = 8080
// -------------------------
// Port mà server lắng nghe
//
// Vì sao 8080?
// -------------------------
//   - Port phổ biến cho development
//   - Tránh conflict với port 3000 (thường dùng cho web app)
//
// server.listen(PORT, callback)
// -------------------------
// Bắt đầu server lắng nghe trên port
//
// callback()
// -------------------------
// Chạy khi server đã sẵn sàng
const PORT = 8080;
server.listen(PORT, () => {

    // console.log()
    // -------------------------
    // In thông báo server đã chạy
    //
    // ws://localhost:8080/ws
    // -------------------------
    //   - ws://: WebSocket protocol (không phải http://)
    //   - localhost: server chạy local
    //   - 8080: port
    //   - /ws: path endpoint
    console.log(`WebSocket server chạy tại ws://localhost:${PORT}/ws`);
});

// ============================================================
// Hướng dẫn test
// ============================================================
//
// 1. Cài đặt wscat:
//    npm install -g wscat
//
// 2. Kết nối tới server:
//    wscat -c ws://localhost:8080/ws
//
// 3. Mở thêm terminal khác:
//    wscat -c ws://localhost:8080/ws
//
// 4. Gõ tin nhắn ở terminal 1:
//    Xin chào
//
// 5. Terminal 2 sẽ nhận:
//    User 1718123456789: Xin chào
//
// 6. Terminal 1 sẽ nhận echo:
//    Bạn đã gửi: Xin chào