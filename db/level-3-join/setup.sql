-- Xóa các bảng cũ nếu tồn tại theo thứ tự ràng buộc khóa ngoại (foreign key dependencies)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Bảng users (Khách hàng)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- 2. Bảng departments (Phòng ban)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- 3. Bảng employees (Nhân viên - có tự tham chiếu khóa ngoại manager_id)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department_id INT REFERENCES departments(id),
    salary INT,
    manager_id INT REFERENCES employees(id)
);

-- 4. Bảng orders (Đơn hàng)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount INT,
    status VARCHAR(50)
);

-- 5. Bảng products (Sản phẩm)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price INT NOT NULL
);

-- 6. Bảng order_items (Chi tiết đơn hàng - Bảng trung gian liên kết orders và products)
CREATE TABLE order_items (
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- CHÈN DỮ LIỆU MẪU
-- Khách hàng: Cường và Hoa sẽ không mua đơn hàng nào (để test LEFT JOIN)
INSERT INTO users (name) VALUES
('An'), 
('Bình'), 
('Cường'), 
('Duy'), 
('Hoa');

-- Phòng ban: Marketing sẽ không có nhân viên nào (để test RIGHT JOIN/LEFT JOIN)
INSERT INTO departments (name) VALUES
('Sales'), 
('Engineering'), 
('HR'), 
('Marketing');

-- Nhân viên:
-- - Giám Đốc Hùng: Không thuộc phòng ban nào (NULL), không có quản lý (NULL)
-- - Quản Lý Sơn: Cấp dưới của Hùng (id 1)
-- - Nhân Viên Hải: Cấp dưới của Sơn (id 2)
-- - Nhân Viên Vy: Cấp dưới của Hùng (id 1)
INSERT INTO employees (name, department_id, salary, manager_id) VALUES
('Giám Đốc Hùng', NULL, 10000, NULL),
('Quản Lý Sơn', 2, 5000, 1),
('Nhân Viên Hải', 2, 3000, 2),
('Nhân Viên Vy', 1, 2500, 1);

-- Đơn hàng
INSERT INTO orders (user_id, amount, status) VALUES
(1, 500, 'paid'),      -- Đơn 1
(1, 200, 'pending'),   -- Đơn 2
(2, 600, 'paid'),      -- Đơn 3
(4, 200, 'paid');      -- Đơn 4

-- Sản phẩm: Tai nghe Sony sẽ không có đơn đặt nào
INSERT INTO products (name, price) VALUES
('Laptop Dell', 500),
('Chuột Logitech', 50),
('Bàn phím cơ', 100),
('Màn hình Asus', 200),
('Tai nghe Sony', 150);

-- Chi tiết đơn hàng
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 1), -- Đơn 1: 1 Laptop Dell (500)
(2, 2, 4), -- Đơn 2: 4 Chuột Logitech (4 * 50 = 200)
(3, 1, 1), -- Đơn 3: 1 Laptop Dell (500)
(3, 3, 1), -- Đơn 3: 1 Bàn phím cơ (100) -> Tổng đơn 3 là 600
(4, 4, 1); -- Đơn 4: 1 Màn hình Asus (200)
