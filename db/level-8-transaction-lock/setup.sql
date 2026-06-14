-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS products_stock CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- 1. Bảng tài khoản ngân hàng (có ràng buộc balance >= 0)
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    owner VARCHAR(50) NOT NULL,
    balance INT NOT NULL CHECK (balance >= 0),
    version INT DEFAULT 1 NOT NULL -- Dùng cho Khóa lạc quan (Optimistic Locking)
);

-- 2. Bảng quản lý kho sản phẩm (có ràng buộc stock >= 0)
CREATE TABLE products_stock (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0)
);

-- CHÈN DỮ LIỆU MẪU
INSERT INTO accounts (id, owner, balance, version) VALUES
(1, 'An', 1000, 1),
(2, 'Bình', 500, 1),
(3, 'Cường', 2000, 1);

INSERT INTO products_stock (id, name, stock) VALUES
(101, 'iPhone 15', 5),
(102, 'MacBook Air M3', 2);
