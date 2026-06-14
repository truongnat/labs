-- @query: Bài 1 - Đếm tổng số order
-- COUNT(id): Hàm dùng để đếm số lượng dòng có giá trị 'id' hợp lệ (không null).
-- AS total_orders: Đặt bí danh (alias) cho cột hiển thị kết quả là 'total_orders'.
SELECT COUNT(id) AS total_orders
FROM orders;

-- @query: Bài 2 - Tổng doanh thu
-- SUM(amount): Hàm tính tổng cộng tất cả các giá trị của cột 'amount' trong toàn bộ bảng.
SELECT SUM(amount) AS total_revenue
FROM orders;

-- @query: Bài 3 - Doanh thu trung bình
-- AVG(amount): Hàm tính giá trị trung bình cộng của toàn bộ mức tiền đơn hàng (amount).
SELECT AVG(amount) AS average_amount
FROM orders;

-- @query: Bài 4 - Order lớn nhất
-- MAX(amount): Hàm tìm và lấy ra giá trị lớn nhất trong cột 'amount'.
-- MIN(amount) tương tự sẽ lấy giá trị nhỏ nhất.
SELECT MAX(amount) AS max_amount
FROM orders;

-- @query: Bài 5 - Tổng tiền mỗi user
-- SELECT user_id, SUM(amount): Chọn ra mã người dùng và tổng số tiền tương ứng của người dùng đó.
-- GROUP BY user_id: Phân nhóm các dòng dữ liệu theo cột 'user_id'. Mọi dòng có cùng 'user_id' sẽ được gom thành một nhóm để thực hiện hàm SUM().
SELECT user_id, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id;

-- @query: Bài 6 - User nào có tổng tiền > 500
-- GROUP BY user_id: Gom nhóm các đơn hàng theo người dùng.
-- HAVING SUM(amount) > 500: Lọc nhóm. Điều kiện lọc này chỉ được áp dụng lên các nhóm đã gom (tổng tiền của nhóm lớn hơn 500). Mệnh đề WHERE không làm được điều này vì nó chạy trước khi nhóm.
SELECT user_id, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 500;

-- @query: Bài 7 - Đếm số order theo status
-- GROUP BY status: Gom các đơn hàng theo trạng thái (paid, pending, cancelled).
-- COUNT(id): Đếm số lượng đơn hàng nằm trong mỗi nhóm trạng thái đó.
SELECT status, COUNT(id) AS order_count
FROM orders
GROUP BY status;

-- @query: Bài 8 - Status nào có nhiều order nhất
-- GROUP BY status: Gom nhóm theo trạng thái.
-- COUNT(id) AS order_count: Đếm số đơn hàng mỗi trạng thái.
-- ORDER BY order_count DESC: Sắp xếp các nhóm theo số lượng đơn hàng giảm dần.
-- LIMIT 1: Chỉ lấy nhóm đứng đầu (có số lượng đơn hàng nhiều nhất).
SELECT status, COUNT(id) AS order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC
LIMIT 1;

-- @query: Bài 9 - Tổng doanh thu của order paid
-- WHERE status = 'paid': Bộ lọc WHERE được áp dụng đầu tiên để chỉ lấy ra các dòng đơn hàng đã thanh toán (paid) trước khi thực hiện tính tổng.
-- SUM(amount): Tính tổng số tiền trên tập dữ liệu đã lọc.
SELECT SUM(amount) AS paid_revenue
FROM orders
WHERE status = 'paid';

-- @query: Bài 10 - User có nhiều order nhất
-- GROUP BY user_id: Gom nhóm các đơn hàng theo từng user.
-- COUNT(id) AS order_count: Đếm số đơn hàng của từng user.
-- ORDER BY order_count DESC: Sắp xếp theo số đơn hàng giảm dần.
-- LIMIT 1: Chọn user có số đơn hàng lớn nhất ở trên cùng.
SELECT user_id, COUNT(id) AS order_count
FROM orders
GROUP BY user_id
ORDER BY order_count DESC
LIMIT 1;
