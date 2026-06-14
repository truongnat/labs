-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS ticket_sequences CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS user_logins CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Bảng phòng ban & nhân viên
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department_id INT REFERENCES departments(id),
    salary INT
);

INSERT INTO departments (id, name) VALUES
(1, 'Sales'), 
(2, 'Engineering'), 
(3, 'HR');

INSERT INTO employees (name, department_id, salary) VALUES
('An', 1, 3000),
('Bình', 1, 3000), 
('Cường', 1, 4000),
('Duy', 2, 6000),
('Hoa', 2, 5000),
('Hải', 2, 5000), 
('Vy', 2, 7000),
('Lan', 3, 2500);

-- 2. Bảng đơn hàng (Orders)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount INT,
    created_at DATE
);

-- Các đơn hàng liên tục qua từng ngày để tính tăng trưởng, trung bình trượt
INSERT INTO orders (user_id, amount, created_at) VALUES
(1, 100, '2026-06-01'),
(2, 150, '2026-06-02'),
(1, 200, '2026-06-03'),
(3, 300, '2026-06-04'),
(2, 250, '2026-06-05'),
(1, 120, '2026-06-06'),
(4, 400, '2026-06-07'),
(3, 180, '2026-06-08'),
(2, 220, '2026-06-09'),
(1, 500, '2026-06-10'),
-- Dữ liệu lịch sử bổ sung cho phân tích DAU/MAU và giữ chân khách hàng (tháng 5)
(1, 100, '2026-05-01'),
(1, 150, '2026-05-15'),
(2, 200, '2026-05-01'),
(2, 300, '2026-06-12');

-- 3. Bảng đăng nhập (để tính streak đăng nhập liên tiếp)
CREATE TABLE user_logins (
    user_id INT,
    login_date DATE,
    PRIMARY KEY (user_id, login_date)
);

INSERT INTO user_logins (user_id, login_date) VALUES
(1, '2026-06-01'),
(1, '2026-06-02'),
(1, '2026-06-03'),
(1, '2026-06-05'), -- đứt chuỗi ở ngày 4
(1, '2026-06-06'),
(2, '2026-06-01'),
(2, '2026-06-02'),
(2, '2026-06-03'),
(2, '2026-06-04'),
(2, '2026-06-05'); -- chuỗi liên tục 5 ngày

-- 4. Bảng hoạt động của user (để tính sessionization)
CREATE TABLE user_activities (
    user_id INT,
    activity_time TIMESTAMP
);

INSERT INTO user_activities (user_id, activity_time) VALUES
(1, '2026-06-15 10:00:00'),
(1, '2026-06-15 10:15:00'),
(1, '2026-06-15 10:25:00'), -- khoảng cách đều <= 30 phút -> Session 1
(1, '2026-06-15 11:15:00'), -- cách log trước 50 phút (>30 phút) -> Bắt đầu Session 2
(1, '2026-06-15 13:00:00'), -- cách log trước 105 phút (>30 phút) -> Bắt đầu Session 3
(1, '2026-06-15 13:10:00'); -- cách log trước 10 phút -> Thuộc Session 3

-- 5. Bảng dãy số vé (để tìm gap sequence)
CREATE TABLE ticket_sequences (
    id INT PRIMARY KEY
);
INSERT INTO ticket_sequences (id) VALUES
(1), (2), (3), (5), (6), (8), (9), (12);
