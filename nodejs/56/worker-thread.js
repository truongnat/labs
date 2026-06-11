// Bài 56: Worker Threads xử lý CPU-intensive
// Chia tác vụ nặng ra thread phụ để không block main thread

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
    // MAIN THREAD - chỉ số hoạch và nhận kết quả
    console.log('Main thread bắt đầu');
    
    const startTime = Date.now();
    
    // Tạo worker với dữ liệu đầu vào
    const worker = new Worker(__filename, {
        workerData: { num: 40 } // Truyền số Fibonacci cần tính
    });
    
    // Khi worker gửi message (kết quả)
    worker.on('message', (result) => {
        console.log(`Fibonacci(40) = ${result}`);
        console.log(`Thời gian: ${Date.now() - startTime}ms`);
    });
    
    // Xử lý lỗi
    worker.on('error', (err) => {
        console.error('Worker lỗi:', err);
    });
    
    // Worker kết thúc
    worker.on('exit', (code) => {
        if (code === 0) console.log('Worker hoàn thành');
        else console.log(`Worker thoát với code: ${code}`);
    });
    
} else {
    // WORKER THREAD - thực hiện tính toán nặng
    
    // Hàm tính Fibonacci (CPU-intensive)
    function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    const result = fibonacci(workerData.num);
    
    // Gửi kết quả về main thread
    parentPort.postMessage(result);
}