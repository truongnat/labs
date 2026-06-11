// ============================================================
// Bài 39: Tạo và Verify JSON Web Token (JWT)
// ============================================================
// JWT là chuẩn authentication phổ biến nhất trong REST API
//
// Chạy bằng lệnh:
//   node jwt-auth.js

// ============================================================
// Import thư viện jsonwebtoken
// ============================================================
// jsonwebtoken là thư viện tạo và verify JWT token
//
// Cài đặt:
//   npm install jsonwebtoken
//
// JWT là gì?
// -------------------------
// JSON Web Token là một chuỗi string dùng để xác thực người dùng
//
// Cấu trúc JWT:
//   Header.Payload.Signature
//
//   1. Header:
//      - Thuật toán mã hóa (thường là HS256)
//      - Loại token (JWT)
//
//   2. Payload:
//      - Dữ liệu người dùng (userId, email, role)
//      - Claims (exp, iat, iss, sub)
//
//   3. Signature:
//      - Chữ ký bảo mật
//      - Được tạo từ Header + Payload + Secret
//
// Ví dụ token:
//   eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyM30.xYz...
const jwt = require('jsonwebtoken');

// ============================================================
// Secret key dùng để ký token
// ============================================================
// JWT_SECRET là chuỗi bí mật dùng để ký và verify token
//
// process.env.JWT_SECRET
// -------------------------
// Lấy secret từ biến môi trường
// Đây là cách an toàn, không hard-code trong code
//
// || 'your-secret-key-change-this'
// -------------------------
// Fallback value nếu không có biến môi trường
// Lưu ý: Đây chỉ là giá trị mặc định cho development
// Trong production, LUÔN đặt trong .env
//
// Cách đặt trong .env:
//   JWT_SECRET=my-super-secret-key-change-this
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ============================================================
// Hàm tạo JWT token
// ============================================================
// function createToken()
// -------------------------
// Tạo token mới cho user sau khi đăng nhập thành công
//
// Trả về:
//   string - JWT token
function createToken() {

    // ============================================================
    // Payload: dữ liệu người dùng
    // ============================================================
    // payload là object chứa thông tin về user
    // Thông tin này sẽ được encode vào token
    //
    // Lưu ý:
    //   - Không lưu thông tin nhạy cảm (password, credit card)
    //   - Payload có thể bị decode (không phải encrypt)
    //   - Chỉ lưu những gì cần thiết
    const payload = {

        // userId: ID duy nhất của người dùng
        // Trong thực tế: user._id từ MongoDB
        userId: 123,

        // email: email người dùng
        // Dùng để hiển thị thông tin
        email: 'user@example.com',

        // role: phân quyền
        // 'user' hoặc 'admin'
        // Dùng cho RBAC (Role-Based Access Control)
        role: 'user'
    };

    // ============================================================
    // Options: tùy chọn cho token
    // ============================================================
    // options object chứa các cấu hình cho token
    const options = {

        // expiresIn: thời gian hết hạn của token
        // -------------------------
        // '1h' = 1 hour
        // '7d' = 7 days
        // '30m' = 30 minutes
        //
        // Khi token hết hạn, jwt.verify() sẽ throw lỗi
        // Client phải login lại hoặc dùng refresh token
        expiresIn: '1h',

        // issuer: người tạo token
        // -------------------------
        // Dùng để xác định ai đã tạo token
        // jwt.verify() có thể kiểm tra issuer
        issuer: 'your-app',

        // subject: chủ đề của token
        // -------------------------
        // Mô tả token dùng để làm gì
        subject: 'auth'
    };

    // ============================================================
    // jwt.sign(payload, secret, options)
    // ============================================================
    // Tạo JWT token
    //
    // Tham số:
    //   1. payload: object chứa thông tin người dùng
    //   2. secret: chuỗi bí mật để ký token
    //   3. options: tùy chọn (expiresIn, issuer, subject)
    //
    // Trả về:
    //   string - JWT token
    //
    // Token có format:
    //   eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyM30.xYz...
    //
    // Ba phần:
    //   1. Header (base64url)
    //   2. Payload (base64url)
    //   3. Signature (base64url)
    const token = jwt.sign(payload, JWT_SECRET, options);

    // ============================================================
    // Log token đã tạo
    // ============================================================
    // console.log() in token ra console
    //
    // Token này sẽ được gửi cho client
    // Client lưu và gửi lại trong header Authorization
    console.log('Token đã tạo:', token);

    // ============================================================
    // Hiển thị 3 phần của token
    // ============================================================
    // token.split('.')
    // -------------------------
    // Tách token thành mảng 3 phần:
    //   [Header, Payload, Signature]
    //
    // .map(p => p.substring(0, 20) + '...')
    // -------------------------
    // Cắt mỗi phần còn 20 ký tự đầu để hiển thị
    // Thêm '...' để biết còn nội dung phía sau
    //
    // Output ví dụ:
    //   Token gồm 3 phần: [
    //     'eyJhbGciOiJIUzI1...',
    //     'eyJ1c2VySWQiOjEy...',
    //     'xYzabc...'
    //   ]
    console.log('Token gồm 3 phần:', token.split('.').map(p => p.substring(0, 20) + '...'));

    // ============================================================
    // Trả về token
    // ============================================================
    // return token
    // -------------------------
    // Trả về token để caller sử dụng
    // Trong thực tế:
    //   res.json({ token })
    return token;
}

// ============================================================
// Hàm verify JWT token
// ============================================================
// function verifyToken(token)
// -------------------------
// Kiểm tra token có hợp lệ không
//
// Tham số:
//   token: string - JWT token cần verify
//
// Trả về:
//   object - decoded payload nếu hợp lệ
//   null - nếu token không hợp lệ
function verifyToken(token) {

    // ============================================================
    // try-catch để xử lý lỗi
    // ============================================================
    // jwt.verify() có thể throw lỗi nếu:
    //   - Token hết hạn
    //   - Token không hợp lệ
    //   - Secret không đúng
    //
    // try-catch ngăn app crash
    try {

        // ============================================================
        // jwt.verify(token, secret)
        // ============================================================
        // Kiểm tra token có hợp lệ không
        //
        // Cách hoạt động:
        //   1. Kiểm tra signature có đúng không
        //   2. Kiểm tra token có hết hạn không
        //   3. Nếu hợp lệ, decode payload
        //
        // Trả về:
        //   object - decoded payload
        //
        // Ví dụ:
        //   {
        //     userId: 123,
        //     email: 'user@example.com',
        //     role: 'user',
        //     iat: 1718123456,
        //     exp: 1718127056
        //   }
        const decoded = jwt.verify(token, JWT_SECRET);

        // ============================================================
        // Log payload đã decode
        // ============================================================
        // console.log() in payload ra console
        //
        // decoded chứa:
        //   - userId, email, role (từ payload)
        //   - iat (issued at)
        //   - exp (expiration time)
        console.log('Token hợp lệ, payload:', decoded);

        // ============================================================
        // Trả về decoded payload
        // ============================================================
        // return decoded
        // -------------------------
        // Trả về payload để middleware sử dụng
        // Trong thực tế:
        //   req.user = decoded
        return decoded;

    } catch (error) {

        // ============================================================
        // Xử lý lỗi
        // ============================================================
        // Các lỗi thường gặp:
        //   - TokenExpiredError: token đã hết hạn
        //   - JsonWebTokenError: token không hợp lệ
        //   - NotBeforeError: token chưa đến thời gian sử dụng
        console.error('Token lỗi:', error.message);

        // Trả về null khi token không hợp lệ
        return null;
    }
}

// ============================================================
// Demo
// ============================================================
// Chạy demo để minh họa cách tạo và verify token
//
// 1. Tạo token mới
// 2. Verify token vừa tạo
// 3. Decode token (không verify)

// Tạo token
const token = createToken();

// Verify token
verifyToken(token);

// ============================================================
// Decode token (không verify)
// ============================================================
// jwt.decode(token)
// -------------------------
// Giải mã payload mà KHÔNG cần secret
//
// Lưu ý quan trọng:
//   - decode() không kiểm tra tính hợp lệ của token
//   - decode() không kiểm tra signature
//   - decode() không kiểm tra expiration
//   - Bất kỳ ai cũng có thể decode payload
//
// Vì vậy:
//   - decode() chỉ dùng để debug
//   - KHÔNG dùng decode() để xác thực
//   - LUÔN dùng verify() cho authentication
const decoded = jwt.decode(token);
console.log('Decode (không verify):', decoded);

// ============================================================
// Lưu ý quan trọng về JWT
// ============================================================
//
// 1. Access token vs Refresh token:
//    -------------------------
//    Access token:
//      - Ngắn hạn (5-15 phút)
//      - Dùng cho API calls
//      - Gửi trong Authorization header
//
//    Refresh token:
//      - Dài hạn (7-30 ngày)
//      - Dùng để renew access token
//      - Lưu trong HttpOnly cookie
//
// 2. Lưu token ở đâu?
//    -------------------------
//    KHÔNG NÊN:
//      - localStorage (dễ bị XSS attack)
//      - sessionStorage (cũng dễ bị XSS)
//
//    NÊN:
//      - HttpOnly cookie (chống XSS)
//      - Secure + SameSite flags
//
// 3. Token format:
//    -------------------------
//    Header.Payload.Signature
//
//    Header:
//      {
//        "alg": "HS256",
//        "typ": "JWT"
//      }
//
//    Payload:
//      {
//        "userId": 123,
//        "email": "user@example.com",
//        "role": "user",
//        "iat": 1718123456,
//        "exp": 1718127056
//      }
//
//    Signature:
//      HMACSHA256(
//        base64UrlEncode(header) + "." +
//        base64UrlEncode(payload),
//        secret
//      )