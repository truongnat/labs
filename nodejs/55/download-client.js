// Bài 55: Client tải file lớn bằng Stream (phần Client)
// Ghi trực tiếp response stream xuống disk - không buffer cả file trong RAM
// Chạy bằng lệnh: node download-client.js
// (Cần chạy server trước: node download-server.js)

const fs = require('fs');
const path = require('path');
const http = require('http');

const SERVER_URL = 'http://localhost:3455/download';
const outputFile = path.join(__dirname, 'downloaded-file.bin');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        console.log('Bắt đầu download:', url);

        const request = http.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
            let downloaded = 0;

            const writeStream = fs.createWriteStream(dest);

            response.on('data', (chunk) => {
                downloaded += chunk.length;
                if (totalBytes) {
                    const pct = ((downloaded / totalBytes) * 100).toFixed(1);
                    process.stdout.write(`\rĐã tải: ${downloaded}/${totalBytes} bytes (${pct}%)`);
                }
            });

            response.pipe(writeStream);

            writeStream.on('finish', () => {
                console.log('\nDownload hoàn tất:', dest);
                resolve(downloaded);
            });

            writeStream.on('error', reject);
            response.on('error', reject);
        });

        request.on('error', reject);
    });
}

downloadFile(SERVER_URL, outputFile)
    .then((bytes) => {
        const stat = fs.statSync(outputFile);
        console.log(`File lưu tại: ${outputFile} (${stat.size} bytes)`);
        fs.unlinkSync(outputFile);
        console.log('Đã xóa file demo sau khi test');
    })
    .catch((err) => {
        console.error('Lỗi download:', err.message);
        console.log('Hãy chạy server trước: node download-server.js');
        process.exit(1);
    });
