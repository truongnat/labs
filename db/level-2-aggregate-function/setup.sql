-- Reset bảng orders nếu đã tồn tại
DROP TABLE IF EXISTS orders CASCADE;

-- Khởi tạo bảng orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    amount INT,
    status VARCHAR(50)
);

-- Chèn dữ liệu mẫu cho bảng orders
INSERT INTO orders (user_id, amount, status) VALUES
(1, 100, 'paid'),
(1, 200, 'paid'),
(2, 300, 'pending'),
(2, 400, 'paid'),
(3, 150, 'cancelled'),
(1, 250, 'pending'),
(4, 600, 'paid'),
(3, 350, 'paid'),
(2, 100, 'cancelled'),
(4, 50, 'pending');
