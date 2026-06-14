-- Bật extension để tự động sinh UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Xóa các bảng và kiểu cũ nếu tồn tại
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS advanced_users CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;

-- 1. Khởi tạo kiểu dữ liệu ENUM để quản lý trạng thái
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- 2. Khởi tạo bảng advanced_users với các đặc tính nâng cao
CREATE TABLE advanced_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    phones TEXT[], -- Mảng số điện thoại
    status user_status DEFAULT 'active', -- Kiểu dữ liệu ENUM
    base_salary INT,
    bonus INT,
    -- Cột tự động tính toán từ base_salary và bonus (Generated Column)
    total_income INT GENERATED ALWAYS AS (base_salary + bonus) STORED,
    metadata JSONB -- Cột lưu trữ dữ liệu JSONB động
);

-- 3. Khởi tạo bảng articles hỗ trợ Full Text Search
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    -- Cột tsvector tự động tổng hợp từ tiêu đề và nội dung để FTS
    tsv tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED
);

-- CHÈN DỮ LIỆU MẪU
-- Thêm dữ liệu mẫu vào advanced_users (chỉ định ID cố định để dễ truy vấn demo)
INSERT INTO advanced_users (id, name, phones, status, base_salary, bonus, metadata) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'An', ARRAY['0901234567', '0907654321'], 'active', 2000, 500, '{"skills": ["React", "NodeJS"], "address": {"city": "Hanoi"}}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Bình', ARRAY['0912345678'], 'active', 2500, 300, '{"skills": ["VueJS", "Python"], "address": {"city": "HCM"}}'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cường', ARRAY['0987654321', '0901112222'], 'inactive', 3000, 600, '{"skills": ["React", "Go", "Kubernetes"], "address": {"city": "Hanoi"}}'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Duy', NULL, 'suspended', 1500, 100, '{"skills": ["PHP"], "address": {"city": "Danang"}}');

-- Thêm dữ liệu mẫu vào articles
INSERT INTO articles (title, content) VALUES
('Getting Started with PostgreSQL', 'PostgreSQL is an advanced, enterprise-class open-source relational database. This tutorial covers basic select, join and window functions.'),
('Building Web Applications with React and NodeJS', 'Learn how to build high performance web applications using React on the frontend and NodeJS on the backend server.'),
('Scaling Database Applications', 'Database indexing, GIN index, BTree index and query optimization using explain analyze are critical for scalability.'),
('Introduction to Docker and Kubernetes', 'Docker containers and Kubernetes orchestration make modern application deployment and scaling seamless.');
