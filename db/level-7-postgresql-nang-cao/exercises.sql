-- @query: Bài 1 - Kiểu dữ liệu UUID và ENUM
-- UUID: Được tạo tự động dưới dạng chuỗi định danh duy nhất toàn cầu dài 36 ký tự.
-- status: Được định nghĩa kiểu ENUM 'user_status', giới hạn chỉ cho phép các giá trị: active, inactive, suspended.
SELECT id, name, status
FROM advanced_users;

-- @query: Bài 2 - UPSERT (ON CONFLICT DO UPDATE)
-- ON CONFLICT (id): Phát hiện trùng khóa chính (ID).
-- DO UPDATE SET base_salary = ...: Nếu trùng ID, sẽ tiến hành cập nhật bằng cách cộng thêm lương thay vì báo lỗi và dừng thực thi.
-- EXCLUDED: Đại diện cho dữ liệu mà ta định INSERT vào (ở đây base_salary mới định chèn là 1000).
INSERT INTO advanced_users (id, name, status, base_salary, bonus)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'An', 'active', 1000, 100)
ON CONFLICT (id) 
DO UPDATE SET base_salary = advanced_users.base_salary + EXCLUDED.base_salary;

-- @query: Bài 3 - Generated Column tự động tính toán
-- Cột total_income được định nghĩa là GENERATED ALWAYS AS (base_salary + bonus) STORED.
-- Dữ liệu cột này được lưu trữ và tự động cập nhật mỗi khi base_salary hoặc bonus thay đổi.
SELECT name, base_salary, bonus, total_income
FROM advanced_users;

-- @query: Bài 4 - Truy xuất mảng ARRAY (Số điện thoại đầu tiên)
-- phones[1]: Chỉ mục của ARRAY trong PostgreSQL bắt đầu từ số 1 (không phải 0).
-- SELECT phones[1] lấy ra số điện thoại đầu tiên của người dùng.
SELECT name, phones[1] AS primary_phone
FROM advanced_users
WHERE phones IS NOT NULL;

-- @query: Bài 5 - Kiểm tra phần tử trong mảng dùng ANY
-- = ANY(phones): Lọc ra những người có một trong các số điện thoại trong mảng bằng chuỗi '0901234567'.
SELECT name, phones
FROM advanced_users
WHERE '0901234567' = ANY(phones);

-- @query: Bài 6 - Kiểm tra giao mảng dùng toán tử &&
-- &&: Toán tử kiểm tra xem mảng ở cột 'phones' và mảng chỉ định có phần tử chung nào không (giao nhau khác rỗng).
SELECT name, phones
FROM advanced_users
WHERE phones && ARRAY['0901234567', '0999999999'];

-- @query: Bài 7 - Truy vấn JSONB cơ bản
-- metadata: Cột chứa tài liệu JSON. PostgreSQL cho phép lưu trữ cấu trúc JSON linh hoạt và truy vấn siêu tốc.
SELECT id, name, metadata
FROM advanced_users;

-- @query: Bài 8 - Trích xuất giá trị từ JSONB
-- ->: Trả về đối tượng JSON hoặc mảng JSON con.
-- ->>: Trả về giá trị dưới dạng chuỗi (text), giúp hiển thị trực tiếp dữ liệu dạng chuỗi trong kết quả.
SELECT name, 
       metadata->'address'->>'city' AS city
FROM advanced_users;

-- @query: Bài 9 - Tìm kiếm trong JSONB dùng toán tử @>
-- @>: Toán tử kiểm tra xem JSON ở cột 'metadata' có chứa đối tượng JSON chỉ định ở bên phải hay không.
-- '{"skills": ["React"]}': Tìm những user có skill "React" trong mảng 'skills'.
SELECT name, metadata->'skills' AS skills
FROM advanced_users
WHERE metadata @> '{"skills": ["React"]}';

-- @query: Bài 10 - Kiểm tra key tồn tại trong JSONB dùng toán tử ?
-- ?: Kiểm tra xem key ở bên phải có tồn tại ở mức cao nhất của JSONB bên trái hay không.
SELECT name, metadata
FROM advanced_users
WHERE metadata ? 'skills';

-- @query: Bài 11 - Kiểm tra đồng thời nhiều key tồn tại dùng toán tử ?&
-- ?&: Kiểm tra xem tất cả các key trong mảng bên phải có đồng thời tồn tại trong đối tượng JSONB bên trái hay không.
SELECT name, metadata
FROM advanced_users
WHERE metadata ?& ARRAY['skills', 'address'];

-- @query: Bài 12 - Cập nhật JSONB bằng jsonb_set
-- jsonb_set(cột, đường_dẫn_key, giá_trị_mới): Thay thế hoặc chèn thêm cặp key-value trong tài liệu JSONB.
-- '{address,city}': Đường dẫn thuộc tính cần cập nhật.
-- '"Hanoi Capital"'::jsonb: Giá trị mới định dạng JSONB.
UPDATE advanced_users
SET metadata = jsonb_set(metadata, '{address,city}', '"Hanoi Capital"'::jsonb)
WHERE name = 'An';

-- @query: Bài 13 - Xóa key khỏi JSONB dùng toán tử -
-- metadata - 'skills': Trả về tài liệu JSONB sau khi đã loại bỏ thuộc tính 'skills'.
SELECT name, metadata - 'skills' AS metadata_without_skills
FROM advanced_users;

-- @query: Bài 14 - Gộp hai đối tượng JSONB dùng toán tử ||
-- ||: Toán tử gộp (concat) hai đối tượng JSONB. Nếu trùng key, giá trị ở đối tượng bên phải sẽ ghi đè lên bên trái.
SELECT name, 
       metadata || '{"experience": "3 years"}'::jsonb AS updated_metadata
FROM advanced_users;

-- @query: Bài 15 - Tạo chỉ mục GIN cho cột JSONB
-- USING gin: Chỉ định chỉ mục đảo ngược (Generalized Inverted Index) chuyên dùng cho các kiểu dữ liệu đa trị như JSONB, mảng hoặc FTS.
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin ON advanced_users USING gin (metadata);

-- @query: Bài 16 - Tạo chỉ mục bán phần (Partial Index)
-- WHERE status = 'active': Chỉ đánh chỉ mục cho những nhân viên có trạng thái hoạt động. Giúp tối ưu hóa dung lượng ổ đĩa và tăng tốc độ ghi.
CREATE INDEX IF NOT EXISTS idx_users_active ON advanced_users (name) WHERE status = 'active';

-- @query: Bài 17 - Tìm kiếm toàn văn (Full Text Search) cơ bản
-- @@: Toán tử đối sánh tìm kiếm toàn văn.
-- to_tsquery('english', 'database'): Chuyển đổi từ khóa tìm kiếm thành dạng truy vấn logic phù hợp với ngôn ngữ tiếng Anh.
SELECT title, content
FROM articles
WHERE tsv @@ to_tsquery('english', 'database');

-- @query: Bài 18 - Xếp hạng kết quả tìm kiếm FTS dùng ts_rank
-- ts_rank(tsv, query): Tính điểm xếp hạng dựa trên tần suất xuất hiện và vị trí của các từ khóa trong tài liệu.
-- Ở đây tìm các bài viết chứa 'PostgreSQL' hoặc 'NodeJS' (toán tử OR là | trong tsquery).
SELECT title, 
       ts_rank(tsv, to_tsquery('english', 'PostgreSQL | NodeJS')) AS search_rank
FROM articles
WHERE tsv @@ to_tsquery('english', 'PostgreSQL | NodeJS')
ORDER BY search_rank DESC;

-- @query: Bài 19 - Highlight từ khóa tìm kiếm dùng ts_headline
-- ts_headline('english', content, query): Hàm tự động bao bọc từ khóa tìm kiếm tìm thấy trong văn bản bằng thẻ HTML <b>...</b> giúp lập trình viên hiển thị nổi bật trên UI.
SELECT title, 
       ts_headline('english', content, to_tsquery('english', 'database')) AS highlighted_snippet
FROM articles
WHERE tsv @@ to_tsquery('english', 'database');

-- @query: Bài 20 - Giải thích truy vấn (EXPLAIN ANALYZE) tìm kiếm FTS
-- Trước tiên ta tạo GIN index trên cột tsv của articles
-- Sau đó chạy EXPLAIN ANALYZE để xem cấu trúc thực thi truy vấn (sử dụng Index Scan thay cho Seq Scan).
CREATE INDEX IF NOT EXISTS idx_articles_tsv_gin ON articles USING gin (tsv);
EXPLAIN ANALYZE 
SELECT title 
FROM articles 
WHERE tsv @@ to_tsquery('english', 'database');
