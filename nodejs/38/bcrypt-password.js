// Bài 38: Hash password bằng bcrypt
// bcrypt là thuật toán hash password chuẩn mực ngành (băm mật khẩu)

const bcrypt = require('bcrypt');

// Hàm hash password
async function hashPassword(password) {
    // saltRounds: độ phức tạp (số vòng lặp)
    // Nên dùng 10-12 vì nó ảnh hưởng tới performance
    const saltRounds = 10;
    
    try {
        // bcrypt.hash tạo salt và hash password
        // Trả về chuỗi hash dạng: $2b$10$...
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);
        return hash;
    } catch (error) {
        console.error('Lỗi hash:', error);
    }
}

// Hàm kiểm tra password
async function verifyPassword(password, hash) {
    try {
        // bcrypt.compare kiểm tra password có khớp với hash không
        // Trả về true/false
        const match = await bcrypt.compare(password, hash);
        console.log('Password khớp:', match);
        return match;
    } catch (error) {
        console.error('Lỗi verify:', error);
    }
}

// Demo
async function demo() {
    const password = 'MatKhauCuaBan@123';
    
    // Hash password
    const hash = await hashPassword(password);
    
    // Verify đúng password
    await verifyPassword(password, hash); // true
    
    // Verify sai password
    await verifyPassword('SaiMatKhau', hash); // false
}

// Lưu ý quan trọng:
// - Không bao giờ lưu password dạng plain text
// - bcrypt tự động tạo salt, không cần lưu salt riêng
// - Thời gian hash tăng theo số saltRounds
// - So với argon2: argon2 mới hơn, bảo mật hơn nhưng bcrypt là chuẩn mực ngành

demo();