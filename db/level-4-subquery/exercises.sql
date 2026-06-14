-- @query: Bài 1 - User có lương cao hơn trung bình
-- (SELECT AVG(salary) FROM users): Là một Scalar Subquery (truy vấn con đơn trị). Nó tính ra mức lương trung bình của tất cả users và trả về 1 số duy nhất.
-- WHERE salary > ...: Lọc ra các user có mức lương lớn hơn con số trung bình vừa tính được.
SELECT id, name, salary
FROM users
WHERE salary > (SELECT AVG(salary) FROM users);

-- @query: Bài 2 - User có order
-- EXISTS: Toán tử kiểm tra sự tồn tại. Nó trả về TRUE nếu truy vấn con bên trong trả về ít nhất 1 dòng dữ liệu.
-- SELECT 1 FROM orders o WHERE o.user_id = u.id: Đây là một Correlated Subquery (truy vấn con tương quan), vì nó sử dụng giá trị `u.id` từ bảng ngoài. Lần lượt với mỗi user `u`, nó kiểm tra xem user đó có đơn hàng nào trong bảng `orders` hay không.
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.user_id = u.id
);

-- @query: Bài 3 - User chưa có order
-- NOT EXISTS: Trực tiếp ngược lại với EXISTS. Trả về TRUE nếu truy vấn con bên trong không trả về bất kỳ dòng dữ liệu nào.
-- Tức là tìm những khách hàng mà không có dòng đơn hàng nào tương quan với họ trong bảng orders.
SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.user_id = u.id
);

-- @query: Bài 4 - Sản phẩm đắt nhất
-- ALL: Toán tử so sánh với TẤT CẢ các kết quả từ truy vấn con.
-- price >= ALL (SELECT price FROM products): Lọc ra sản phẩm có giá lớn hơn hoặc bằng giá của mọi sản phẩm khác trong bảng. Nó tương đương với việc so sánh với giá trị lớn nhất.
SELECT id, name, price
FROM products
WHERE price >= ALL (SELECT price FROM products);

-- @query: Bài 5 - Order lớn hơn trung bình
-- (SELECT AVG(amount) FROM orders): Tính số tiền đơn hàng trung bình.
-- WHERE amount > ...: Lọc ra những đơn hàng có số tiền vượt quá mức trung bình đó.
SELECT id, user_id, amount, status
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);

-- @query: Bài 6 - User có order paid
-- IN: Kiểm tra xem giá trị có thuộc tập hợp kết quả của subquery hay không.
-- (SELECT DISTINCT user_id FROM orders WHERE status = 'paid'): Trả về một danh sách các user_id đã có đơn hàng thanh toán thành công.
SELECT id, name
FROM users
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM orders 
    WHERE status = 'paid'
);

-- @query: Bài 7 - Product chưa từng bán
-- NOT IN: Ngược lại với IN. Lọc ra các ID sản phẩm không nằm trong danh sách các ID sản phẩm đã từng được đặt mua.
-- (SELECT DISTINCT product_id FROM order_items): Trả về danh sách tất cả các mã sản phẩm đã bán.
SELECT id, name, price
FROM products
WHERE id NOT IN (
    SELECT DISTINCT product_id 
    FROM order_items
);

-- @query: Bài 8 - Employee lương cao nhất phòng ban
-- Đây là một Correlated Subquery (truy vấn con tương quan) điển hình.
-- WHERE e1.salary = (SELECT MAX(e2.salary) ...): Với mỗi nhân viên `e1`, hệ thống sẽ chạy truy vấn con bên trong để tìm mức lương cao nhất trong phòng ban của nhân viên đó (`e2.department_id = e1.department_id`). Nếu lương của `e1` bằng mức cao nhất đó, nhân viên đó được chọn.
SELECT e1.id, e1.name, e1.department_id, e1.salary
FROM employees e1
WHERE e1.salary = (
    SELECT MAX(e2.salary)
    FROM employees e2
    WHERE e2.department_id = e1.department_id
);

-- @query: Bài 9 - Top spender
-- Top spender là người dùng có tổng số tiền chi tiêu lớn nhất.
-- Bước 1: Tính tổng chi tiêu của từng người bằng Subquery gom nhóm trong mệnh đề FROM (gọi là Derived Table / Bảng phái sinh).
-- Bước 2: Sắp xếp giảm dần theo tổng chi tiêu và dùng LIMIT 1 để lấy người lớn nhất.
SELECT u.id, u.name, user_spending.total_spent
FROM users u
INNER JOIN (
    SELECT user_id, SUM(amount) AS total_spent
    FROM orders
    GROUP BY user_id
) AS user_spending ON u.id = user_spending.user_id
WHERE user_spending.total_spent = (
    SELECT MAX(sub_spending.total_spent)
    FROM (
        SELECT SUM(amount) AS total_spent
        FROM orders
        GROUP BY user_id
    ) AS sub_spending
);

-- @query: Bài 10 - User mua tất cả sản phẩm
-- Truy vấn con thứ nhất: Đếm số lượng sản phẩm độc nhất mà user `u` đã mua:
--   SELECT COUNT(DISTINCT oi.product_id) FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = u.id
-- Truy vấn con thứ hai: Đếm tổng số sản phẩm hiện có trong hệ thống:
--   SELECT COUNT(*) FROM products
-- Khi hai số lượng này bằng nhau, nghĩa là khách hàng đã mua toàn bộ các sản phẩm.
SELECT u.id, u.name
FROM users u
WHERE (
    SELECT COUNT(DISTINCT oi.product_id)
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = u.id
) = (
    SELECT COUNT(*) 
    FROM products
);
