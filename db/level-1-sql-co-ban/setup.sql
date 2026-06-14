-- Reset bảng nếu đã tồn tại để đảm bảo tính nhất quán khi chạy lại
DROP TABLE IF EXISTS users CASCADE;

-- Khởi tạo bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    city VARCHAR(50),
    salary INT
);

-- Chèn dữ liệu mẫu cho 10 người dùng
INSERT INTO users (name, age, city, salary) VALUES
('An', 22, 'Hanoi', 1000),
('Bình', 25, 'HCM', 2000),
('Cường', 30, 'Hanoi', 3000),
('Duy', 28, 'Danang', 1500),
('Hoa', 21, NULL, 1200),
('Anh', 26, 'HCM', 2500),
('Tuấn', 32, 'Hanoi', 4000),
('Linh', 24, 'Danang', 1800),
('Minh', 29, 'HCM', 3500),
('Trang', 27, 'Hanoi', 2200);
