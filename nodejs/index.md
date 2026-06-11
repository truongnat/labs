Chào bạn, 100 bài tập Node.js dưới đây được thiết kế theo lộ trình từ **Core (Cốt lõi)** -> **Web Framework & Database** -> **Advanced (Nâng cao & Hiệu năng)** -> **Expert (Kiến trúc & DevOps)**. 

Đây không chỉ là các bài tập code nhỏ, mà còn là các **tính năng thực tế** bạn sẽ gặp khi đi làm. Hãy tạo một GitHub Repository và commit từng bài để xây dựng Portfolio cho chính mình!

---

### 🟢 LEVEL 1: NODE.JS CORE & FUNDAMENTALS (CƠ BẢN)
*Mục tiêu: Hiểu rõ bản chất Node.js, Event Loop, và các module cốt lõi.*

**Module & Environment**
1. Tạo file `hello.js` in ra "Hello World" và chạy bằng CLI.
2. Sử dụng `process.argv` để tạo một CLI tool tính tổng 2 số truyền vào.
3. Tạo và export/import module bằng CommonJS (`require`).
4. Tạo và export/import module bằng ES Modules (`import` / `package.json` type: module).
5. Sử dụng `dotenv` để đọc biến môi trường từ file `.env`.
6. Tìm hiểu và in ra các thông tin của `process.env`, `process.pid`, `process.memoryUsage()`.

**File System (FS) & Path**
7. Đọc file text đồng bộ (`fs.readFileSync`).
8. Đọc file text bất đồng bộ dùng Callback (`fs.readFile`).
9. Đọc/Ghi file dùng Promise và `async/await` (`fs.promises`).
10. Tạo, xóa, và đổi tên thư mục bằng `fs`.
11. Sử dụng `path.join`, `path.resolve`, `path.parse` để xử lý đường dẫn.
12. Theo dõi sự thay đổi của file (`fs.watch` / `fs.watchFile`).

**Event & Asynchronous**
13. Tạo `EventEmitter` tùy chỉnh, phát (emit) và lắng nghe (on) sự kiện.
14. Xử lý lỗi trong EventEmitter (sự kiện `error`).
15. Phân biệt `setTimeout`, `setInterval`, `setImmediate` và `process.nextTick`.
16. **Bài tập Event Loop:** Dự đoán thứ tự in ra của đoạn code chứa Promise, setTimeout, setImmediate.
17. Xử lý `uncaughtException` và `unhandledRejection` để chống crash app.

**Buffer, Stream & OS**
18. Tạo, cắt (slice) và nối (concat) `Buffer`.
19. Lấy thông tin CPU, RAM, hệ điều hành bằng module `os`.
20. Nén và giải nén file bằng module `zlib`.

---

### 🟡 LEVEL 2: WEB SERVER, EXPRESS.JS & DATABASE (TRUNG BÌNH)
*Mục tiêu: Xây dựng RESTful API, kết nối Database, Authentication.*

**HTTP & Express.js Basics**
21. Tạo HTTP Server thuần (không dùng Express) trả về HTML/JSON.
22. Setup Express.js, tạo routing cơ bản (GET, POST).
23. Viết Custom Middleware ghi log (URL, Method, Time).
24. Xử lý Query Parameters và Route Parameters.
25. Parse JSON body (`express.json`) và URL-encoded data.
26. Serve static files (HTML, CSS, JS, Images).
27. Tích hợp Template Engine (EJS hoặc Pug) để render HTML.
28. Viết Error Handling Middleware tập trung.
29. Xử lý CORS (Cross-Origin Resource Sharing).
30. Cấu hình `helmet` để bảo mật HTTP Headers.

**Database (MongoDB & SQL)**
31. Kết nối MongoDB bằng `Mongoose`.
32. Thiết kế Mongoose Schema và Validation.
33. CRUD cơ bản với Mongoose.
34. Phân trang (Pagination), Sắp xếp (Sort) và Lọc (Filter) trong Mongoose.
35. Kết nối PostgreSQL (dùng `pg` hoặc ORM như `Prisma` / `Sequelize`).
36. Quan hệ 1-N và N-N trong Prisma/Mongoose (Populate/Include).
37. Transaction trong Database (Rollback khi có lỗi).

**Authentication & Security**
38. Hash password bằng `bcrypt` / `argon2`.
39. Tạo và Verify JSON Web Token (JWT).
40. Viết Middleware `protect` chặn route nếu chưa login.
41. Phân quyền RBAC (Role-Based Access Control: Admin vs User).
42. Xử lý Cookie (`cookie-parser`) và HttpOnly Cookie.
43. Implement Refresh Token & Access Token flow.
44. Login bằng OAuth2 (Passport.js với Google/GitHub).
45. Chống Brute-force Attack bằng `express-rate-limit`.

**API Features & Validation**
46. Validate Input data dùng `Zod` hoặc `Joi`.
47. Upload file local dùng `Multer`.
48. Upload file lên Cloud (AWS S3 / Cloudinary).
49. Gửi Email xác thực tài khoản dùng `Nodemailer`.
50. Tạo tài liệu API tự động bằng `Swagger` (OpenAPI).

---

### 🟠 LEVEL 3: ADVANCED NODE.JS (NÂNG CAO)
*Mục tiêu: Xử lý tác vụ nặng, Real-time, Caching, Message Queue.*

**Streams & Large Data**
51. Đọc file CSV 1GB bằng `Readable Stream` (không ngốn RAM).
52. Ghi log file liên tục bằng `Writable Stream`.
53. Transform Stream: Mã hóa (Encrypt) file khi đang đọc/ghi.
54. Dùng `stream.pipeline` để xử lý lỗi stream tốt hơn `pipe()`.
55. Tải xuống (Download) file lớn từ Server về Client bằng Stream.

**Concurrency & Performance**
56. **Worker Threads:** Xử lý tác vụ CPU-intensive (ví dụ: tính số Fibonacci lớn, resize ảnh).
57. **Child Process:** Chạy một script Python hoặc lệnh Shell từ Node.js (`exec`, `spawn`).
58. **Cluster Module:** Chia tải request ra nhiều Core CPU.
59. Dùng `PM2` để chạy, restart và monitor app Node.js.
60. Đo lường và fix Memory Leak (Rò rỉ bộ nhớ) bằng Chrome DevTools / Clinic.js.

**Real-time & WebSockets**
61. Tạo Chat Server cơ bản bằng `ws` (WebSocket thuần).
62. Dùng `Socket.io` tạo phòng Chat (Rooms) và Broadcast.
63. Xử lý Reconnect và Disconnect trong Socket.io.
64. Server-Sent Events (SSE): Đẩy thông báo 1 chiều từ Server xuống Client.

**Caching & Message Queues**
65. Kết nối `Redis`, Cache kết quả truy vấn Database.
66. Redis Pub/Sub: Giao tiếp giữa 2 server Node.js khác nhau.
67. Tạo Background Job (ví dụ: gửi email hàng loạt) dùng `BullMQ`.
68. Lên lịch chạy Cron Job (`node-cron`) để dọn dẹp DB định kỳ.
69. Xử lý Race Condition khi nhiều user mua cùng 1 sản phẩm (Dùng Redis Lua Script / Distributed Lock).

**Microservices & Advanced Protocols**
70. Setup `GraphQL` Server bằng Apollo Server.
71. Viết GraphQL Resolvers, Mutations và xử lý N+1 Problem (`dataloader`).
72. GraphQL Subscriptions (Real-time qua WebSocket).
73. Tạo gRPC Server và Client (giao tiếp nội bộ giữa các Microservices).
74. RabbitMQ / Kafka: Gửi và nhận message theo mô hình Pub/Sub hoặc Work Queue.

---

### 🔴 LEVEL 4: EXPERT, ARCHITECTURE & DEVOPS (CHUYÊN GIA)
*Mục tiêu: System Design, Testing, CI/CD, Monitoring, Clean Architecture.*

**Testing (Kiểm thử)**
75. Unit Test hàm tiện ích bằng `Jest` hoặc `Vitest`.
76. Mocking Database và External APIs trong Unit Test.
77. Integration Test API bằng `Supertest`.
78. Test Coverage: Đảm bảo code coverage > 80%.
79. Thực hành TDD (Test-Driven Development) cho một module CRUD.

**Architecture & Design Patterns**
80. Tổ chức code theo **MVC** (Model - View - Controller).
81. Tổ chức code theo **Service - Repository Pattern**.
82. Tổ chức code theo **Clean Architecture / Hexagonal**.
83. Implement **Dependency Injection** (DI) trong Node.js (dùng `tsyringe` hoặc `inversify`).
84. Thiết kế Graceful Shutdown (Đóng kết nối DB, xử lý hết request trước khi tắt app).
85. Xử lý Multi-tenancy (Ứng dụng SaaS nhiều khách hàng trên 1 DB).

**Logging, Monitoring & DevOps**
86. Cấu hình `Winston` hoặc `Pino` để ghi log JSON, phân loại log (info, error, debug).
87. Đẩy log tập trung về ELK Stack (Elasticsearch, Logstash, Kibana) hoặc Loki.
88. Dockerize ứng dụng Node.js (Viết `Dockerfile` tối ưu dung lượng với Multi-stage build).
89. Viết `docker-compose.yml` chạy App + MongoDB + Redis.
90. Thiết lập CI/CD pipeline cơ bản bằng **GitHub Actions** (Tự động test khi tạo PR).
91. Deploy Node.js lên VPS (Nginx Reverse Proxy, SSL Let's Encrypt).
92. Tích hợp APM (Application Performance Monitoring) như Prometheus + Grafana hoặc DataDog.
93. Distributed Tracing: Theo dõi 1 request đi qua nhiều Microservices bằng `OpenTelemetry`.

**System Design (Thiết kế hệ thống thực tế)**
94. **Design 1:** Xây dựng hệ thống Rút gọn Link (URL Shortener) chịu tải cao.
95. **Design 2:** Xây dựng hệ thống Notification (Push, Email, SMS) bất đồng bộ dùng Queue.
96. **Design 3:** Thiết kế API Giỏ hàng E-commerce xử lý giữ chỗ (inventory hold) trong 15 phút.
97. **Design 4:** Xây dựng hệ thống Streaming Video (HLS) tự động transcode bằng FFmpeg và Queue.
98. **Design 5:** Tự viết một Mini-Framework giống Express (tự xử lý Routing, Middleware chain).
99. **Design 6:** Xây dựng Rate Limiter thuật toán Token Bucket / Sliding Window dùng Redis.
100. **Final Project:** Kết hợp tất cả làm một **Hệ thống đặt vé xem phim** (Auth, DB, Redis Cache, Socket.io chọn ghế real-time, BullMQ gửi email, Dockerize).

---

### 💡 LỜI KHUYÊN ĐỂ CHINH PHỤC 100 BÀI TẬP NÀY:

1. **Đừng code hết 1 lần:** Hãy chia nhỏ. Level 1 & 2 có thể làm trong 1-2 tháng. Level 3 & 4 là quá trình tích lũy kinh nghiệm đi làm thực tế.
2. **Sử dụng TypeScript:** Từ bài 21 trở đi, hãy cố gắng chuyển toàn bộ sang **TypeScript**. Node.js hiện đại trong doanh nghiệp 90% dùng TS.
3. **Tạo Git Repo:** Đặt tên repo `nodejs-master-100-exercises`. Mỗi bài là 1 branch, merge vào `main` khi hoàn thành. Đây là CV sống động nhất của bạn.
4. **Đọc Source Code:** Khi làm Level 3 & 4, hãy đọc source code của `Express`, `Mongoose`, `Socket.io` để hiểu cách các "cao nhân" viết thư viện.
5. **Tập trung vào Debug:** Đừng chỉ copy code. Hãy tập dùng `debugger` của VS Code, tập đọc Stack Trace khi app bị crash.

Bạn muốn bắt đầu ngay với **Bài số 1** không? Tôi sẽ hướng dẫn bạn viết code và giải thích cặn kẽ!