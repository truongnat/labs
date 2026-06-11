// Bài 20: Nén và giải nén file với module zlib
// zlib là module built-in của Node.js để nén dữ liệu (gzip, deflate)

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Tạo file demo để nén
const inputFile = path.join(__dirname, 'input.txt');
const compressedFile = path.join(__dirname, 'input.txt.gz');

// Viết nội dung vào file demo
fs.writeFileSync(inputFile, 'Hello World! Đây là nội dung cần nén. '.repeat(100));

// Đọc file và nén bằng createGzip stream
const readStream = fs.createReadStream(inputFile);
const writeStream = fs.createWriteStream(compressedFile);

// pipe() để chuyển dữ liệu qua stream nén
readStream.pipe(zlib.createGzip()).pipe(writeStream);

console.log('Đang nén file...');

writeStream.on('finish', () => {
    console.log('Đã nén xong:', compressedFile);
    
    // Giải nén bằng createGunzip
    const unzipStream = fs.createReadStream(compressedFile);
    const output = fs.createWriteStream(path.join(__dirname, 'output.txt'));
    
    unzipStream.pipe(zlib.createGunzip()).pipe(output);
    
    output.on('finish', () => {
        console.log('Đã giải nén xong!');
        
        // Xóa file tạm
        fs.unlinkSync(inputFile);
        fs.unlinkSync(compressedFile);
    });
});