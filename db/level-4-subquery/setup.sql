-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    salary INT
);

-- 2. Bảng departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- 3. Bảng employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department_id INT REFERENCES departments(id),
    salary INT
);

-- 4. Bảng orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount INT,
    status VARCHAR(50)
);

-- 5. Bảng products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price INT
);

-- 6. Bảng order_items
CREATE TABLE order_items (
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

-- Gieo dữ liệu mẫu
INSERT INTO users (name, salary) VALUES
('An', 1500),
('Bình', 2200),
('Cường', 3500),
('Duy', 1200),
('Hoa', 800);

INSERT INTO departments (name) VALUES
('Sales'), 
('Engineering'), 
('HR');

INSERT INTO employees (name, department_id, salary) VALUES
('Hùng', 1, 3000), 
('Sơn', 1, 2000), 
('Hải', 2, 4500), 
('Vy', 2, 4000),  
('Lan', 3, 2500); 

INSERT INTO orders (user_id, amount, status) VALUES
(1, 100, 'paid'),      -- Đơn 1
(1, 200, 'pending'),   -- Đơn 2
(2, 500, 'paid'),      -- Đơn 3
(3, 1000, 'paid'),     -- Đơn 4
(4, 50, 'cancelled');  -- Đơn 5 (Hoa có id 5 không có đơn nào)

INSERT INTO products (name, price) VALUES
('Laptop', 500),
('Mouse', 50),
('Keyboard', 100);

-- Chi tiết đơn hàng
-- Đơn 1: Mua Laptop (1)
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 1);

-- Đơn 2: Mua Mouse (2)
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(2, 2, 1);

-- Đơn 3: Mua Keyboard (3)
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(3, 3, 1);

-- Đơn 4: Mua Laptop (1), Mouse (2), Keyboard (3) -> Đơn này mua TẤT CẢ các sản phẩm!
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(4, 1, 1),
(4, 2, 1),
(4, 3, 1);
