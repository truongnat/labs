// Bài 58: Cluster Module - chia tải request ra nhiều CPU core
// Master fork worker, mỗi worker chạy HTTP server riêng (OS load balance)
// Chạy bằng lệnh: node cluster-server.js

const cluster = require('cluster');
const http = require('http');
const os = require('os');

const PORT = 3458;
const NUM_WORKERS = Math.min(os.cpus().length, 4); // Demo tối đa 4 worker

if (cluster.isPrimary) {
    console.log(`Master PID ${process.pid} - fork ${NUM_WORKERS} workers`);

    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    // Worker chết thì tự restart
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} thoát (code=${code}). Restart...`);
        cluster.fork();
    });

} else {
    // Worker process - mỗi worker lắng nghe cùng port (SO_REUSEPORT)
    const server = http.createServer((req, res) => {
        // Simulate CPU work nhẹ
        const start = Date.now();
        while (Date.now() - start < 10) { /* busy 10ms */ }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Cluster demo',
            workerPid: process.pid,
            url: req.url
        }));
    });

    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} lắng nghe http://localhost:${PORT}`);
    });
}

// Test: curl http://localhost:3458/ nhiều lần - sẽ thấy workerPid khác nhau
