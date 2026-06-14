-- =========================================================================
-- CLEANUP: Xóa toàn bộ các bảng cũ nếu tồn tại
-- =========================================================================
DROP TABLE IF EXISTS chat_read_receipts CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversation_members CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS chat_users CASCADE;

DROP TABLE IF EXISTS grab_payments CASCADE;
DROP TABLE IF EXISTS grab_rides CASCADE;
DROP TABLE IF EXISTS grab_drivers CASCADE;
DROP TABLE IF EXISTS grab_customers CASCADE;

DROP TABLE IF EXISTS soc_follows CASCADE;
DROP TABLE IF EXISTS soc_likes CASCADE;
DROP TABLE IF EXISTS soc_comments CASCADE;
DROP TABLE IF EXISTS soc_posts CASCADE;
DROP TABLE IF EXISTS soc_users CASCADE;

DROP TABLE IF EXISTS eco_payments CASCADE;
DROP TABLE IF EXISTS eco_order_items CASCADE;
DROP TABLE IF EXISTS eco_orders CASCADE;
DROP TABLE IF EXISTS eco_vouchers CASCADE;
DROP TABLE IF EXISTS eco_products CASCADE;
DROP TABLE IF EXISTS eco_users CASCADE;

-- =========================================================================
-- 1. ECOMMERCE SYSTEM 🛒
-- =========================================================================
CREATE TABLE eco_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE eco_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0)
);

CREATE TABLE eco_vouchers (
    code VARCHAR(20) PRIMARY KEY,
    discount_amount INT NOT NULL,
    min_spend INT NOT NULL,
    expiry_date DATE NOT NULL
);

CREATE TABLE eco_orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES eco_users(id),
    voucher_code VARCHAR(20) REFERENCES eco_vouchers(code),
    raw_amount INT NOT NULL,
    final_amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE eco_order_items (
    order_id INT REFERENCES eco_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES eco_products(id),
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE eco_payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES eco_orders(id),
    amount INT NOT NULL,
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending'
);

-- Seed Ecommerce
INSERT INTO eco_users (id, name) VALUES (1, 'An'), (2, 'Bình'), (3, 'Cường');
INSERT INTO eco_products (id, name, price, stock) VALUES
(1, 'iPhone 15', 1000, 10),
(2, 'Ốp lưng Silicon', 20, 100),
(3, 'Cáp sạc USB-C', 15, 3); -- sắp hết hàng

INSERT INTO eco_vouchers (code, discount_amount, min_spend, expiry_date) VALUES
('GIAM100', 100, 500, '2026-12-31'),
('HETHAN', 50, 100, '2025-01-01');

INSERT INTO eco_orders (id, user_id, voucher_code, raw_amount, final_amount, status) VALUES
(1, 1, 'GIAM100', 1020, 920, 'paid'),
(2, 2, NULL, 20, 20, 'refunded'),
(3, 3, NULL, 15, 15, 'pending');

INSERT INTO eco_order_items (order_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 2, 1),
(3, 3, 1);

INSERT INTO eco_payments (order_id, amount, payment_method, status) VALUES
(1, 920, 'credit_card', 'success'),
(2, 20, 'momo', 'refunded');

-- =========================================================================
-- 2. SOCIAL NETWORK SYSTEM 📱
-- =========================================================================
CREATE TABLE soc_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE soc_posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES soc_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soc_comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES soc_posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES soc_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soc_likes (
    post_id INT REFERENCES soc_posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES soc_users(id),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE soc_follows (
    follower_id INT REFERENCES soc_users(id),
    followee_id INT REFERENCES soc_users(id),
    PRIMARY KEY (follower_id, followee_id)
);

-- Seed Social Network
INSERT INTO soc_users (id, name) VALUES (1, 'An'), (2, 'Bình'), (3, 'Cường'), (4, 'Duy');

INSERT INTO soc_posts (id, user_id, content, created_at) VALUES
(1, 1, 'Hôm nay học SQL nâng cao vui quá!', NOW() - INTERVAL '2 hours'),
(2, 2, 'Mình chuẩn bị đi du lịch đây!', NOW() - INTERVAL '5 hours'),
(3, 3, 'Backend developer nên biết tối ưu index database.', NOW() - INTERVAL '1 day');

INSERT INTO soc_comments (post_id, user_id, content, created_at) VALUES
(1, 2, 'Tuyệt vời anh ơi!', NOW() - INTERVAL '1 hour'),
(3, 1, 'Chuẩn luôn bài viết bổ ích!', NOW() - INTERVAL '10 hours');

INSERT INTO soc_likes (post_id, user_id) VALUES
(1, 2), (1, 3), (3, 1), (3, 2);

-- An (1) follow Bình (2) và Cường (3)
-- Bình (2) follow Cường (3) và Duy (4)
-- Cường (3) follow An (1) và Bình (2)
INSERT INTO soc_follows (follower_id, followee_id) VALUES
(1, 2), (1, 3),
(2, 3), (2, 4),
(3, 1), (3, 2);

-- =========================================================================
-- 3. GRAB TAXI SYSTEM 🚕
-- =========================================================================
CREATE TABLE grab_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE grab_drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE grab_rides (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES grab_customers(id),
    driver_id INT REFERENCES grab_drivers(id),
    start_lat DOUBLE PRECISION NOT NULL,
    start_lng DOUBLE PRECISION NOT NULL,
    end_lat DOUBLE PRECISION NOT NULL,
    end_lng DOUBLE PRECISION NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    fare INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INT CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE grab_payments (
    id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES grab_rides(id),
    amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Seed Grab
INSERT INTO grab_customers (id, name) VALUES (1, 'Khách An'), (2, 'Khách Bình');
INSERT INTO grab_drivers (id, name, lat, lng, is_available) VALUES
(1, 'Tài xế Sơn (Gần)', 10.7760, 106.7010, TRUE), -- Rất gần Khách An ở (10.7750, 106.7000)
(2, 'Tài xế Hùng (Xa)', 10.8500, 106.7500, TRUE),
(3, 'Tài xế Hải (Bận)', 10.7755, 106.7005, FALSE);

INSERT INTO grab_rides (id, customer_id, driver_id, start_lat, start_lng, end_lat, end_lng, distance_km, fare, status, created_at, rating) VALUES
(1, 1, 1, 10.7750, 106.7000, 10.7800, 106.7100, 2.5, 50000, 'completed', NOW() - INTERVAL '3 days', 5),
(2, 2, 2, 10.8500, 106.7500, 10.8000, 106.7200, 6.0, 120000, 'completed', NOW() - INTERVAL '1 day', 4);

INSERT INTO grab_payments (ride_id, amount, status) VALUES
(1, 50000, 'success'),
(2, 120000, 'success');

-- =========================================================================
-- 4. CHAT APPLICATION 💬
-- =========================================================================
CREATE TABLE chat_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100), -- NULL nếu chat đôi
    is_group BOOLEAN DEFAULT FALSE
);

CREATE TABLE chat_conversation_members (
    conversation_id INT REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id INT REFERENCES chat_users(id),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES chat_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_read_receipts (
    conversation_id INT REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id INT REFERENCES chat_users(id),
    message_id INT REFERENCES chat_messages(id),
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

-- Seed Chat
INSERT INTO chat_users (id, name) VALUES (1, 'An'), (2, 'Bình'), (3, 'Cường');

-- Phòng chat 1: Chat đôi An & Bình
-- Phòng chat 2: Nhóm "Dự Án SQL" gồm cả 3 người
INSERT INTO chat_conversations (id, name, is_group) VALUES
(1, NULL, FALSE),
(2, 'Dự Án SQL', TRUE);

INSERT INTO chat_conversation_members (conversation_id, user_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2), (2, 3);

INSERT INTO chat_messages (id, conversation_id, sender_id, content, created_at) VALUES
(1, 1, 1, 'Chào Bình nhé!', NOW() - INTERVAL '10 mins'),
(2, 1, 2, 'Chào An, có chuyện gì thế?', NOW() - INTERVAL '9 mins'),
(3, 2, 3, 'Mọi người ơi, đã hoàn thành thiết kế DB chưa?', NOW() - INTERVAL '5 mins'),
(4, 2, 1, 'Mình vừa làm xong setup.sql rồi nhé!', NOW() - INTERVAL '2 mins');

-- Read Receipts:
-- An (1) đã đọc tin nhắn mới nhất trong nhóm 2 (tin số 4)
-- Bình (2) mới chỉ đọc đến tin số 3 (chưa đọc tin 4 của An -> unread = 1)
-- Cường (3) đã đọc tin số 3 của chính mình, chưa đọc tin số 4 -> unread = 1
INSERT INTO chat_read_receipts (conversation_id, user_id, message_id) VALUES
(1, 1, 2),
(1, 2, 2),
(2, 1, 4),
(2, 2, 3),
(2, 3, 3);

-- Đồng bộ sequence cho các bảng để tránh lỗi trùng ID khi chèn bản ghi mới
SELECT setval('eco_users_id_seq', (SELECT MAX(id) FROM eco_users));
SELECT setval('eco_products_id_seq', (SELECT MAX(id) FROM eco_products));
SELECT setval('eco_orders_id_seq', (SELECT MAX(id) FROM eco_orders));
SELECT setval('soc_users_id_seq', (SELECT MAX(id) FROM soc_users));
SELECT setval('soc_posts_id_seq', (SELECT MAX(id) FROM soc_posts));
SELECT setval('grab_customers_id_seq', (SELECT MAX(id) FROM grab_customers));
SELECT setval('grab_drivers_id_seq', (SELECT MAX(id) FROM grab_drivers));
SELECT setval('grab_rides_id_seq', (SELECT MAX(id) FROM grab_rides));
SELECT setval('chat_users_id_seq', (SELECT MAX(id) FROM chat_users));
SELECT setval('chat_conversations_id_seq', (SELECT MAX(id) FROM chat_conversations));
SELECT setval('chat_messages_id_seq', (SELECT MAX(id) FROM chat_messages));
