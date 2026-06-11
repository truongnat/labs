// Bài 53: Transform Stream - Mã hóa file khi đọc/ghi
// Dùng Transform stream để mã hóa dữ liệu "on the fly" mà không load cả file vào RAM
// Chạy bằng lệnh: node transform-encrypt.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

// Key và IV cố định cho demo (production: dùng env variable + random IV)
const KEY = crypto.scryptSync('nodejs-lab-secret', 'salt', 32);
const IV = Buffer.alloc(16, 0);

// Tạo Transform stream mã hóa AES-256-CBC
function createEncryptTransform() {
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    return new Transform({
        transform(chunk, encoding, callback) {
            callback(null, cipher.update(chunk));
        },
        flush(callback) {
            callback(null, cipher.final());
        }
    });
}

// Transform stream giải mã (đọc file đã mã hóa)
function createDecryptTransform() {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    return new Transform({
        transform(chunk, encoding, callback) {
            callback(null, decipher.update(chunk));
        },
        flush(callback) {
            callback(null, decipher.final());
        }
    });
}

async function main() {
    const inputFile = path.join(__dirname, 'plain.txt');
    const encryptedFile = path.join(__dirname, 'encrypted.bin');
    const decryptedFile = path.join(__dirname, 'decrypted.txt');

    // Tạo file demo
    const content = 'Transform Stream mã hóa file khi đọc/ghi - không ngốn RAM.\n'.repeat(50);
    fs.writeFileSync(inputFile, content, 'utf-8');
    console.log('File gốc:', inputFile, `(${fs.statSync(inputFile).size} bytes)`);

    // Mã hóa: read -> encrypt transform -> write
    await pipeline(
        fs.createReadStream(inputFile),
        createEncryptTransform(),
        fs.createWriteStream(encryptedFile)
    );
    console.log('Đã mã hóa:', encryptedFile, `(${fs.statSync(encryptedFile).size} bytes)`);

    // Giải mã: read encrypted -> decrypt transform -> write
    await pipeline(
        fs.createReadStream(encryptedFile),
        createDecryptTransform(),
        fs.createWriteStream(decryptedFile)
    );
    console.log('Đã giải mã:', decryptedFile);

    const original = fs.readFileSync(inputFile, 'utf-8');
    const restored = fs.readFileSync(decryptedFile, 'utf-8');
    console.log('Khớp nội dung:', original === restored ? '✓' : '✗');

    // Dọn file tạm
    fs.unlinkSync(inputFile);
    fs.unlinkSync(encryptedFile);
    fs.unlinkSync(decryptedFile);
}

main().catch((err) => {
    console.error('Lỗi:', err.message);
    process.exit(1);
});
