-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS sales_records CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS customers_opt CASCADE;

-- 1. Bảng customers_opt để thực hành các loại Index & Phân trang
CREATE TABLE customers_opt (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- 2. Bảng system_logs giả lập lượng dữ liệu lớn để đánh chỉ mục BRIN
CREATE TABLE system_logs (
    id SERIAL,
    log_level VARCHAR(20),
    message TEXT,
    log_date DATE
);

-- 3. Bảng sales_records để thực hành Phân vùng bảng (Partitioning) theo năm
CREATE TABLE sales_records (
    id INT,
    amount INT,
    sales_date DATE NOT NULL
) PARTITION BY RANGE (sales_date);

-- Khởi tạo các phân vùng vật lý (Physical Partitions)
CREATE TABLE sales_2025 PARTITION OF sales_records
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE sales_2026 PARTITION OF sales_records
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- CHÈN DỮ LIỆU
-- Seed cho customers_opt
INSERT INTO customers_opt (name, email, user_id, status, created_at, metadata) VALUES
('An', 'an@example.com', 1, 'active', '2026-01-01 10:00:00', '{"roles": ["admin"], "settings": {"theme": "dark"}}'),
('Bình', 'binh@example.com', 1, 'active', '2026-01-02 11:00:00', '{"roles": ["user"], "settings": {"theme": "light"}}'),
('Cường', 'cuong@example.com', 2, 'inactive', '2026-01-03 12:00:00', '{"roles": ["user"], "settings": {"theme": "dark"}}'),
('Duy', 'duy@example.com', 3, 'suspended', '2026-01-04 13:00:00', '{"roles": ["guest"], "settings": {"theme": "light"}}');

-- Seed cho system_logs
INSERT INTO system_logs (log_level, message, log_date) VALUES
('info', 'System initialized', '2026-01-01'),
('warning', 'High memory usage', '2026-01-02'),
('error', 'Connection refused', '2026-01-03'),
('info', 'Job completed', '2026-01-04');

-- Seed cho sales_records (tự động phân bổ vào các phân vùng tương ứng)
INSERT INTO sales_records (id, amount, sales_date) VALUES
(1, 100, '2025-06-15'), -- Rơi vào sales_2025
(2, 200, '2025-12-20'), -- Rơi vào sales_2025
(3, 150, '2026-01-10'), -- Rơi vào sales_2026
(4, 300, '2026-03-05'); -- Rơi vào sales_2026
