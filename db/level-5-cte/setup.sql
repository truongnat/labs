-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    salary INT
);

-- 2. Bảng orders (có thời gian đặt hàng chi tiết để phân tích thời gian)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount INT,
    status VARCHAR(50),
    created_at DATE
);

-- 3. Bảng employees (Cơ cấu nhân sự phân cấp)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    manager_id INT REFERENCES employees(id)
);

-- 4. Bảng categories (Cây danh mục hàng hóa)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id INT REFERENCES categories(id)
);

-- CHÈN DỮ LIỆU
INSERT INTO users (name, salary) VALUES
('An', 1500),
('Bình', 2200),
('Cường', 3500),
('Duy', 1200);

-- Các đơn hàng phát sinh từ tháng 1 đến tháng 3 năm 2026
INSERT INTO orders (user_id, amount, status, created_at) VALUES
(1, 100, 'paid', '2026-01-10'),
(1, 150, 'paid', '2026-02-15'),
(2, 200, 'paid', '2026-01-20'),
(2, 300, 'paid', '2026-02-10'),
(3, 500, 'paid', '2026-02-25'),
(4, 100, 'paid', '2026-03-05'),
(1, 200, 'paid', '2026-03-12');

-- Thiết lập cây nhân viên
-- 1. Hùng (CEO)
-- 2. Sơn (Tech Lead) - Quản lý bởi Hùng
-- 3. Lan (HR Manager) - Quản lý bởi Hùng
-- 4. Hải (Dev) - Quản lý bởi Sơn
-- 5. Vy (Dev) - Quản lý bởi Sơn
INSERT INTO employees (id, name, manager_id) VALUES
(1, 'Hùng (CEO)', NULL),
(2, 'Sơn (Tech Lead)', 1),
(3, 'Lan (HR Manager)', 1),
(4, 'Hải (Dev)', 2),
(5, 'Vy (Dev)', 2);

-- Thiết lập cây danh mục
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Điện tử', NULL),
(2, 'Điện thoại', 1),
(3, 'iPhone', 2),
(4, 'Máy tính', 1),
(5, 'MacBook', 4),
(6, 'Thời trang', NULL),
(7, 'Áo', 6);

-- Đồng bộ lại serial key cho SERIAL id của PostgreSQL
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
