# 100 Bài Tập Node.js - Ví Dụ Chi Tiết & Use Cases

Tài liệu này cung cấp ví dụ code có chú thích tiếng Việt và use cases chi tiết cho mỗi bài tập trong lộ trình.

---

## 🟢 LEVEL 1: NODE.JS CORE & FUNDAMENTALS (CƠ BẢN)

### Bài 1: Hello World
**Use Case:** Khởi đầu với Node.js - viết chương trình đầu tiên
**Problem:** Mới bắt đầu học Node.js, cần chạy code đầu tiên
**Solution:** Dùng console.log để in ra màn hình, chạy bằng `node hello.js`

### Bài 2: CLI Tool với process.argv
**Use Case:** Tạo công cụ dòng lệnh tính tổng 2 số
**Problem:** Cần tính tổng 2 số truyền từ terminal
**Solution:** `process.argv.slice(2)` lấy tham số, `+args[0]` chuyển string sang number

### Bài 3: CommonJS Module
**Use Case:** Tách code ra module để tái sử dụng
**Problem:** Code dài cần chia thành module
**Solution:** `module.exports` để export, `require()` để import

### Bài 4: ES Modules
**Use Case:** Sử dụng chuẩn module hiện đại
**Problem:** CommonJS không hỗ trợ tree-shaking
**Solution:** `"type": "module"` trong package.json, `export default`, `import`

### Bài 5: dotenv
**Use Case:** Quản lý biến môi trường nhạy cảnh
**Problem:** Lưu DB password, API key không chia sẻ lên git
**Solution:** `dotenv.config()` load .env vào `process.env`

### Bài 6: Process Info
**Use Case:** Giám sát process và memory
**Problem:** Cần biết process ID và mức sử dụng memory
**Solution:** `process.pid`, `process.memoryUsage()` trả về thông tin chi tiết

### Bài 7: fs.readFileSync
**Use Case:** Đọc file cấu hình khi khởi động server
**Problem:** Đọc config.json ngay khi server start
**Solution:** `fs.readFileSync(path, 'utf-8')` - blocking, chỉ dùng cho file nhỏ

### Bài 8: fs.readFile Callback
**Use Case:** Đọc file không block main thread
**Problem:** Đọc file lớn mà không làm chậm server
**Solution:** `fs.readFile(path, 'utf-8', callback)` - async, không blocking

### Bài 9: fs.promises Async/Await
**Use Case:** Xử lý file với cú pháp hiện đại
**Problem:** Callback hell khi xử lý nhiều file
**Solution:** `fs.promises.readFile()` với try/catch

### Bài 10: Quản lý thư mục
**Use Case:** Tự động tạo/xóa thư mục lưu trữ file
**Problem:** Tạo thư mục upload khi chưa tồn tại
**Solution:** `fs.mkdir()`, `fs.rmdir()`, `fs.rename()`

### Bài 11: EventEmitter
**Use Case:** Xử lý sự kiện trong ứng dụng (click, submit, v.v.)
**Problem:** Các module cần giao tiếp với nhau
**Solution:** `emitter.on('event')`, `emitter.emit('event')`

### Bài 12: fs.watch
**Use Case:** Theo dõi thay đổi file để auto-reload
**Problem:** Phát hiện khi người dùng sửa config
**Solution:** `fs.watch(path, callback)` phát hiện thay đổi

### Bài 13-17: Event Loop
**Use Case:** Hiểu Event Loop để optimize performance
**Problem:** Biết thứ tự thực thi các đoạn code
**Solution:** `process.nextTick()`, `setImmediate()`, `setTimeout()`

### Bài 18: Buffer
**Use Case:** Xử lý dữ liệu nhị phân (upload file, mã hóa)
**Problem:** Xử lý binary data từ client upload
**Solution:** `Buffer.from()`, `buf.slice()`, `Buffer.concat()`

### Bài 19: OS Module
**Use Case:** Monitor server và hệ thống
**Problem:** Cần biết số CPU, RAM hệ thống
**Solution:** `os.cpus()`, `os.totalmem()`, `os.uptime()`

### Bài 20: zlib
**Use Case:** Nén log hoặc response để giảm băng thông
**Problem:** Log file quá lớn, cần nén
**Solution:** `zlib.createGzip()`, `zlib.createGunzip()`

---

## 🟡 LEVEL 2: WEB SERVER & DATABASE (CHI TIẾT)

### Bài 24: Query & Route Parameters
**Use Case:** API search/filter và lấy resource theo ID
**Code:** Xem `nodejs/24/query-route-params.js`

### Bài 25: Body Parser
**Use Case:** Nhận dữ liệu POST/PUT từ client
**Code:** Xem `nodejs/25/body-parser.js`

### Bài 26: Static Files
**Use Case:** Phục vụ HTML/CSS/JS/Images
**Code:** Xem `nodejs/26/static-files.js`

### Bài 27: Template Engine (EJS)
**Use Case:** Render HTML động với dữ liệu
**Code:** Xem `nodejs/27/ejs-template.js`

### Bài 28: Error Handling Middleware
**Use Case:** Bắt và xử lý lỗi tập trung
**Code:** Xem `nodejs/28/error-handling.js`

### Bài 31-33: MongoDB/Mongoose
**Use Case:** Lưu trữ và truy vấn dữ liệu NoSQL
**Code:** Xem `nodejs/31/mongoose-connect.js`, `nodejs/32/user-schema.js`, `nodejs/33/user-crud.js`

### Bài 38-40: Authentication
**Use Case:** Xác thực người dùng an toàn
**Code:** Xem `nodejs/38/bcrypt-password.js`, `nodejs/39/jwt-auth.js`, `nodejs/40/auth-middleware.js`

---

## 🟠 LEVEL 3: ADVANCED (CHI TIẾT)

### Bài 51: Stream đọc file CSV lớn
**Use Case:** Xử lý 1GB+ dữ liệu mà không cạn memory
**Code:** Xem `nodejs/51/csv-stream.js`

### Bài 52: Writable Stream ghi log
**Use Case:** Logging liên tục không blocking
**Code:** Xem `nodejs/52/log-stream.js`

### Bài 61: WebSocket Chat Server
**Use Case:** Chat realtime hai chiều
**Code:** Xem `nodejs/61/chat-ws.js`

---

## 🔴 LEVEL 4: EXPERT

---

## 📊 FILE ĐÃ TẠO (45+ file thực thi)

### Level 1 (1-20): 18 file
- 1: hello.js ✓
- 2: argv.js ✓
- 3: total.js + common.js ✓
- 4: total.js + es.js + package.json ✓
- 5: dotenv.js + .env ✓
- 6: pid.js ✓
- 7-11: fs.js (3 file) + path.js + event.js ✓
- 12-20: watch.js, event-emitter.js, error-event.js, event-loop-timers.js, event-loop-quiz.js, error-handler.js, buffer.js, os-info.js, zlib-compress.js ✓

### Level 2 (21-50): 18 file
- 21: http-server.js ✓
- 22-28: express-routing.js, logging-middleware.js, query-route-params.js, body-parser.js, static-files.js, ejs-template.js, error-handling.js ✓
- 31-33: mongoose-connect.js, user-schema.js, user-crud.js ✓
- 38-40: bcrypt-password.js, jwt-auth.js, auth-middleware.js ✓
- 65: redis-cache.js ✓

### Level 3 (51-74): 5 file
- 51: csv-stream.js ✓
- 52: log-stream.js ✓
- 56: worker-thread.js ✓
- 61: chat-ws.js ✓
- 62: socket-chat.js ✓

### Level 4 (75-100): 4 file
- 75: math.test.js ✓
- 80: mvc-structure.js ✓
- 88: Dockerfile ✓
- 89: docker-compose.yml ✓
- 94: url-shortener.js ✓
### Bài 80-82: Architecture Pattern
### Bài 86-87: Logging
### Bài 88-89: Docker
### Bài 90-91: CI/CD
### Bài 94-100: System Design Projects
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Hello</h1>');
    }
});
server.listen(3000);
```

**22. Express Routing:**
```javascript
const express = require('express');
const app = express();
app.get('/users', (req, res) => res.json([]));
app.post('/users', express.json(), (req, res) => res.status(201).json(req.body));
```

**23. Custom Middleware:**
```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

### Bài 31-50: Database & Authentication

**31. MongoDB + Mongoose:**
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myapp');
```

**38. Hash Password (bcrypt):**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(password, hash);
```

**39. JWT:**
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '1h' });
jwt.verify(token, secret); // decoded payload
```

**40. Protect Middleware:**
```javascript
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

---

## 🟠 LEVEL 3: ADVANCED

### Bài 51-60: Streams & Performance
**51-55. Streams:** Xử lý file lớn (1GB+) mà không tụt memory
**56. Worker Threads:** Xử lý CPU-intensive (fibonacci, resize ảnh)
**57. Child Process:** Chạy script Python/shell từ Node.js
**58. Cluster:** Chia tải request trên đa lõi CPU
**59. PM2:** Quản lý process production

### Bài 61-70: Real-time & Microservices
**61. WebSocket (ws):** Chat server realtime
**62. Socket.io:** Rooms chat, broadcast
**65. Redis Cache:** Cache query DB
**70. GraphQL:** API query linh hoạt

---

## 🔴 LEVEL 4: EXPERT

### Bài 75-85: Testing & Architecture
**75. Jest/Vitest:** Unit test functions
**80. MVC:** Model-View-Controller structure
**84. Graceful Shutdown:** Đóng DB connection trước khi tắt server

### Bài 86-93: DevOps
**88. Docker:** Container hóa app
**89. Docker-compose:** Chạy nhiều service cùng lúc
**90. GitHub Actions:** CI/CD tự động test

### Bài 94-100: System Design
**94. URL Shortener:** Hệ thống rút link chịu tải cao
**95. Notification System:** Queue + Push/Email/SMS
**99. Rate Limiter:** Token bucket/Redis
**100. Movie Ticket Booking:** Dự án tổng hợp