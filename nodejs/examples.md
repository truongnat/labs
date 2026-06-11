# 100 Bài Tập Node.js - Ví Dụ Chi Tiết & Use Cases

Tài liệu này cung cấp ví dụ code có chú thích tiếng Việt và use cases chi tiết cho mỗi bài tập.

---

## 🟢 LEVEL 1: NODE.JS CORE & FUNDAMENTALS (CƠ BẢN)

### Bài 1: Hello World
**Use Case:** Khởi đầu với Node.js - viết chương trình đầu tiên  
**Problem:** Mới bắt đầu, cần chạy code đầu tiên  
**Solution:** `console.log()` in ra màn hình, chạy `node hello.js`

### Bài 2: CLI Tool với process.argv
**Use Case:** Tạo công cụ dòng lệnh tính tổng 2 số  
**Problem:** Cần tính tổng 2 số truyền từ terminal  
**Solution:** `process.argv.slice(2)` lấy tham số, `+args[0]` chuyển string sang number

### Bài 3: CommonJS Module
**Use Case:** Tách code ra module để tái sử dụng  
**Problem:** Code dài cần chia thành module  
**Solution:** `module.exports` export, `require()` import

### Bài 4: ES Modules
**Use Case:** Sử dụng chuẩn module hiện đại  
**Problem:** CommonJS không hỗ trợ tree-shaking  
**Solution:** `"type": "module"` trong package.json

### Bài 5: dotenv
**Use Case:** Quản lý biến môi trường nhạy cảnh  
**Problem:** Lưu DB password, API key không chia sẻ lên git  
**Solution:** `dotenv.config()` load .env vào `process.env`

### Bài 6: Process Info
**Use Case:** Giám sát process và memory  
**Problem:** Cần biết process ID và mức sử dụng memory  
**Solution:** `process.pid`, `process.memoryUsage()`

### Bài 7: fs.readFileSync
**Use Case:** Đọc file cấu hình khi khởi động server  
**Solution:** `fs.readFileSync(path, 'utf-8')` - blocking

### Bài 8: fs.readFile Callback
**Use Case:** Đọc file không block main thread  
**Solution:** `fs.readFile(path, 'utf-8', callback)` - async

### Bài 9: fs.promises Async/Await
**Use Case:** Xử lý file với cú pháp hiện đại  
**Solution:** `fs.promises.readFile()` với try/catch

### Bài 10: Quản lý thư mục
**Use Case:** Tự động tạo/xóa thư mục  
**Solution:** `fs.mkdir()`, `fs.rmdir()`, `fs.rename()`

### Bài 11: EventEmitter
**Use Case:** Xử lý sự kiện trong ứng dụng  
**Solution:** `emitter.on('event')`, `emitter.emit('event')`

### Bài 12: fs.watch
**Use Case:** Theo dõi thay đổi file  
**Solution:** `fs.watch(path, callback)` phát hiện thay đổi

### Bài 13-17: Event Loop
**Use Case:** Hiểu Event Loop để optimize performance  
**Solution:** `process.nextTick()`, `setImmediate()`, `setTimeout()`

### Bài 18: Buffer
**Use Case:** Xử lý dữ liệu nhị phân  
**Solution:** `Buffer.from()`, `buf.slice()`, `Buffer.concat()`

### Bài 19: OS Module
**Use Case:** Monitor server và hệ thống  
**Solution:** `os.cpus()`, `os.totalmem()`, `os.uptime()`

### Bài 20: zlib
**Use Case:** Nén log hoặc response  
**Solution:** `zlib.createGzip()`, `zlib.createGunzip()`

---

## 🟡 LEVEL 2: WEB SERVER & DATABASE

### Bài 21: HTTP Server thuần
**Code:** `nodejs/21/http-server.js`

### Bài 22: Express Routing
**Code:** `nodejs/22/express-routing.js`

### Bài 23: Custom Middleware
**Code:** `nodejs/23/logging-middleware.js`

### Bài 24: Query & Route Parameters
**Code:** `nodejs/24/query-route-params.js`

### Bài 25: Body Parser
**Code:** `nodejs/25/body-parser.js`

### Bài 26: Static Files
**Code:** `nodejs/26/static-files.js`

### Bài 27: EJS Template Engine
**Code:** `nodejs/27/ejs-template.js`

### Bài 28: Error Handling Middleware
**Code:** `nodejs/28/error-handling.js`

### Bài 29: CORS
**Code:** `nodejs/29/cors-handler.js`

### Bài 30: Helmet Security
**Solution:** `app.use(require('helmet')())` bảo mật headers

### Bài 31: MongoDB Connect
**Code:** `nodejs/31/mongoose-connect.js`

### Bài 32: Mongoose Schema & Validation
**Code:** `nodejs/32/user-schema.js`

### Bài 33: Mongoose CRUD
**Code:** `nodejs/33/user-crud.js`

### Bài 34: Pagination & Sort
**Solution:** `Model.find().skip().limit().sort()`

### Bài 35: PostgreSQL/Prisma
**Solution:** `npm i prisma && npx prisma init`

### Bài 36: Database Relations
**Solution:** Mongoose Populate / Prisma Include

### Bài 37: Transaction
**Solution:** `session.withTransaction()` trong Mongoose/MongoDB

### Bài 38: bcrypt Hash Password
**Code:** `nodejs/38/bcrypt-password.js`

### Bài 39: JWT
**Code:** `nodejs/39/jwt-auth.js`

### Bài 40: Protect Middleware
**Code:** `nodejs/40/auth-middleware.js`

### Bài 41: RBAC (Role-Based Access Control)
**Solution:** Kiểm tra `req.user.role === 'admin'`

### Bài 42: Cookie HttpOnly
**Solution:** `res.cookie('token', token, { httpOnly: true })`

### Bài 43: Refresh Token
**Solution:** Dual token (access + refresh) với thời gian hết hạn khác nhau

### Bài 44: OAuth2 Passport
**Solution:** `passport.use(new GoogleStrategy({...}))`

### Bài 45: Rate Limiting
**Solution:** `express-rate-limit` giới hạn request/IP

### Bài 46: Zod Validation
**Solution:** `z.object({ email: z.string().email() })`

### Bài 47: Multer Upload
**Solution:** `upload.single('file')` xử lý multipart/form-data

### Bài 48: Cloud Upload (S3/Cloudinary)
**Solution:** Upload stream trực tiếp tới cloud

### Bài 49: Nodemailer
**Solution:** `nodemailer.createTransport()` gửi email

### Bài 50: Swagger API Docs
**Solution:** `swagger-ui-express` tự động tạo tài liệu API

---

## 🟠 LEVEL 3: ADVANCED

### Bài 51: Readable Stream CSV
**Code:** `nodejs/51/csv-stream.js`

### Bài 52: Writable Stream Log
**Code:** `nodejs/52/log-stream.js`

### Bài 53: Transform Stream Encrypt
**Solution:** `Transform` class để mã hóa khi đọc/ghi

### Bài 54: stream.pipeline
**Solution:** Xử lý lỗi tốt hơn `pipe()`

### Bài 55: Download File Stream
**Solution:** `fs.createReadStream().pipe(res)`

### Bài 56: Worker Threads
**Code:** `nodejs/56/worker-thread.js`

### Bài 57: Child Process
**Solution:** `spawn('python', ['script.py'])`

### Bài 58: Cluster Module
**Solution:** `cluster.fork()` chia tải đa lõi

### Bài 59: PM2
**Solution:** `pm2 start app.js` quản lý process

### Bài 60: Memory Leak Detection
**Solution:** Chrome DevTools / Clinic.js

### Bài 61: WebSocket (ws)
**Code:** `nodejs/61/chat-ws.js`

### Bài 62: Socket.io
**Code:** `nodejs/62/socket-chat.js`

### Bài 63: Reconnect Handler
**Solution:** `socket.on('reconnect', callback)`

### Bài 64: Server-Sent Events
**Solution:** `res.write('data: message\n\n')` stream 1 chiều

### Bài 65: Redis Cache
**Code:** `nodejs/65/redis-cache.js`

### Bài 66: Redis Pub/Sub
**Code:** `nodejs/66/redis-pubsub.js`

### Bài 67: BullMQ Background Job
**Solution:** Queue xử lý email/sms

### Bài 68: node-cron
**Solution:** `cron.schedule('0 0 * * *', job)`

### Bài 69: Distributed Lock
**Solution:** Redis Lua script/lock

### Bài 70: GraphQL Apollo
**Solution:** `apollo-server` query/mutation

### Bài 71: DataLoader N+1
**Solution:** Cache batch requests

### Bài 72: GraphQL Subscriptions
**Solution:** WebSocket realtime

### Bài 73: gRPC
**Solution:** `grpc` package tạo RPC service

### Bài 74: RabbitMQ/Kafka
**Solution:** Message queue Pub/Sub

---

## 🔴 LEVEL 4: EXPERT

### Bài 75: Jest Unit Test
**Code:** `nodejs/75/math.test.js`, `nodejs/75/math.js`

### Bài 76: Mocking
**Solution:** `jest.mock()` database/API

### Bài 77: Supertest Integration
**Solution:** Test API endpoint cuối-to-end

### Bài 78: Test Coverage
**Solution:** `jest --coverage` > 80%

### Bài 79: TDD Workflow
**Solution:** Viết test trước, code sau

### Bài 80: MVC Pattern
**Code:** `nodejs/80/mvc-structure.js`

### Bài 81: Service-Repository

### Bài 82: Clean Architecture

### Bài 83: Dependency Injection
**Solution:** `tsyringe`/`inversify`

### Bài 84: Graceful Shutdown
**Solution:** Đóng DB connection, xử lý hết request

### Bài 85: Multi-tenancy

### Bài 86: Winston/Pino Logging
**Solution:** `winston.createLogger()` JSON logs

### Bài 87: ELK Stack
**Solution:** Log tập trung

### Bài 88: Docker
**Code:** `nodejs/88/Dockerfile`

### Bài 89: Docker-compose
**Code:** `nodejs/89/docker-compose.yml`

### Bài 90: GitHub Actions CI/CD
**Solution:** `.github/workflows/test.yml`

### Bài 91: Nginx SSL VPS
**Solution:** Reverse proxy + Let's Encrypt

### Bài 92: Prometheus/Grafana APM

### Bài 93: OpenTelemetry Tracing

### Bài 94: URL Shortener
**Code:** `nodejs/94/url-shortener.js`

### Bài 95: Notification System
**Code:** `nodejs/95/notification-queue.js`

### Bài 96: E-commerce Cart Hold

### Bài 97: Video Streaming HLS

### Bài 98: Mini Express Framework

### Bài 99: Rate Limiter Token Bucket
**Solution:** Redis sliding window

### Bài 100: Movie Ticket Booking
**Solution:** Final project tổng hợp