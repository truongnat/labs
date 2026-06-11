// ============================================================
// Bài 56: Worker Threads xử lý CPU-intensive
// ============================================================
// Đây là bài quan trọng về Concurrency trong Node.js
//
// Vấn đề:
//   - Node.js là single-threaded (một luồng chính)
//   - CPU-intensive tasks (tính toán nặng) sẽ block event loop
//   - App không phản hồi khi đang tính toán
//
// Giải pháp:
//   - Worker Threads: tạo thread phụ để xử lý tính toán nặng
//   - Main thread vẫn responsive
//   - Worker gửi kết quả về main thread khi xong
//
// Chạy bằng lệnh:
//   node worker-thread.js

// ============================================================
// Import worker_threads module
// ============================================================
// worker_threads là module built-in của Node.js
// Cung cấp API để tạo worker threads
//
// Không cần npm install
// Đã có sẵn trong Node.js runtime
//
// Destructuring:
//   const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
//
// Các exports:
//   - Worker: class để tạo worker thread
//   - isMainThread: boolean, true nếu đang chạy ở main thread
//   - parentPort: MessagePort để giao tiếp giữa main và worker
//   - workerData: dữ liệu truyền từ main thread sang worker
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ============================================================
// Kiểm tra đang chạy ở thread nào
// ============================================================
// isMainThread
// -------------------------
// Boolean
//   - true: đang chạy ở main thread
//   - false: đang chạy ở worker thread
//
// Vì sao cần?
// -------------------------
// Cùng một file được chạy ở cả main thread và worker thread
// Cần phân biệt để chạy code khác nhau:
//   - Main thread: tạo worker, nhận kết quả
//   - Worker thread: thực hiện tính toán nặng
if (isMainThread) {

    // ============================================================
    // MAIN THREAD
    // ============================================================
    // Đây là luồng chính của ứng dụng
    //
    // Nhiệm vụ:
    //   1. Tạo worker thread
    //   2. Gửi dữ liệu cho worker
    //   3. Lắng nghe kết quả từ worker
    //   4. Không bị block khi worker đang tính toán

    // ============================================================
    // Log thông báo
    // ============================================================
    // console.log()
    // -------------------------
    // In ra console để biết main thread đã bắt đầu
    console.log('Main thread bắt đầu');

    // ============================================================
    // Ghi thời điểm bắt đầu
    // ============================================================
    // Date.now()
    // -------------------------
    // Lấy thời điểm hiện tại (milliseconds từ Unix epoch)
    //
    // Mục đích:
    //   - Tính thời gian worker xử lý
    //   - startTime = thời điểm tạo worker
    //   - finishTime = thời điểm nhận kết quả
    //   - duration = finishTime - startTime
    const startTime = Date.now();

    // ============================================================
    // Tạo worker thread
    // ============================================================
    // new Worker(filename, options)
    // -------------------------
    // Tạo một worker thread mới
    //
    // filename
    // -------------------------
    // __filename
    //   - Biến toàn cục của Node.js
    //   - Chứa đường dẫn tuyệt đối của file hiện tại
    //
    // Vì sao dùng __filename?
    //   - Worker cần biết file nào để chạy
    //   - Cùng file này sẽ được chạy ở worker thread
    //
    // options
    // -------------------------
    // Object chứa cấu hình cho worker
    const worker = new Worker(__filename, {

        // workerData
        // -------------------------
        // Dữ liệu truyền từ main thread sang worker
        //
        // workerData: { num: 40 }
        //   - num: số Fibonacci cần tính
        //
        // Worker thread có thể truy cập workerData qua:
        //   const { workerData } = require('worker_threads')
        workerData: { num: 40 } // Truyền số Fibonacci cần tính
    });

    // ============================================================
    // Lắng nghe message từ worker
    // ============================================================
    // worker.on('message', callback)
    // -------------------------
    // Lắng nghe event 'message'
    //
    // Event này được phát khi worker gửi message về main thread
    //
    // callback(result)
    // -------------------------
    // result: dữ liệu worker gửi về
    //
    // Cách worker gửi message:
    //   parentPort.postMessage(result)
    worker.on('message', (result) => {

        // ============================================================
        // Log kết quả
        // ============================================================
        // console.log()
        // -------------------------
        // In kết quả Fibonacci ra console
        //
        // result
        // -------------------------
        // Giá trị Fibonacci(40)
        // Ví dụ: 102334155
        //
        // Template string:
        //   `Fibonacci(40) = ${result}`
        //   = 'Fibonacci(40) = 102334155'
        console.log(`Fibonacci(40) = ${result}`);

        // ============================================================
        // Tính thời gian xử lý
        // ============================================================
        // Date.now() - startTime
        // -------------------------
        // Lấy thời điểm hiện tại trừ đi thời điểm bắt đầu
        //
        // Kết quả:
        //   - Số milliseconds worker đã xử lý
        //
        // Ví dụ:
        //   startTime = 1000ms
        //   finishTime = 1500ms
        //   duration = 500ms
        console.log(`Thời gian: ${Date.now() - startTime}ms`);
    });

    // ============================================================
    // Lắng nghe lỗi từ worker
    // ============================================================
    // worker.on('error', callback)
    // -------------------------
    // Lắng nghe event 'error'
    //
    // Event này được phát khi worker gặp lỗi
    //
    // Các lỗi thường gặp:
    //   - File không tìm thấy
    //   - Lỗi syntax trong worker code
    //   - Lỗi runtime
    worker.on('error', (err) => {

        // console.error()
        // -------------------------
        // In lỗi ra stderr
        //
        // err
        // -------------------------
        // Error object
        // Chứa thông tin về lỗi
        console.error('Worker lỗi:', err);
    });

    // ============================================================
    // Lắng nghe worker exit
    // ============================================================
    // worker.on('exit', callback)
    // -------------------------
    // Lắng nghe event 'exit'
    //
    // Event này được phát khi worker thread kết thúc
    //
    // callback(code)
    // -------------------------
    // code: exit code
    //   - 0: thành công
    //   - 1: có lỗi
    //   - Khác 0: lỗi khác
    worker.on('exit', (code) => {

        // if (code === 0)
        // -------------------------
        // Nếu exit code = 0
        // Worker hoàn thành thành công
        if (code === 0) console.log('Worker hoàn thành');

        // else
        // -------------------------
        // Nếu exit code khác 0
        // Worker thoát với lỗi
        else console.log(`Worker thoát với code: ${code}`);
    });

} else {

    // ============================================================
    // WORKER THREAD
    // ============================================================
    // Đây là thread phụ được tạo bởi main thread
    //
    // Nhiệm vụ:
    //   1. Nhận dữ liệu từ main thread (workerData)
    //   2. Thực hiện tính toán nặng
    //   3. Gửi kết quả về main thread
    //
    // Vì sao dùng worker thread?
    // -------------------------
    //   - Không block main thread
    //   - App vẫn responsive khi đang tính toán
    //   - Tận dụng đa lõi CPU

    // ============================================================
    // Hàm tính Fibonacci
    // ============================================================
    // fibonacci(n)
    // -------------------------
    // Hàm đệ quy tính số Fibonacci thứ n
    //
    // Fibonacci sequence:
    //   0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
    //
    // Công thức:
    //   F(0) = 0
    //   F(1) = 1
    //   F(n) = F(n-1) + F(n-2)
    //
    // Ví dụ:
    //   fibonacci(5) = fibonacci(4) + fibonacci(3)
    //                = 3 + 2
    //                = 5
    //
    // Vì sao CPU-intensive?
    // -------------------------
    //   - Đệ quy không có memoization
    //   - Số lần gọi hàm tăng theo cấp số nhân
    //   - fibonacci(40) cần ~331 triệu lần gọi hàm
    //   - Rất tốn CPU
    function fibonacci(n) {

        // Base case
        // -------------------------
        // if (n <= 1) return n
        //
        // Điều kiện dừng đệ quy
        //
        // fibonacci(0) = 0
        // fibonacci(1) = 1
        if (n <= 1) return n;

        // Recursive case
        // -------------------------
        // return fibonacci(n - 1) + fibonacci(n - 2)
        //
        // Gọi lại chính nó với n-1 và n-2
        //
        // Ví dụ:
        //   fibonacci(5)
        //     = fibonacci(4) + fibonacci(3)
        //     = (fibonacci(3) + fibonacci(2)) + (fibonacci(2) + fibonacci(1))
        //     = ...
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    // ============================================================
    // Tính Fibonacci
    // ============================================================
    // workerData.num
    // -------------------------
    // Lấy dữ liệu từ main thread
    //
    // workerData
    // -------------------------
    // Object được truyền từ main thread:
    //   { num: 40 }
    //
    // workerData.num = 40
    //
    // const result = fibonacci(workerData.num)
    // -------------------------
    // Gọi hàm fibonacci với num = 40
    //
    // Kết quả:
    //   fibonacci(40) = 102334155
    const result = fibonacci(workerData.num);

    // ============================================================
    // Gửi kết quả về main thread
    // ============================================================
    // parentPort.postMessage(result)
    // -------------------------
    // Gửi message từ worker thread về main thread
    //
    // parentPort
    // -------------------------
    // MessagePort để giao tiếp với main thread
    //
    // postMessage(data)
    // -------------------------
    // Gửi data qua message port
    //
    // Main thread lắng nghe bằng:
    //   worker.on('message', (result) => {})
    parentPort.postMessage(result);
}