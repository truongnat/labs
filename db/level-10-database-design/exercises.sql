-- =========================================================================
-- PHẦN 1: THƯƠNG MẠI ĐIỆN TỬ (ECOMMERCE) 🛒
-- =========================================================================

-- @query: Bài 1 (Ecommerce) - Đặt hàng và cập nhật tồn kho
-- Sử dụng Transaction đảm bảo tính nguyên tử (Atomicity).
-- 1. Chèn đơn hàng mới cho user An (id=1) mua Cáp sạc (id=3, giá 15).
-- 2. Giảm số lượng tồn kho của Cáp sạc đi 1 sản phẩm.
BEGIN;
INSERT INTO eco_orders (user_id, voucher_code, raw_amount, final_amount, status)
VALUES (1, NULL, 15, 15, 'paid');
UPDATE eco_products 
SET stock = stock - 1 
WHERE id = 3;
COMMIT;

-- @query: Bài 2 (Ecommerce) - Xử lý hoàn tiền đơn hàng
-- 1. Cập nhật trạng thái đơn hàng số 2 thành 'refunded'.
-- 2. Hoàn lại số lượng sản phẩm trong đơn hàng về kho (ở đây đơn 2 mua 1 Ốp Silicon id=2).
BEGIN;
UPDATE eco_orders SET status = 'refunded' WHERE id = 2;
UPDATE eco_products SET stock = stock + 1 WHERE id = 2;
COMMIT;

-- @query: Bài 3 (Ecommerce) - Kiểm tra và áp dụng Voucher giảm giá
-- SELECT: Lấy tên sản phẩm, đơn giá và tính giá sau khi áp dụng voucher.
-- WHERE: Áp dụng điều kiện voucher 'GIAM100' có hạn dùng hợp lệ (hôm nay hoặc tương lai) và giá trị giỏ hàng đạt mức chi tối thiểu (min_spend = 500).
SELECT p.name AS product, p.price, v.code AS voucher, v.discount_amount,
       (p.price - v.discount_amount) AS discounted_price
FROM eco_products p
CROSS JOIN eco_vouchers v
WHERE v.code = 'GIAM100' 
  AND p.price >= v.min_spend 
  AND v.expiry_date >= '2026-06-15';

-- @query: Bài 4 (Ecommerce) - Tìm sản phẩm sắp hết hàng (stock < 5)
-- Lọc ra các sản phẩm trong kho có số lượng tồn kho (stock) nhỏ hơn 5 để cảnh báo nhập hàng.
SELECT id, name, price, stock
FROM eco_products
WHERE stock < 5;

-- @query: Bài 5 (Ecommerce) - Tính tổng doanh thu thực tế thu được
-- SUM(final_amount): Tính tổng doanh thu thực tế thu được (giá sau khi áp dụng voucher) của các đơn hàng đã thanh toán thành công ('paid').
SELECT SUM(final_amount) AS net_revenue
FROM eco_orders
WHERE status = 'paid';

-- =========================================================================
-- PHẦN 2: MẠNG XÃ HỘI (SOCIAL NETWORK) 📱
-- =========================================================================

-- @query: Bài 6 (Social Network) - News Feed của người dùng
-- Lấy tin tức: Bài viết của những người mà An (id=1) đang follow.
-- JOIN soc_follows f: Liên kết với bảng follow để lọc ra các bài viết của người được follow (f.followee_id = p.user_id).
-- ORDER BY p.created_at DESC: Sắp xếp theo thời gian mới nhất lên đầu.
SELECT p.id AS post_id, u.name AS author, p.content, p.created_at
FROM soc_posts p
INNER JOIN soc_users u ON p.user_id = u.id
INNER JOIN soc_follows f ON p.user_id = f.followee_id
WHERE f.follower_id = 1
ORDER BY p.created_at DESC;

-- @query: Bài 7 (Social Network) - Tìm người dùng chung được follow (Mutual Friends)
-- Tìm những người dùng mà cả An (follower_id = 1) và Bình (follower_id = 2) cùng follow.
-- INNER JOIN soc_follows f1 và f2 nối chéo nhau trên cùng một id người được follow (followee_id).
SELECT u.id AS user_id, u.name AS user_name
FROM soc_users u
INNER JOIN soc_follows f1 ON u.id = f1.followee_id AND f1.follower_id = 1
INNER JOIN soc_follows f2 ON u.id = f2.followee_id AND f2.follower_id = 2;

-- @query: Bài 8 (Social Network) - Bài viết xu hướng (Trending Posts) trong 24 giờ qua
-- Điểm tương tác = (Tổng số Like) + (Tổng số Comment).
-- Sắp xếp giảm dần theo điểm tương tác để lấy bài viết hot nhất trong 24 giờ qua.
SELECT p.id AS post_id, p.content,
       (SELECT COUNT(*) FROM soc_likes l WHERE l.post_id = p.id) AS likes_count,
       (SELECT COUNT(*) FROM soc_comments c WHERE c.post_id = p.id) AS comments_count,
       (
           (SELECT COUNT(*) FROM soc_likes l WHERE l.post_id = p.id) + 
           (SELECT COUNT(*) FROM soc_comments c WHERE c.post_id = p.id)
       ) AS interaction_score
FROM soc_posts p
WHERE p.created_at >= '2026-06-14 00:00:00'
ORDER BY interaction_score DESC;

-- @query: Bài 9 (Social Network) - Kiểm tra quan hệ follow chéo giữa 2 user
-- EXISTS: Kiểm tra xem An (1) có follow Bình (2) không, và ngược lại.
SELECT u1.name AS user_a, u2.name AS user_b,
       EXISTS(SELECT 1 FROM soc_follows WHERE follower_id = 1 AND followee_id = 2) AS a_follows_b,
       EXISTS(SELECT 1 FROM soc_follows WHERE follower_id = 2 AND followee_id = 1) AS b_follows_a
FROM soc_users u1, soc_users u2
WHERE u1.id = 1 AND u2.id = 2;

-- @query: Bài 10 (Social Network) - Thống kê tương tác các bài viết của An (user 1)
-- LEFT JOIN soc_likes & soc_comments: Kết nối bài viết của An để tính tổng số lượt like và bình luận của mỗi bài.
-- COUNT(DISTINCT l.user_id): Tránh đếm trùng số lượt like.
SELECT p.id AS post_id, p.content, 
       COUNT(DISTINCT l.user_id) AS total_likes, 
       COUNT(DISTINCT c.id) AS total_comments
FROM soc_posts p
LEFT JOIN soc_likes l ON p.id = l.post_id
LEFT JOIN soc_comments c ON p.id = c.post_id
WHERE p.user_id = 1
GROUP BY p.id, p.content;

-- =========================================================================
-- PHẦN 3: GỌI XE CÔNG NGHỆ (GRAB) 🚕
-- =========================================================================

-- @query: Bài 11 (Grab) - Tìm tài xế rảnh rỗi gần nhất
-- Tọa độ Khách An đặt xe: (10.7750, 106.7000).
-- SQRT(POW(lat - 10.7750, 2) + POW(lng - 106.7000, 2)): Công thức tính khoảng cách hình học Euclide.
-- WHERE is_available = TRUE: Chỉ tìm tài xế đang rảnh rỗi sẵn sàng nhận khách.
-- Sắp xếp khoảng cách tăng dần để lấy tài xế ở gần khách hàng nhất.
SELECT id, name, lat, lng,
       (SQRT(POW(lat - 10.7750, 2) + POW(lng - 106.7000, 2)))::numeric(10,4) AS distance_degrees
FROM grab_drivers
WHERE is_available = TRUE
ORDER BY distance_degrees ASC
LIMIT 1;

-- @query: Bài 12 (Grab) - Surge Pricing (Giá cước động)
-- Surge Pricing: Tự động tăng giá cước lên gấp 1.5 lần nếu số lượng tài xế rảnh rỗi trong hệ thống < 3.
-- CTE active_drivers: Đếm số lượng tài xế khả dụng.
-- CASE WHEN: Nếu tài xế rảnh < 3, nhân giá trị cước cơ bản (50000) với 1.5.
WITH active_drivers AS (
    SELECT COUNT(*) AS count FROM grab_drivers WHERE is_available = TRUE
)
SELECT 'Ride Fare' AS service, 50000 AS base_fare,
       CASE 
           WHEN ad.count < 3 THEN 50000 * 1.5 
           ELSE 50000 
       END AS surge_fare
FROM active_drivers ad;

-- @query: Bài 13 (Grab) - Lịch sử chuyến đi của khách hàng An (id=1)
-- Nối bảng grab_rides và grab_drivers để hiển thị lịch sử các chuyến đi của khách An kèm tên tài xế phục vụ.
SELECT r.id AS ride_id, d.name AS driver_name, r.distance_km, r.fare, r.status, r.created_at
FROM grab_rides r
INNER JOIN grab_drivers d ON r.driver_id = d.id
WHERE r.customer_id = 1;

-- @query: Bài 14 (Grab) - Tổng doanh thu và số km di chuyển của tài xế Sơn (id=1)
-- Tính tổng tiền cước chuyến đi thành công và tổng số km mà tài xế đã đi.
SELECT driver_id, 
       SUM(fare) AS total_revenue, 
       SUM(distance_km)::numeric(10,2) AS total_km_driven
FROM grab_rides
WHERE driver_id = 1 
  AND status = 'completed'
GROUP BY driver_id;

-- @query: Bài 15 (Grab) - Đánh giá sao trung bình (Rating) của tài xế Sơn (id=1)
-- AVG(rating): Tính điểm đánh giá trung bình từ phía khách hàng dành cho tài xế.
SELECT driver_id, 
       AVG(rating)::numeric(3,2) AS average_rating
FROM grab_rides
WHERE driver_id = 1 
  AND rating IS NOT NULL
GROUP BY driver_id;

-- =========================================================================
-- PHẦN 4: ỨNG DỤNG TRÒ CHUYỆN (CHAT APP) 💬
-- =========================================================================

-- @query: Bài 16 (Chat App) - Đếm số lượng tin nhắn chưa đọc của user Bình (id=2)
-- LEFT JOIN chat_read_receipts r: Tìm tin nhắn mới nhất đã đọc của Bình trong từng phòng chat.
-- WHERE m.id > COALESCE(r.message_id, 0): Tin nhắn có ID lớn hơn tin đã đọc gần nhất là tin nhắn chưa đọc.
-- m.sender_id != 2: Không tính tin nhắn do chính Bình tự gửi.
SELECT m.conversation_id, COUNT(m.id) AS unread_count
FROM chat_messages m
LEFT JOIN chat_read_receipts r ON m.conversation_id = r.conversation_id AND r.user_id = 2
WHERE m.id > COALESCE(r.message_id, 0)
  AND m.sender_id != 2
GROUP BY m.conversation_id;

-- @query: Bài 17 (Chat App) - Lấy tin nhắn cuối cùng (Last Message) của mỗi cuộc trò chuyện của Bình (id=2)
-- CTE ranked_messages: Sử dụng Window Function ROW_NUMBER() đánh số tin nhắn trong từng hội thoại theo thời gian giảm dần.
-- SELECT: Lọc ra tin nhắn mới nhất (rn = 1) trong các hội thoại mà Bình là thành viên tham gia.
WITH ranked_messages AS (
    SELECT conversation_id, sender_id, content, created_at,
           ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) AS rn
    FROM chat_messages
)
SELECT rm.conversation_id, rm.sender_id, rm.content, rm.created_at
FROM ranked_messages rm
INNER JOIN chat_conversation_members ccm ON rm.conversation_id = ccm.conversation_id
WHERE ccm.user_id = 2 
  AND rm.rn = 1;

-- @query: Bài 18 (Chat App) - Lấy danh sách thành viên của hội thoại nhóm (conversation_id = 2)
-- JOIN chat_conversation_members và chat_users để lấy tên của toàn bộ thành viên trong nhóm "Dự Án SQL".
SELECT c.name AS conversation_name, u.name AS member_name
FROM chat_conversation_members ccm
INNER JOIN chat_conversations c ON ccm.conversation_id = c.id
INNER JOIN chat_users u ON ccm.user_id = u.id
WHERE ccm.conversation_id = 2;

-- @query: Bài 19 (Chat App) - Cập nhật trạng thái đã đọc của Bình (user 2) trong nhóm 2 (tin số 4)
-- ON CONFLICT: Nếu Bình đã có dòng biên nhận cho phòng chat này, cập nhật message_id mới và thời gian đọc, tránh lỗi trùng lặp khóa chính.
INSERT INTO chat_read_receipts (conversation_id, user_id, message_id, read_at)
VALUES (2, 2, 4, NOW())
ON CONFLICT (conversation_id, user_id)
DO UPDATE SET message_id = EXCLUDED.message_id, read_at = EXCLUDED.read_at;

-- @query: Bài 20 (Chat App) - Thống kê số tin nhắn gửi đi theo ngày của An (user 1)
-- Thống kê tần suất hoạt động gửi tin nhắn của An theo ngày để phân tích tần suất tương tác.
SELECT DATE_TRUNC('day', created_at)::date AS date, 
       COUNT(id) AS sent_messages
FROM chat_messages
WHERE sender_id = 1
GROUP BY DATE_TRUNC('day', created_at);
