// ============================================================
// Bài 94: Design - URL Shortener System
// ============================================================
// Hệ thống rút link chịu tải cao (Redis hoặc in-memory fallback)
//
// Đây là một trong những bài system design quan trọng
// Nó tổng hợp nhiều kiến thức:
//   - HTTP server thuần
//   - Base62 encoding
//   - Redis cache
//   - Rate limiting
//   - Redirect 302
//
// Chạy bằng lệnh:
//   node url-shortener.js
//
// Test:
//   1. Tạo short URL:
//      curl -X POST http://localhost:3094/api/shorten \
//        -H "Content-Type: application/json" \
//        -d '{"longUrl":"https://google.com"}'
//
//   2. Truy cập short URL:
//      http://localhost:3094/a
//
//   3. Health check:
//      http://localhost:3094/health

// ============================================================
// Import module http
// ============================================================
// http là module built-in của Node.js
// Cung cấp function để tạo web server
//
// Không cần npm install
// Đã có sẵn trong Node.js runtime
const http = require('http');

// ============================================================
// Import URL class
// ============================================================
// URL class dùng để parse URL string
//
// Ví dụ:
//   new URL('http://localhost:3094/abc')
//   => {
//     hostname: 'localhost',
//     port: '3094',
//     pathname: '/abc'
//   }
//
// Destructuring:
//   const { URL } = require('url')
// Chỉ import class URL từ module 'url'
const { URL } = require('url');

// ============================================================
// Base62 character set
// ============================================================
// BASE62 dùng để encode số thành short code
//
// Tại sao dùng Base62?
// -------------------------
//   - 62 ký tự = 10 số + 26 chữ thường + 26 chữ hoa
//   - Ngắn hơn nhiều so với số thập phân
//   - Ví dụ:
//     + Số 1000000 trong decimal: "1000000" (7 ký tự)
//     + Số 1000000 trong base62: "4c92" (4 ký tự)
//
// Character set:
//   0-9: 10 ký tự
//   a-z: 26 ký tự
//   A-Z: 26 ký tự
//   Tổng: 62 ký tự
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ============================================================
// Hàm encodeBase62
// ============================================================
// encodeBase62(num)
// -------------------------
// Chuyển số thập phân (base10) thành base62 string
//
// Thuật toán:
//   1. Lấy num % 62 để lấy ký tự cuối
//   2. Math.floor(num / 62) để giảm num
//   3. Lặp lại cho đến khi num = 0
//
// Ví dụ:
//   encodeBase62(1) => '1'
//   encodeBase62(10) => 'a'
//   encodeBase62(62) => '10'
//   encodeBase62(1000) => 'g8'
function encodeBase62(num) {

    // result là chuỗi kết quả
    // Ban đầu rỗng
    let result = '';

    // while loop
    // -------------------------
    // Lặp cho đến khi num = 0
    //
    // Mỗi lần lặp:
    //   1. num % 62: lấy phần dư (0-61)
    //   2. BASE62[index]: lấy ký tự tương ứng
    //   3. result = ký_tự + result: thêm vào đầu chuỗi
    //   4. num = Math.floor(num / 62): chia num cho 62
    while (num > 0) {

        // num % 62
        // -------------------------
        // Lấy phần dư khi chia num cho 62
        // Kết quả là số từ 0 đến 61
        //
        // Ví dụ:
        //   1000 % 62 = 8
        //   BASE62[8] = '8'
        //
        // result = BASE62[num % 62] + result
        // -------------------------
        // Lấy ký tự từ BASE62 và thêm vào ĐẦU chuỗi
        //
        // Vì sao thêm vào đầu?
        //   - Thuật toán base conversion lấy chữ số từ phải sang trái
        //   - Thêm vào đầu để giữ đúng thứ tự
        result = BASE62[num % 62] + result;

        // Math.floor(num / 62)
        // -------------------------
        // Chia num cho 62 và làm tròn xuống
        //
        // Ví dụ:
        //   num = 1000
        //   1000 / 62 = 16.129
        //   Math.floor(16.129) = 16
        //
        // Lặp tiếp với num = 16
        num = Math.floor(num / 62);
    }

    // return result || '0'
    // -------------------------
    // Nếu result rỗng (num = 0), trả về '0'
    //
    // Vì sao cần || '0'?
    //   - Khi num = 0, while loop không chạy
    //   - result vẫn rỗng
    //   - Nhưng short code cho ID 0 phải là '0'
    return result || '0';
}

// ============================================================
// Class MemoryStore
// ============================================================
// MemoryStore là in-memory storage (lưu trong RAM)
// Dùng khi không có Redis
//
// Đây là fallback để app vẫn chạy được mà không cần Redis
//
// Interface:
//   - incr(key): tăng counter
//   - setEx(key, ttl, value): lưu key với TTL
//   - get(key): lấy giá trị theo key
class MemoryStore {

    // ============================================================
    // Constructor
    // ============================================================
    // constructor()
    // -------------------------
    // Chạy khi tạo instance mới
    //
    // this.strings: Map lưu key-value
    //   key: short code (ví dụ: 'abc')
    //   value: { value: longUrl, expiresAt: timestamp }
    //
    // this.counters: Map lưu counters
    //   key: 'url_counter'
    //   value: số counter hiện tại
    constructor() {
        this.strings = new Map(); // key -> { value, expiresAt }
        this.counters = new Map();
    }

    // ============================================================
    // Method: incr(key)
    // ============================================================
    // Tăng counter lên 1
    //
    // Tham số:
    //   key: string - tên counter
    //
    // Trả về:
    //   number - giá trị counter sau khi tăng
    //
    // async:
    // -------------------------
    // Vì interface giống Redis (async)
    // Để dễ dàng thay thế bằng Redis store sau này
    async incr(key) {

        // this.counters.get(key)
        // -------------------------
        // Lấy giá trị counter hiện tại
        //
        // || 0
        // -------------------------
        // Nếu chưa có counter, mặc định là 0
        //
        // Ví dụ:
        //   this.counters.get('url_counter') = undefined
        //   undefined || 0 = 0
        //   next = 0 + 1 = 1
        const next = (this.counters.get(key) || 0) + 1;

        // this.counters.set(key, next)
        // -------------------------
        // Lưu giá trị counter mới vào Map
        //
        // Ví dụ:
        //   this.counters.set('url_counter', 1)
        this.counters.set(key, next);

        // Trả về giá trị counter mới
        return next;
    }

    // ============================================================
    // Method: setEx(key, ttlSeconds, value)
    // ============================================================
    // Lưu key với TTL (time-to-live)
    //
    // Tham số:
    //   key: string - key cần lưu
    //   ttlSeconds: number - thời gian sống (giây)
    //   value: string - giá trị cần lưu
    //
    // Ví dụ:
    //   setEx('url:abc', 2592000, 'https://google.com')
    //   => Lưu short code 'abc' với long URL 'https://google.com'
    //      trong 30 ngày (2592000 giây)
    async setEx(key, ttlSeconds, value) {

        // this.strings.set(key, { value, expiresAt })
        // -------------------------
        // Lưu vào Map với cấu trúc:
        //   key: 'url:abc'
        //   value: {
        //     value: 'https://google.com',
        //     expiresAt: 1718123456789
        //   }
        //
        // expiresAt
        // -------------------------
        // Thời điểm hết hạn (milliseconds từ Unix epoch)
        //
        // Date.now() + ttlSeconds * 1000
        // -------------------------
        //   Date.now(): thời điểm hiện tại (ms)
        //   ttlSeconds * 1000: TTL chuyển từ giây sang ms
        //   expiresAt: thời điểm hết hạn
        this.strings.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    }

    // ============================================================
    // Method: get(key)
    // ============================================================
    // Lấy giá trị theo key
    //
    // Tham số:
    //   key: string - key cần lấy
    //
    // Trả về:
    //   string - giá trị nếu còn hạn
    //   null - nếu không tìm thấy hoặc đã hết hạn
    async get(key) {

        // this.strings.get(key)
        // -------------------------
        // Lấy entry từ Map
        //
        // Entry có cấu trúc:
        //   { value: 'https://google.com', expiresAt: 1718123456789 }
        const entry = this.strings.get(key);

        // if (!entry)
        // -------------------------
        // Nếu không tìm thấy key
        // Trả về null
        if (!entry) return null;

        // Kiểm tra TTL
        // -------------------------
        // entry.expiresAt < Date.now()
        //   - expiresAt: thời điểm hết hạn
        //   - Date.now(): thời điểm hiện tại
        //
        // Nếu thời điểm hiện tại > thời điểm hết hạn
        // => Key đã hết hạn
        if (entry.expiresAt && entry.expiresAt < Date.now()) {

            // this.strings.delete(key)
            // -------------------------
            // Xóa key khỏi Map
            //
            // Vì sao xóa?
            //   - Giải phóng memory
            //   - Tránh lưu dữ liệu đã hết hạn
            this.strings.delete(key);

            // Trả về null
            return null;
        }

        // Trả về giá trị
        // entry.value là long URL
        return entry.value;
    }
}

// ============================================================
// Hàm createStore()
// ============================================================
// Tạo storage store
//
// Logic:
//   1. Nếu có REDIS_URL => dùng Redis
//   2. Nếu không có => dùng MemoryStore (in-memory)
//
// Đây là pattern "fallback" rất quan trọng trong production
async function createStore() {

    // process.env.REDIS_URL
    // -------------------------
    // Lấy Redis connection string từ biến môi trường
    //
    // Ví dụ:
    //   redis://localhost:6379
    //   redis://redis:6379 (trong Docker)
    const redisUrl = process.env.REDIS_URL;

    // if (!redisUrl)
    // -------------------------
    // Nếu không có REDIS_URL
    // Dùng in-memory store
    if (!redisUrl) {
        console.log('[Store] Dùng in-memory Map (không cần Redis)');
        return new MemoryStore();
    }

    // try-catch
    // -------------------------
    // Thử kết nối Redis
    // Nếu thất bại, fallback về MemoryStore
    try {

        // require('redis')
        // -------------------------
        // Import thư viện redis
        //
        // Lưu ý:
        //   - Redis package không có sẵn trong Node.js
        //   - Cần npm install redis
        //   - Nếu chưa cài, require() sẽ throw lỗi
        //   - catch block xử lý và fallback
        const redis = require('redis');

        // redis.createClient({ url: redisUrl })
        // -------------------------
        // Tạo Redis client
        //
        // Tham số:
        //   url: Redis connection string
        //   Ví dụ: redis://localhost:6379
        const client = redis.createClient({ url: redisUrl });

        // client.on('error', callback)
        // -------------------------
        // Lắng nghe lỗi từ Redis
        //
        // EventEmitter pattern:
        //   client.emit('error', err)
        //   callback(err) được gọi
        client.on('error', (err) => console.error('Redis error:', err.message));

        // await client.connect()
        // -------------------------
        // Kết nối tới Redis server
        //
        // async/await:
        //   - client.connect() trả về Promise
        //   - await chờ Promise resolve
        //   - Sau khi kết nối thành công, tiếp tục code bên dưới
        await client.connect();

        console.log('[Store] Đã kết nối Redis:', redisUrl);

        // Trả về Redis store wrapper
        // -------------------------
        // Object này có cùng interface với MemoryStore:
        //   - incr(key)
        //   - setEx(key, ttl, value)
        //   - get(key)
        //
        // Điều này gọi là "Adapter Pattern"
        // Cho phép thay đổi storage backend mà không cần sửa code
        return {
            incr: (key) => client.incr(key),
            setEx: (key, ttl, value) => client.setEx(key, ttl, value),
            get: (key) => client.get(key)
        };

    } catch (err) {

        // catch block chạy khi:
        //   - redis package chưa cài
        //   - Redis server không chạy
        //   - Connection failed
        //
        // console.warn()
        // -------------------------
        // In warning message
        // Khác với console.error() ở mức độ nghiêm trọng
        console.warn('[Store] Redis không khả dụng, fallback in-memory:', err.message);

        // Fallback về MemoryStore
        return new MemoryStore();
    }
}

// ============================================================
// Biến store toàn cục
// ============================================================
// let store
// -------------------------
// Biến toàn cục lưu storage instance
//
// Được set trong main() function:
//   store = await createStore()
//
// Sau đó các function khác dùng:
//   store.incr()
//   store.setEx()
//   store.get()
let store;

// ============================================================
// Hàm generateShortCode()
// ============================================================
// Tạo short code duy nhất
//
// Cách hoạt động:
//   1. Tăng counter lên 1
//   2. Encode counter thành base62
//
// Ví dụ:
//   counter = 1 => shortCode = '1'
//   counter = 10 => shortCode = 'a'
//   counter = 62 => shortCode = '10'
async function generateShortCode() {

    // store.incr('url_counter')
    // -------------------------
    // Tăng counter 'url_counter' lên 1
    //
    // Với MemoryStore:
    //   - Lấy giá trị hiện tại từ Map
    //   - +1
    //   - Lưu lại
    //
    // Với Redis:
    //   - Redis INCR command (atomic)
    //
    // await:
    //   - Chờ Promise resolve
    //   - Lấy giá trị counter mới
    const id = await store.incr('url_counter');

    // encodeBase62(id)
    // -------------------------
    // Chuyển số counter thành base62 string
    //
    // Ví dụ:
    //   id = 1 => '1'
    //   id = 10 => 'a'
    //   id = 1000 => 'g8'
    return encodeBase62(id);
}

// ============================================================
// Hàm saveUrl(longUrl)
// ============================================================
// Lưu long URL và trả về short code
//
// Tham số:
//   longUrl: string - URL gốc cần rút gọn
//
// Trả về:
//   shortCode: string - short code đã tạo
async function saveUrl(longUrl) {

    // generateShortCode()
    // -------------------------
    // Tạo short code duy nhất
    //
    // Ví dụ:
    //   shortCode = 'abc'
    const shortCode = await generateShortCode();

    // store.setEx(key, ttl, value)
    // -------------------------
    // Lưu mapping: shortCode -> longUrl
    //
    // key: `url:${shortCode}`
    //   - Template string
    //   - Ví dụ: 'url:abc'
    //
    // ttl: 86400 * 30
    //   - 86400 giây = 1 ngày
    //   - * 30 = 30 ngày
    //   - Short URL hết hạn sau 30 ngày
    //
    // value: longUrl
    //   - URL gốc
    //
    // Ví dụ:
    //   setEx('url:abc', 2592000, 'https://google.com')
    await store.setEx(`url:${shortCode}`, 86400 * 30, longUrl);

    // Trả về short code
    return shortCode;
}

// ============================================================
// Hàm getLongUrl(shortCode)
// ============================================================
// Lấy long URL từ short code
//
// Tham số:
//   shortCode: string - short code
//
// Trả về:
//   longUrl: string - URL gốc nếu tìm thấy
//   null: nếu không tìm thấy
async function getLongUrl(shortCode) {

    // store.get(`url:${shortCode}`)
    // -------------------------
    // Lấy long URL từ storage
    //
    // Ví dụ:
    //   shortCode = 'abc'
    //   get('url:abc') => 'https://google.com'
    const longUrl = await store.get(`url:${shortCode}`);

    // if (!longUrl)
    // -------------------------
    // Nếu không tìm thấy
    // Trả về null
    if (!longUrl) return null;

    // store.incr(`click:${shortCode}`)
    // -------------------------
    // Tăng click counter
    //
    // Mục đích:
    //   - Theo dõi số lần click
    //   - Analytics
    //
    // Ví dụ:
    //   click:abc = 10
    await store.incr(`click:${shortCode}`);

    // Trả về long URL
    return longUrl;
}

// ============================================================
// Hàm readBody(req)
// ============================================================
// Đọc request body từ HTTP request
//
// Đây là function cần thiết khi dùng HTTP server thuần
// (không có Express để tự động parse body)
//
// Tham số:
//   req: IncomingMessage - HTTP request object
//
// Trả về:
//   Promise<object> - parsed JSON body
function readBody(req) {

    // new Promise((resolve, reject) => {})
    // -------------------------
    // Tạo Promise để xử lý async
    //
    // resolve(value): gọi khi đọc body thành công
    // reject(error): gọi khi có lỗi
    return new Promise((resolve, reject) => {

        // data variable để tích lũy chunks
        // HTTP request body đến theo từng chunk
        // Cần nối các chunk lại thành string hoàn chỉnh
        let data = '';

        // req.on('data', callback)
        // -------------------------
        // Event 'data' được phát khi có chunk dữ liệu đến
        //
        // chunk
        // -------------------------
        // Một phần của request body
        //
        // data += chunk
        // -------------------------
        // Nối chunk vào data string
        req.on('data', (chunk) => { data += chunk; });

        // req.on('end', callback)
        // -------------------------
        // Event 'end' được phát khi đã đọc hết body
        req.on('end', () => {

            // try-catch để xử lý JSON parse error
            try {

                // data ? JSON.parse(data) : {}
                // -------------------------
                // Nếu data rỗng: trả về {}
                // Nếu có data: parse JSON
                //
                // JSON.parse(data)
                // -------------------------
                // Chuyển JSON string thành JavaScript object
                //
                // Ví dụ:
                //   data = '{"longUrl":"https://google.com"}'
                //   JSON.parse(data) = { longUrl: 'https://google.com' }
                resolve(data ? JSON.parse(data) : {});

            } catch {

                // JSON không hợp lệ
                // Ví dụ: data = '{longUrl: "https://google.com"}' (thiếu quotes)
                reject(new Error('JSON không hợp lệ'));
            }
        });

        // req.on('error', reject)
        // -------------------------
        // Nếu có lỗi khi đọc request
        // reject Promise
        req.on('error', reject);
    });
}

// ============================================================
// Hàm sendJson(res, status, payload)
// ============================================================
// Gửi JSON response
//
// Tham số:
//   res: ServerResponse - HTTP response object
//   status: number - HTTP status code
//   payload: object - data cần gửi
//
// Ví dụ:
//   sendJson(res, 200, { message: 'OK' })
function sendJson(res, status, payload) {

    // res.writeHead(status, headers)
    // -------------------------
    // Gửi HTTP status code và headers
    //
    // 'Content-Type': 'application/json; charset=utf-8'
    //   - application/json: nội dung là JSON
    //   - charset=utf-8: mã hóa UTF-8
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });

    // JSON.stringify(payload, null, 2)
    // -------------------------
    // Chuyển object thành JSON string
    //
    // null: không có replacer
    // 2: indent 2 spaces (đẹp hơn khi đọc)
    //
    // Ví dụ:
    //   {
    //     "message": "OK"
    //   }
    res.end(JSON.stringify(payload, null, 2));
}

// ============================================================
// Hàm handleRequest(req, res)
// ============================================================
// Xử lý HTTP request
//
// Đây là router chính của ứng dụng
// Phân loại request dựa trên:
//   - Method (GET, POST)
//   - URL path
//
// Tham số:
//   req: IncomingMessage - HTTP request
//   res: ServerResponse - HTTP response
async function handleRequest(req, res) {

    // new URL(req.url, base)
    // -------------------------
    // Parse URL từ request
    //
    // req.url
    //   - Path + query string từ request
    //   - Ví dụ: '/api/shorten?foo=bar'
    //
    // base
    //   - Base URL để parse
    //   - req.headers.host || 'localhost'
    //
    // url.pathname
    //   - Path không có query string
    //   - Ví dụ: '/api/shorten'
    //
    // url.searchParams
    //   - Query parameters
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // ============================================================
    // Route 1: POST /api/shorten
    // ============================================================
    // Tạo short URL mới
    //
    // Ví dụ:
    //   POST /api/shorten
    //   Body: {"longUrl":"https://google.com"}
    //
    // Response:
    //   {
    //     "shortUrl": "http://localhost:3094/a",
    //     "shortCode": "a",
    //     "longUrl": "https://google.com"
    //   }
    if (req.method === 'POST' && url.pathname === '/api/shorten') {
        try {

            // await readBody(req)
            // -------------------------
            // Đọc và parse JSON body từ request
            //
            // Ví dụ:
            //   body = { longUrl: 'https://google.com' }
            const body = await readBody(req);

            // Destructuring
            // -------------------------
            // const { longUrl } = body
            // Tương đương:
            //   const longUrl = body.longUrl
            const { longUrl } = body;

            // if (!longUrl)
            // -------------------------
            // Kiểm tra longUrl có tồn tại không
            //
            // Nếu không có:
            //   - Trả về lỗi 400
            //   - 400 = Bad Request (client gửi thiếu dữ liệu)
            if (!longUrl) {
                return sendJson(res, 400, { error: 'Missing longUrl' });
            }

            // saveUrl(longUrl)
            // -------------------------
            // Lưu long URL và tạo short code
            //
            // Ví dụ:
            //   saveUrl('https://google.com') => 'a'
            const shortCode = await saveUrl(longUrl);

            // req.headers.host || 'localhost:3094'
            // -------------------------
            // Lấy host từ request header
            // Nếu không có, dùng mặc định
            //
            // Ví dụ:
            //   host = 'localhost:3094'
            const host = req.headers.host || 'localhost:3094';

            // sendJson(res, 201, {...})
            // -------------------------
            // Trả về response với status 201 (Created)
            //
            // shortUrl
            //   - URL ngắn đầy đủ
            //   - Ví dụ: http://localhost:3094/a
            //
            // shortCode
            //   - Chỉ short code
            //   - Ví dụ: 'a'
            //
            // longUrl
            //   - URL gốc
            //   - Ví dụ: https://google.com
            return sendJson(res, 201, {
                shortUrl: `http://${host}/${shortCode}`,
                shortCode,
                longUrl
            });

        } catch (err) {

            // catch block xử lý lỗi
            // Ví dụ: JSON không hợp lệ
            return sendJson(res, 400, { error: err.message });
        }
    }

    // ============================================================
    // Route 2: GET /health
    // ============================================================
    // Health check endpoint
    //
    // Dùng để:
    //   - Kiểm tra server còn sống không
    //   - Load balancer health check
    //   - Monitoring
    //
    // Response:
    //   { "status": "ok", "service": "url-shortener" }
    if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { status: 'ok', service: 'url-shortener' });
    }

    // ============================================================
    // Route 3: GET /:shortCode (redirect)
    // ============================================================
    // Redirect từ short URL về long URL
    //
    // Ví dụ:
    //   GET /a
    //   => Redirect 302 tới https://google.com
    //
    // url.pathname.slice(1)
    // -------------------------
    // Lấy short code từ path
    //
    // Ví dụ:
    //   url.pathname = '/a'
    //   url.pathname.slice(1) = 'a'
    const shortCode = url.pathname.slice(1);

    // Kiểm tra:
    //   - req.method === 'GET'
    //   - shortCode không rỗng
    //   - shortCode không chứa '/' (để tránh path traversal)
    if (req.method === 'GET' && shortCode && !shortCode.includes('/')) {

        // getLongUrl(shortCode)
        // -------------------------
        // Lấy long URL từ storage
        //
        // Ví dụ:
        //   getLongUrl('a') => 'https://google.com'
        const longUrl = await getLongUrl(shortCode);

        // if (!longUrl)
        // -------------------------
        // Nếu không tìm thấy short code
        // Trả về 404
        if (!longUrl) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('URL không tồn tại');
        }

        // res.writeHead(302, { Location: longUrl })
        // -------------------------
        // 302 = Found (temporary redirect)
        //
        // Location header
        // -------------------------
        // URL mà browser sẽ redirect tới
        //
        // Ví dụ:
        //   Location: https://google.com
        res.writeHead(302, { Location: longUrl });

        // res.end()
        // -------------------------
        // Kết thúc response
        // Không có body
        return res.end();
    }

    // ============================================================
    // Route mặc định: 404
    // ============================================================
    // Nếu không match route nào
    // Trả về 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found. POST /api/shorten hoặc GET /:shortCode');
}

// ============================================================
// Hàm main()
// ============================================================
// Khởi tạo và chạy server
//
// Đây là entry point của ứng dụng
async function main() {

    // createStore()
    // -------------------------
    // Tạo storage store
    //
    // Nếu có REDIS_URL:
    //   - Kết nối Redis
    //   - Trả về Redis store
    //
    // Nếu không có:
    //   - Trả về MemoryStore
    store = await createStore();

    // process.env.PORT || 3094
    // -------------------------
    // Lấy port từ biến môi trường
    // Nếu không có, dùng mặc định 3094
    //
    // Vì sao 3094?
    //   - 3000 thường dùng cho app khác
    //   - 3094 tránh conflict
    const PORT = process.env.PORT || 3094;

    // http.createServer((req, res) => {})
    // -------------------------
    // Tạo HTTP server
    //
    // Callback chạy mỗi khi có request
    //
    // handleRequest(req, res)
    // -------------------------
    // Xử lý request
    //
    // .catch((err) => {})
    // -------------------------
    // Xử lý lỗi nếu handleRequest() throw error
    const server = http.createServer((req, res) => {
        handleRequest(req, res).catch((err) => {
            console.error(err);
            sendJson(res, 500, { error: 'Internal server error' });
        });
    });

    // server.listen(PORT, callback)
    // -------------------------
    // Bắt đầu server lắng nghe trên port
    //
    // Callback chạy khi server đã sẵn sàng
    server.listen(PORT, () => {
        console.log(`URL Shortener chạy tại http://localhost:${PORT}`);
        console.log('POST /api/shorten  |  GET /:shortCode  |  GET /health');
    });
}

// ============================================================
// Chạy ứng dụng
// ============================================================
// Gọi main() để khởi động server
//
// main() là async function
// Chạy:
//   1. createStore()
//   2. http.createServer()
//   3. server.listen()
main();