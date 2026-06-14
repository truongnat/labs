-- @query: Bài 1 - Tạo B-Tree Index cho email
-- CREATE UNIQUE INDEX: Tạo chỉ mục duy nhất. Vừa tăng tốc tìm kiếm, vừa đảm bảo dữ liệu không bị trùng lặp.
-- B-Tree là thuật toán mặc định của PostgreSQL, phù hợp cho tìm kiếm chính xác và tìm kiếm theo khoảng.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cust_email ON customers_opt (email);

-- @query: Bài 2 - Tạo Composite Index (chỉ mục kết hợp)
-- Composite Index được tạo trên nhiều cột cùng lúc (user_id và created_at).
-- Phù hợp khi truy vấn lọc theo cả 2 cột hoặc lọc theo user_id trước rồi sắp xếp theo created_at.
CREATE INDEX IF NOT EXISTS idx_cust_userid_created ON customers_opt (user_id, created_at);

-- @query: Bài 3 - Tạo Partial Index (chỉ mục bán phần)
-- WHERE status = 'active': Chỉ lập chỉ mục cho những khách hàng đang hoạt động.
-- Giúp giảm đáng kể dung lượng index trên ổ đĩa và tăng tốc các truy vấn tìm kiếm khách hàng hoạt động.
CREATE INDEX IF NOT EXISTS idx_cust_active_status ON customers_opt (name) WHERE status = 'active';

-- @query: Bài 4 - Tạo Covering Index (chỉ mục bao phủ)
-- INCLUDE (name): Đính kèm thêm dữ liệu cột 'name' vào trong index.
-- Khi SELECT name WHERE user_id = X, Postgres chỉ cần đọc dữ liệu từ index mà không cần đọc bảng chính (Index Only Scan).
CREATE INDEX IF NOT EXISTS idx_cust_userid_include_name ON customers_opt (user_id) INCLUDE (name);

-- @query: Bài 5 - Tạo GIN Index cho cột JSONB
-- USING gin (metadata): Sử dụng chỉ mục đảo ngược (GIN) để đánh chỉ mục cho toàn bộ thuộc tính động bên trong tài liệu JSONB.
CREATE INDEX IF NOT EXISTS idx_cust_metadata_gin ON customers_opt USING gin (metadata);

-- @query: Bài 6 - Tạo BRIN Index cho bảng log
-- USING brin (log_date): Sử dụng Block Range Index (BRIN) cho cột ngày tháng tăng dần.
-- BRIN lưu trữ giá trị Min/Max của từng khối trang đĩa. Cực kỳ gọn nhẹ (chỉ bằng vài % kích thước B-Tree) cho các bảng logs khổng lồ.
CREATE INDEX IF NOT EXISTS idx_logs_date_brin ON system_logs USING brin (log_date);

-- @query: Bài 7 - Tạo Hash Index
-- USING hash (status): Sử dụng chỉ mục Hash. Chỉ tối ưu cho việc tìm kiếm chính xác bằng (=), không hỗ trợ tìm kiếm khoảng hoặc sắp xếp.
CREATE INDEX IF NOT EXISTS idx_cust_status_hash ON customers_opt USING hash (status);

-- @query: Bài 8 - Xem kế hoạch thực thi bằng EXPLAIN
-- EXPLAIN: Phân tích và hiển thị kế hoạch thực thi dự kiến của Postgres mà không thực sự chạy truy vấn.
-- Giúp lập trình viên kiểm tra xem câu lệnh SQL sẽ sử dụng Index Scan hay Seq Scan.
EXPLAIN SELECT * FROM customers_opt WHERE email = 'an@example.com';

-- @query: Bài 9 - Đo lường thời gian thực chạy bằng EXPLAIN ANALYZE
-- EXPLAIN ANALYZE: Thực thi thực sự câu lệnh SQL, đo lường thời gian chạy (Planning time, Execution time) và số lượng khối đĩa đã đọc.
EXPLAIN ANALYZE SELECT * FROM customers_opt WHERE email = 'an@example.com';

-- @query: Bài 10 - Phân trang kiểu truyền thống (LIMIT OFFSET)
-- LIMIT 2 OFFSET 2: Lấy 2 dòng tiếp theo từ dòng thứ 3.
-- Nhược điểm: Khi OFFSET lên hàng triệu dòng, Postgres vẫn phải quét qua hàng triệu dòng đó rồi mới lấy ra LIMIT, gây chậm dần ở các trang cuối.
SELECT id, name FROM customers_opt ORDER BY id LIMIT 2 OFFSET 2;

-- @query: Bài 11 - Tối ưu hóa phân trang bằng Keyset Pagination (Cursor-based)
-- WHERE id > 2: Sử dụng giá trị cuối cùng của trang trước đó làm cursor.
-- Kết hợp với INDEX trên cột 'id', truy vấn sẽ chạy cực kỳ nhanh O(1) bất kể ở trang thứ bao nhiêu vì không cần sử dụng OFFSET.
SELECT id, name FROM customers_opt WHERE id > 2 ORDER BY id LIMIT 2;

-- @query: Bài 12 - Kiểm tra cơ chế lược bỏ phân vùng (Partition Pruning)
-- EXPLAIN: Xem kế hoạch chạy. Do ta có điều kiện `sales_date = '2026-03-05'`, Postgres sẽ tự động nhận biết dữ liệu thuộc phân vùng `sales_2026`.
-- Hệ thống chỉ quét trên bảng `sales_2026` và hoàn toàn loại bỏ bảng `sales_2025` khỏi kế hoạch quét.
EXPLAIN SELECT * FROM sales_records WHERE sales_date = '2026-03-05';

-- @query: Bài 13 - Thu thập số liệu thống kê bằng ANALYZE
-- ANALYZE: Lệnh cập nhật số liệu thống kê phân phối dữ liệu trong bảng.
-- Dựa trên thông tin này, bộ tối ưu (Planner) của Postgres mới có thể đưa ra quyết định chọn index nào tối ưu nhất.
ANALYZE customers_opt;

-- @query: Bài 14 - Giải phóng không gian đĩa bằng VACUUM
-- VACUUM: Dọn dẹp các dòng dữ liệu chết (dead tuples) sinh ra do quá trình UPDATE hoặc DELETE tạo ra.
-- Giúp thu hồi dung lượng đĩa và ngăn chặn hiện tượng phình to kích thước bảng (table bloat).
VACUUM customers_opt;

-- @query: Bài 15 - Truy vấn danh mục kiểm tra danh sách Index của bảng
-- Truy vấn từ bảng hệ thống `pg_indexes` để kiểm tra danh sách chỉ mục đã được tạo thành công trên bảng `customers_opt`.
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'customers_opt';
