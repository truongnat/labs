// server.js
const express = require('express');
const path = require('path');
const app = express();

// Phục vụ file HTML từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Giả lập Database lưu trữ sự kiện (để xử lý Reconnect)
let eventHistory = [];
let currentId = 1;

// Endpoint SSE
app.get('/events', (req, res) => {
    // 1. BẮT BUỘC: Set headers cho SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache'); // Không cho browser cache
    res.setHeader('Connection', 'keep-alive');   // Giữ kết nối
    res.setHeader('Access-Control-Allow-Origin', '*'); // Nếu gọi cross-domain

    // Đẩy headers đi ngay lập tức (tránh Express bị buffer)
    res.flushHeaders();

    // 2. Xử lý Reconnection (Tính năng "ăn tiền" của SSE)
    const lastEventId = req.headers['last-event-id'];
    if (lastEventId) {
        console.log(`[Server] Client reconnect từ ID: ${lastEventId}`);
        // Gửi bù các sự kiện client bị lỡ
        const missedEvents = eventHistory.filter(e => e.id > parseInt(lastEventId));
        missedEvents.forEach(event => {
            res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${event.data}\n\n`);
        });
    }

    // 3. Tạo luồng dữ liệu (Stream)
    // Giả lập giá Coin thay đổi mỗi 2 giây
    const priceInterval = setInterval(() => {
        const btcPrice = (60000 + Math.random() * 5000).toFixed(2);
        const payload = JSON.stringify({ coin: 'BTC', price: btcPrice });

        // Format chuẩn của SSE: "data: {json}\n\n" (Lưu ý 2 dấu xuống dòng)
        const sseString = `id: ${currentId}\ndata: ${payload}\n\n`;
        res.write(sseString);

        // Lưu vào history để xử lý reconnect
        eventHistory.push({ id: currentId, type: 'message', data: payload });
        currentId++;

        // Xóa history cũ để tránh tràn RAM (chỉ giữ 50 bản ghi gần nhất)
        if (eventHistory.length > 50) eventHistory.shift();
    }, 2000);

    // Giả lập Cảnh báo (Alert) ngẫu nhiên mỗi 7 giây (Dùng Custom Event)
    const alertInterval = setInterval(() => {
        const alertMsg = JSON.stringify({ msg: "Cá mập đang xả hàng! Bán ngay!" });
        // Format: "event: ten_event\ndata: {json}\n\n"
        const sseString = `id: ${currentId}\nevent: whale_alert\ndata: ${alertMsg}\n\n`;
        res.write(sseString);

        eventHistory.push({ id: currentId, type: 'whale_alert', data: alertMsg });
        currentId++;
    }, 7000);

    // 4. BẮT BUỘC: Dọn dẹp khi Client đóng kết nối (F5 tab, tắt mạng)
    req.on('close', () => {
        console.log('[Server] Client disconnected. Dọn dẹp interval...');
        clearInterval(priceInterval);
        clearInterval(alertInterval);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[Server] SSE Demo đang chạy tại http://localhost:${PORT}`);
});
