// ============================================================
// Bài 40: Middleware protect chặn route nếu chưa login
// ============================================================
// Đây là middleware quan trọng nhất trong Authentication
// Nó bảo vệ các route yêu cầu xác thực
//
// Cách hoạt động:
//   1. Client gửi request với token trong header
//   2. Middleware kiểm tra token có hợp lệ không
//   3. Nếu hợp lệ: gắn thông tin user vào req.user
//   4. Nếu không hợp lệ: trả về lỗi 401
//
// Chạy bằng lệnh:
//   node auth-middleware.js

// ============================================================
// Import thư viện jsonwebtoken
// ============================================================
// jsonwebtoken dùng để verify token
//
// Cài đặt:
//   npm install jsonwebtoken
const jwt = require('jsonwebtoken');

// ============================================================
// Middleware protect
// ============================================================
// protect là middleware kiểm tra authentication
//
// Middleware trong Express có 3 tham số:
//   - req: Request object - chứa thông tin request từ client
//   - res: Response object - dùng để gửi response
//   - next: Function - chuyển sang middleware/route tiếp theo
//
// Cách dùng:
//   app.get('/api/protected', protect, (req, res) => {
//     // Route này chỉ user đã login mới truy cập được
//     res.json({ user: req.user });
//   });
const protect = (req, res, next) => {

    // ============================================================
    // Khai báo biến token
    // ============================================================
    // let token
    // -------------------------
    // Biến để lưu JWT token
    // Ban đầu undefined
    //
    // Token có thể đến từ:
    //   1. Authorization header (Bearer token)
    //   2. Cookie (HttpOnly cookie)
    //   3. Query parameter (ít dùng, không bảo mật)
    let token;

    // ============================================================
    // Lấy token từ Authorization header
    // ============================================================
    // req.headers.authorization
    // -------------------------
    // Lấy header 'Authorization' từ request
    //
    // Format chuẩn:
    //   "Bearer <token>"
    //
    // Ví dụ:
    //   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    //
    // Optional chaining (?.)
    // -------------------------
    // req.headers.authorization?.startsWith('Bearer ')
    //
    // Nếu authorization undefined:
    //   - Không throw lỗi
    //   - Trả về undefined
    //   - Điều kiện if là false
    //
    // startsWith('Bearer ')
    // -------------------------
    // Kiểm tra header có bắt đầu bằng "Bearer " không
    // Đây là chuẩn Bearer token authentication
    if (req.headers.authorization?.startsWith('Bearer ')) {

        // ============================================================
        // Tách token từ header
        // ============================================================
        // req.headers.authorization.split(' ')
        // -------------------------
        // Tách chuỗi theo dấu cách
        //
        // Ví dụ:
        //   "Bearer eyJhbGciOiJIUzI1NiJ9..."
        //
        // Sau split(' '):
        //   ['Bearer', 'eyJhbGciOiJIUzI1NiJ9...']
        //
        // [1] lấy phần tử thứ 2
        //   - [0] = 'Bearer'
        //   - [1] = 'eyJhbGciOiJIUzI1NiJ9...' (token)
        //
        // Kết quả:
        //   token = 'eyJhbGciOiJIUzI1NiJ9...'
        token = req.headers.authorization.split(' ')[1];

    // ============================================================
    // Hoặc lấy token từ cookie
    // ============================================================
    // Nếu dùng cookie-parser middleware
    // req.cookies sẽ chứa các cookies
    //
    // req.cookies?.token
    // -------------------------
    // Lấy cookie tên 'token'
    //
    // Cách dùng với cookie-parser:
    //   const cookieParser = require('cookie-parser');
    //   app.use(cookieParser());
    //
    // Cookie được set:
    //   res.cookie('token', token, { httpOnly: true });
    } else if (req.cookies?.token) {

        // ============================================================
        // Gán token từ cookie
        // ============================================================
        // Nếu token tồn tại trong cookie
        // Gán vào biến token
        token = req.cookies.token;
    }

    // ============================================================
    // Kiểm tra có token không
    // ============================================================
    // if (!token)
    // -------------------------
    // Nếu token undefined hoặc rỗng
    // Nghĩa là client không gửi token
    //
    // Không có token = chưa đăng nhập
    if (!token) {

        // ============================================================
        // Trả về lỗi 401 Unauthorized
        // ============================================================
        // return res.status(401).json({...})
        // -------------------------
        // return: kết thúc function ngay
        // res.status(401): set HTTP status code 401
        // .json({...}): gửi JSON response
        //
        // HTTP status codes:
        //   - 200: OK
        //   - 201: Created
        //   - 400: Bad Request
        //   - 401: Unauthorized (chưa đăng nhập)
        //   - 403: Forbidden (không có quyền)
        //   - 500: Internal Server Error
        //
        // Response:
        //   Status: 401
        //   Body: {
        //     "error": "Unauthorized",
        //     "message": "Bạn cần đăng nhập để truy cập"
        //   }
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Bạn cần đăng nhập để truy cập'
        });
    }

    // ============================================================
    // try-catch để xử lý lỗi verify
    // ============================================================
    // jwt.verify() có thể throw lỗi nếu:
    //   - Token hết hạn
    //   - Token không hợp lệ
    //   - Secret không đúng
    //
    // try-catch ngăn app crash
    try {

        // ============================================================
        // Xác thực token
        // ============================================================
        // jwt.verify(token, secret)
        // -------------------------
        // Kiểm tra token có hợp lệ không
        //
        // Tham số:
        //   1. token: JWT token từ client
        //   2. process.env.JWT_SECRET: secret key từ biến môi trường
        //
        // Nếu hợp lệ:
        //   - Trả về decoded payload
        //   - Ví dụ: { userId: 123, email: 'user@example.com', role: 'user' }
        //
        // Nếu không hợp lệ:
        //   - Throw lỗi
        //   - catch block xử lý
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ============================================================
        // Gắn thông tin user vào request
        // ============================================================
        // req.user = decoded
        // -------------------------
        // Gắn decoded payload vào req.user
        //
        // Vì sao làm vậy?
        //   - Các route handlers phía sau có thể truy cập req.user
        //   - Biết được user nào đang request
        //   - Dùng cho authorization, logging, v.v.
        //
        // Ví dụ trong route:
        //   app.get('/api/profile', protect, (req, res) => {
        //     console.log(req.user.userId); // 123
        //   });
        req.user = decoded;

        // ============================================================
        // Chuyển sang middleware/route tiếp theo
        // ============================================================
        // next()
        // -------------------------
        // Gọi next() để chuyển sang middleware hoặc route handler tiếp theo
        //
        // Nếu KHÔNG gọi next():
        //   - Request bị treo
        //   - Client không nhận được response
        //   - Browser loading mãi
        next();

    } catch (error) {

        // ============================================================
        // Xử lý lỗi token không hợp lệ
        // ============================================================
        // catch block chạy khi jwt.verify() throw lỗi
        //
        // Các lỗi thường gặp:
        //   - TokenExpiredError: token đã hết hạn
        //   - JsonWebTokenError: token không hợp lệ
        //   - NotBeforeError: token chưa đến thời gian sử dụng
        //
        // Trả về lỗi 401
        return res.status(401).json({
            error: 'Invalid token',
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
};

// ============================================================
// Middleware adminOnly
// ============================================================
// adminOnly là middleware kiểm tra authorization (phân quyền)
//
// Khác với protect:
//   - protect: kiểm tra có đăng nhập không (authentication)
//   - adminOnly: kiểm tra có quyền admin không (authorization)
//
// Cách dùng:
//   app.get('/api/admin', protect, adminOnly, (req, res) => {
//     // Chỉ admin mới truy cập được
//   });
const adminOnly = (req, res, next) => {

    // ============================================================
    // Kiểm tra role của user
    // ============================================================
    // req.user.role
    // -------------------------
    // Lấy role từ decoded payload
    //
    // req.user được set bởi protect middleware
    // Vì vậy adminOnly PHẢI gọi sau protect
    //
    // Thứ tự đúng:
    //   app.get('/api/admin', protect, adminOnly, handler)
    //
    // Thứ tự sai:
    //   app.get('/api/admin', adminOnly, protect, handler)
    //   // req.user undefined => lỗi
    if (req.user.role !== 'admin') {

        // ============================================================
        // Trả về lỗi 403 Forbidden
        // ============================================================
        // return res.status(403).json({...})
        // -------------------------
        // 403 = Forbidden
        // Ý nghĩa: User đã đăng nhập nhưng không có quyền
        //
        // Phân biệt 401 vs 403:
        //   - 401: Chưa đăng nhập (không biết bạn là ai)
        //   - 403: Đã đăng nhập nhưng không có quyền (biết bạn là ai nhưng không cho)
        //
        // Response:
        //   Status: 403
        //   Body: {
        //     "error": "Forbidden",
        //     "message": "Chỉ admin mới có quyền truy cập"
        //   }
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }

    // ============================================================
    // User là admin, cho qua
    // ============================================================
    // Nếu req.user.role === 'admin'
    // Gọi next() để chuyển sang route handler
    next();
};

// ============================================================
// Export middlewares
// ============================================================
// module.exports = { protect, adminOnly }
// -------------------------
// Export 2 middlewares để các file khác có thể require()
//
// Cách dùng:
//   const { protect, adminOnly } = require('./middleware/auth');
//
//   app.get('/api/protected', protect, handler);
//   app.get('/api/admin', protect, adminOnly, handler);
module.exports = { protect, adminOnly };

// ============================================================
// Ví dụ sử dụng trong Express
// ============================================================
//
// const { protect, adminOnly } = require('./middleware/auth');
//
// // Route chỉ user đã login
// app.get('/api/protected', protect, (req, res) => {
//   res.json({ user: req.user });
// });
//
// // Route chỉ admin
// app.get('/api/admin', protect, adminOnly, (req, res) => {
//   res.json({ message: 'Admin only' });
// });
//
// // Middleware chain:
// //   Request -> protect -> adminOnly -> handler
// //
// // protect:
// //   - Kiểm tra token
// //   - Gắn req.user = decoded payload
// //
// // adminOnly:
// //   - Kiểm tra req.user.role === 'admin'
// //   - Cho qua hoặc trả về 403