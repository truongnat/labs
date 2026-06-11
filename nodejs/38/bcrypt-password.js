// ============================================================
// Bài 38: Hash password bằng bcrypt
// ============================================================
// Đây là bài quan trọng về Authentication (xác thực người dùng)
//
// Vấn đề:
//   - Không bao giờ lưu password dạng plain text trong database
//   - Nếu database bị hack, hacker sẽ biết tất cả password
//
// Giải pháp:
//   - Hash password trước khi lưu vào database
//   - Khi user login, hash password nhập vào và so sánh với hash đã lưu
//
// Chạy bằng lệnh:
//   node bcrypt-password.js

// ============================================================
// Import thư viện bcrypt
// ============================================================
// bcrypt là thư viện hash password chuẩn mực ngành
// Sử dụng thuật toán Blowfish cipher
//
// Cài đặt:
//   npm install bcrypt
//
// Lưu ý:
//   - bcrypt tự động tạo salt
//   - Không cần lưu salt riêng
//   - Thời gian hash tăng theo saltRounds
const bcrypt = require('bcrypt');

// ============================================================
// Hàm hash password
// ============================================================
// async function
// -------------------------
// Hàm async cho phép dùng await bên trong
// bcrypt.hash() là async function (trả về Promise)
//
// Tham số:
//   password: string - password người dùng nhập
//
// Trả về:
//   hash: string - chuỗi hash đã mã hóa
async function hashPassword(password) {

    // ============================================================
    // saltRounds: độ phức tạp của thuật toán
    // ============================================================
    // saltRounds là số lần lặp của thuật toán
    //
    // Ý nghĩa:
    //   - saltRounds càng cao => càng bảo mật nhưng càng chậm
    //   - saltRounds càng thấp => càng nhanh nhưng kém bảo mật
    //
    // Khuyến nghị:
    //   - 10-12 cho production
    //   - 8 cho development (nhanh hơn)
    //   - 14+ cho hệ thống cực kỳ bảo mật
    //
    // Ví dụ:
    //   saltRounds = 10: ~100ms
    //   saltRounds = 12: ~400ms
    //   saltRounds = 14: ~1600ms
    const saltRounds = 10;

    // ============================================================
    // try-catch để xử lý lỗi
    // ============================================================
    // try: chứa code có thể phát sinh lỗi
    // catch: xử lý khi có lỗi xảy ra
    //
    // Vì sao cần try-catch?
    //   - bcrypt.hash() có thể lỗi nếu password không hợp lệ
    //   - Không để app crash khi có lỗi
    try {

        // ============================================================
        // bcrypt.hash(password, saltRounds)
        // ============================================================
        // Hàm hash password của thư viện bcrypt
        //
        // Tham số:
        //   password: string - password cần hash
        //   saltRounds: number - độ phức tạp
        //
        // Trả về:
        //   Promise<string> - chuỗi hash
        //
        // await:
        // -------------------------
        // Chờ Promise resolve rồi lấy kết quả
        // Nếu không dùng await, sẽ nhận được Promise object
        //
        // Kết quả hash có dạng:
        //   $2b$10$N9qo8uLOickgx2ZMRZoMye...
        //
        // Giải thích format:
        //   $2b$     = thuật toán (bcrypt variant)
        //   10$      = saltRounds
        //   N9qo...  = salt + hash
        const hash = await bcrypt.hash(password, saltRounds);

        // ============================================================
        // Log kết quả
        // ============================================================
        // console.log() in ra console để xem kết quả
        //
        // Password: MatKhauCuaBan@123
        // Hash: $2b$10$N9qo8uLOickgx2ZMRZoMye...
        console.log('Password:', password);
        console.log('Hash:', hash);

        // ============================================================
        // Trả về hash
        // ============================================================
        // return hash
        // -------------------------
        // Trả về chuỗi hash để caller sử dụng
        // Trong thực tế, hash này sẽ được lưu vào database
        return hash;

    } catch (error) {

        // ============================================================
        // Xử lý lỗi
        // ============================================================
        // catch block chạy khi có lỗi trong try block
        //
        // console.error()
        // -------------------------
        // In lỗi ra stderr (standard error)
        // Khác với console.log() in ra stdout
        //
        // error.message
        // -------------------------
        // Lấy thông điệp lỗi từ Error object
        console.error('Lỗi hash:', error.message);

        // Không có return => function trả về undefined
    }
}

// ============================================================
// Hàm kiểm tra password
// ============================================================
// async function verifyPassword(password, hash)
// -------------------------
// Kiểm tra password nhập vào có khớp với hash đã lưu không
//
// Tham số:
//   password: string - password người dùng nhập khi login
//   hash: string - hash đã lưu trong database
//
// Trả về:
//   boolean - true nếu khớp, false nếu không khớp
async function verifyPassword(password, hash) {

    // ============================================================
    // try-catch để xử lý lỗi
    // ============================================================
    try {

        // ============================================================
        // bcrypt.compare(password, hash)
        // ============================================================
        // Hàm so sánh password với hash
        //
        // Cách hoạt động:
        //   1. Lấy salt từ hash
        //   2. Hash password nhập vào với salt đó
        //   3. So sánh kết quả với hash đã lưu
        //
        // Trả về:
        //   Promise<boolean>
        //   - true: password khớp
        //   - false: password không khớp
        const match = await bcrypt.compare(password, hash);

        // ============================================================
        // Log kết quả
        // ============================================================
        // match là boolean (true/false)
        //
        // Ví dụ output:
        //   Password khớp: true
        //   Password khớp: false
        console.log('Password khớp:', match);

        // ============================================================
        // Trả về kết quả
        // ============================================================
        // return match
        // -------------------------
        // Trả về boolean để caller sử dụng
        // Trong thực tế:
        //   - true: đăng nhập thành công
        //   - false: sai password
        return match;

    } catch (error) {

        // ============================================================
        // Xử lý lỗi
        // ============================================================
        console.error('Lỗi verify:', error.message);
    }
}

// ============================================================
// Hàm demo
// ============================================================
// async function demo()
// -------------------------
// Hàm chạy demo để minh họa cách dùng bcrypt
//
// async vì cần await các hàm bcrypt
async function demo() {

    // ============================================================
    // Password mẫu
    // ============================================================
    // Đây là password người dùng nhập khi đăng ký
    // Trong thực tế, password này đến từ req.body.password
    const password = 'MatKhauCuaBan@123';

    // ============================================================
    // Hash password
    // ============================================================
    // Gọi hàm hashPassword() với password
    // Kết quả là chuỗi hash
    //
    // await:
    // -------------------------
    // Chờ hàm hashPassword() hoàn thành rồi lấy kết quả
    const hash = await hashPassword(password);

    // ============================================================
    // Verify với password đúng
    // ============================================================
    // Gọi verifyPassword() với password đúng
    // Kết quả: true
    //
    // Ý nghĩa:
    //   - Người dùng nhập đúng password
    //   - Đăng nhập thành công
    await verifyPassword(password, hash); // true

    // ============================================================
    // Verify với password sai
    // ============================================================
    // Gọi verifyPassword() với password sai
    // Kết quả: false
    //
    // Ý nghĩa:
    //   - Người dùng nhập sai password
    //   - Đăng nhập thất bại
    await verifyPassword('SaiMatKhau', hash); // false
}

// ============================================================
// Lưu ý quan trọng
// ============================================================
// Các nguyên tắc bảo mật khi xử lý password:
//
// 1. Không bao giờ lưu password dạng plain text
//    - Sai:   password = '123456'
//    - Đúng:  passwordHash = '$2b$10$...'
//
// 2. bcrypt tự động tạo salt
//    - Không cần lưu salt riêng
//    - Salt được embedded trong hash string
//
// 3. Thời gian hash tăng theo saltRounds
//    - saltRounds 10: ~100ms
//    - saltRounds 12: ~400ms
//    - saltRounds 14: ~1600ms
//
// 4. bcrypt vs argon2:
//    - bcrypt: chuẩn mực ngành, được dùng rộng rãi
//    - argon2: thuật toán mới hơn, bảo mật hơn
//    - Cả hai đều tốt, bcrypt là lựa chọn an toàn

// ============================================================
// Chạy demo
// ============================================================
// Gọi hàm demo() để chạy chương trình
//
// Output mong đợi:
//   Password: MatKhauCuaBan@123
//   Hash: $2b$10$...
//   Password khớp: true
//   Password khớp: false
demo();