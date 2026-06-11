// Bài 55: Server stream file lớn xuống client (phần Server)
// Không đọc cả file vào memory - dùng fs.createReadStream + pipe
// Chạy bằng lệnh: node download-server.js
// Sau đó chạy client: node download-client.js

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3455;
const largeFile = path.join(__dirname, 'large-file.bin');

// Tạo file demo ~5MB (simulate file lớn)
if (!fs.existsSync(largeFile)) {
    console.log('Tạo file demo 5MB...');
    const chunk = Buffer.alloc(1024 * 1024, 'A'); // 1MB
    const fd = fs.openSync(largeFile, 'w');
    for (let i = 0; i < 5; i++) {
        fs.writeSync(fd, chunk);
    }
    fs.closeSync(fd);
}

const server = http.createServer((req, res) => {
    if (req.url === '/download') {
        const stat = fs.statSync(largeFile);

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="large-file.bin"'
        });

        // Stream file - không load vào RAM
        const readStream = fs.createReadStream(largeFile);

        readStream.on('error', (err) => {
            console.error('Lỗi đọc file:', err.message);
            if (!res.headersSent) {
                res.writeHead(500);
            }
            res.end('Lỗi server');
        });

        readStream.pipe(res);
        console.log(`Đang stream ${stat.size} bytes cho client...`);

    } else if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('GET /download để tải file lớn bằng stream\n');
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Download server: http://localhost:${PORT}/download`);
    console.log('Chạy client: node download-client.js');
});
