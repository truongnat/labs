// Bài 54: stream.pipeline xử lý lỗi tốt hơn pipe()
// pipeline() tự động destroy stream và propagate lỗi - tránh memory leak
// Chạy bằng lệnh: node pipeline-error.js

const fs = require('fs');
const path = require('path');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

const demoFile = path.join(__dirname, 'demo.txt');
fs.writeFileSync(demoFile, 'Dòng 1\nDòng 2\nDòng 3\nDòng 4\n');

// Transform cố tình lỗi khi gặp dòng chứa "LỖI"
const filterTransform = new Transform({
    transform(chunk, encoding, callback) {
        const text = chunk.toString();
        if (text.includes('LỖI')) {
            callback(new Error('Phát hiện dòng lỗi trong stream'));
            return;
        }
        callback(null, chunk);
    }
});

// --- Demo 1: pipe() - lỗi dễ bị "nuốt", stream có thể không được destroy ---
function demoPipeError() {
    console.log('\n=== Demo pipe() - xử lý lỗi thủ công ===');

    const readStream = fs.createReadStream(demoFile);
    const writeStream = fs.createWriteStream(path.join(__dirname, 'out-pipe.txt'));

    readStream.on('error', (err) => console.error('[pipe] Read error:', err.message));
    writeStream.on('error', (err) => console.error('[pipe] Write error:', err.message));

    readStream.pipe(filterTransform).pipe(writeStream);

    writeStream.on('finish', () => console.log('[pipe] Hoàn thành'));
    filterTransform.on('error', (err) => {
        console.error('[pipe] Transform error (phải tự destroy):', err.message);
        readStream.destroy();
        writeStream.destroy();
    });
}

// --- Demo 2: pipeline() - lỗi được catch tập trung, stream tự cleanup ---
async function demoPipelineSuccess() {
    console.log('\n=== Demo pipeline() - thành công ===');

    const upperTransform = new Transform({
        transform(chunk, encoding, callback) {
            callback(null, chunk.toString().toUpperCase());
        }
    });

    await pipeline(
        fs.createReadStream(demoFile),
        upperTransform,
        fs.createWriteStream(path.join(__dirname, 'out-pipeline-ok.txt'))
    );
    console.log('[pipeline] Ghi file thành công');
}

async function demoPipelineError() {
    console.log('\n=== Demo pipeline() - bắt lỗi bằng try/catch ===');

    const badTransform = new Transform({
        transform(chunk, encoding, callback) {
            callback(new Error('Stream bị lỗi giữa chừng'));
        }
    });

    try {
        await pipeline(
            fs.createReadStream(demoFile),
            badTransform,
            fs.createWriteStream(path.join(__dirname, 'out-pipeline-fail.txt'))
        );
    } catch (err) {
        console.error('[pipeline] Lỗi được catch:', err.message);
        console.log('[pipeline] Tất cả stream đã được destroy tự động');
    }
}

// --- Demo 3: Readable tự emit error ---
async function demoReadableError() {
    console.log('\n=== Demo pipeline() - Readable emit error ===');

    const brokenReadable = new Readable({
        read() {
            this.destroy(new Error('Readable stream hỏng'));
        }
    });

    try {
        await pipeline(
            brokenReadable,
            fs.createWriteStream(path.join(__dirname, 'out-broken.txt'))
        );
    } catch (err) {
        console.error('[pipeline] Readable error:', err.message);
    }
}

async function main() {
    demoPipeError();

    await new Promise((r) => setTimeout(r, 100));
    await demoPipelineSuccess();
    await demoPipelineError();
    await demoReadableError();

    // Dọn file tạm
    ['demo.txt', 'out-pipe.txt', 'out-pipeline-ok.txt'].forEach((f) => {
        const p = path.join(__dirname, f);
        if (fs.existsSync(p)) fs.unlinkSync(p);
    });
}

main().catch(console.error);
