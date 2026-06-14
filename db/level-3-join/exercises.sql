-- @query: Bài 1 - Hiển thị order kèm tên user
-- SELECT o.id, o.amount, u.name: Lấy ID đơn hàng, số tiền và tên khách hàng tương ứng.
-- FROM orders o: Bảng chính là orders (bí danh là o).
-- INNER JOIN users u ON o.user_id = u.id: Liên kết với bảng users (bí danh là u).
-- ON: Thiết lập điều kiện kết nối là trường 'user_id' ở bảng orders phải bằng với 'id' ở bảng users. Chỉ các dòng khớp mới được hiển thị.
SELECT o.id AS order_id, o.amount, o.status, u.name AS user_name
FROM orders o
INNER JOIN users u ON o.user_id = u.id;

-- @query: Bài 2 - Hiển thị user chưa có order
-- FROM users u: Bảng chính u chứa danh sách toàn bộ khách hàng.
-- LEFT JOIN orders o ON u.id = o.user_id: Giữ toàn bộ khách hàng ở bảng trái (users). Những khách hàng chưa mua hàng sẽ có thông tin order ở bảng phải là NULL.
-- WHERE o.id IS NULL: Điều kiện lọc ra những khách hàng có cột 'id' của đơn hàng bị trống (NULL). Điều này chỉ ra khách hàng đó chưa từng đặt hàng.
SELECT u.id AS user_id, u.name AS user_name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- @query: Bài 3 - Hiển thị order và product
-- Để hiển thị sản phẩm nào thuộc đơn hàng nào, ta cần kết hợp qua bảng trung gian 'order_items'.
-- INNER JOIN order_items oi ON o.id = oi.order_id: Nối đơn hàng với chi tiết đơn hàng.
-- INNER JOIN products p ON oi.product_id = p.id: Nối chi tiết đơn hàng với bảng sản phẩm để lấy thông tin chi tiết của sản phẩm (tên, giá).
SELECT o.id AS order_id, p.name AS product_name, oi.quantity, p.price
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;

-- @query: Bài 4 - Tính tổng tiền từng order
-- SELECT o.id, SUM(oi.quantity * p.price): Tính tổng số tiền bằng cách lấy số lượng nhân với đơn giá của từng sản phẩm trong đơn.
-- GROUP BY o.id: Gom nhóm theo từng ID đơn hàng để thực hiện tính tổng tiền riêng biệt cho mỗi đơn.
SELECT o.id AS order_id, SUM(oi.quantity * p.price) AS calculated_amount
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
GROUP BY o.id
ORDER BY o.id;

-- @query: Bài 5 - Hiển thị nhân viên và phòng ban
-- FROM employees e: Bảng nhân viên (bí danh e).
-- LEFT JOIN departments d ON e.department_id = d.id: Sử dụng LEFT JOIN để lấy tất cả nhân viên, kể cả người không thuộc phòng ban nào (như 'Giám Đốc Hùng' có department_id là NULL).
SELECT e.id AS employee_id, e.name AS employee_name, d.name AS department_name, e.salary
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

-- @query: Bài 6 - Tìm phòng ban chưa có nhân viên
-- FROM departments d: Bảng phòng ban ở bên trái (giữ lại tất cả phòng ban).
-- LEFT JOIN employees e ON d.id = e.department_id: Liên kết với bảng nhân viên.
-- WHERE e.id IS NULL: Lọc những phòng ban mà không tìm thấy nhân viên tương ứng (cột id nhân viên bằng NULL).
SELECT d.id AS department_id, d.name AS department_name
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
WHERE e.id IS NULL;

-- @query: Bài 7 - Tìm nhân viên không có manager
-- WHERE manager_id IS NULL: Chỉ lọc những nhân viên có trường manager_id bị rỗng (không có quản lý trực tiếp). Ở đây ta không cần JOIN nếu chỉ muốn tìm, nhưng bài toán cho thấy đây là cấp cao nhất.
SELECT id, name, salary
FROM employees
WHERE manager_id IS NULL;

-- @query: Bài 8 - Self join lấy tên manager
-- SELF JOIN: Kết nối một bảng với chính nó. Ta coi như có 2 bảng ảo: bảng nhân viên 'e' (employees) và bảng quản lý 'm' (managers).
-- INNER JOIN employees m ON e.manager_id = m.id: Tìm thông tin của người quản lý bằng cách nối manager_id của nhân viên 'e' với id của người quản lý 'm'.
SELECT e.id AS employee_id, e.name AS employee_name, m.name AS manager_name
FROM employees e
INNER JOIN employees m ON e.manager_id = m.id;

-- @query: Bài 9 - CROSS JOIN sinh tất cả cặp user-product
-- CROSS JOIN: Tạo tích Descartes. Kết hợp mỗi khách hàng từ bảng 'users' với tất cả các sản phẩm từ bảng 'products'. Không cần mệnh đề điều kiện ON.
SELECT u.name AS user_name, p.name AS product_name
FROM users u
CROSS JOIN products p;

-- @query: Bài 10 - Tìm top khách hàng chi tiêu nhiều nhất
-- INNER JOIN orders o: Kết nối người dùng với các đơn hàng của họ.
-- SUM(o.amount) AS total_spent: Tính tổng số tiền họ đã chi tiêu.
-- GROUP BY u.id, u.name: Nhóm theo mã và tên khách hàng.
-- ORDER BY total_spent DESC: Sắp xếp theo tổng chi tiêu giảm dần để tìm người tiêu nhiều nhất.
SELECT u.id AS user_id, u.name AS user_name, SUM(o.amount) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;

-- @query: Bài 11 - Tìm sản phẩm chưa từng bán
-- LEFT JOIN order_items oi: Kết nối tất cả sản phẩm với bảng chi tiết đơn hàng.
-- WHERE oi.product_id IS NULL: Lọc ra sản phẩm nào không xuất hiện trong bất kỳ chi tiết đơn hàng nào.
SELECT p.id AS product_id, p.name AS product_name, p.price
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.product_id IS NULL;

-- @query: Bài 12 - Lấy doanh thu từng sản phẩm
-- SUM(oi.quantity * p.price): Doanh thu của sản phẩm được tính bằng: Số lượng bán * Đơn giá.
-- GROUP BY p.id, p.name: Gom nhóm theo sản phẩm để tính doanh thu riêng biệt cho từng loại.
SELECT p.id AS product_id, p.name AS product_name, SUM(oi.quantity * p.price) AS revenue
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY revenue DESC;

-- @query: Bài 13 - Lấy số lượng bán từng sản phẩm
-- SUM(oi.quantity) AS total_sold: Tính tổng cột số lượng trong các đơn hàng đã đặt.
-- GROUP BY p.id, p.name: Gom nhóm theo từng sản phẩm.
SELECT p.id AS product_id, p.name AS product_name, SUM(oi.quantity) AS total_sold
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC;

-- @query: Bài 14 - Top 5 sản phẩm bán chạy
-- GROUP BY: Nhóm theo sản phẩm.
-- SUM(oi.quantity): Tính tổng số lượng bán được.
-- ORDER BY: Sắp xếp theo số lượng bán giảm dần.
-- LIMIT 5: Giới hạn lấy 5 sản phẩm bán chạy nhất.
SELECT p.id AS product_id, p.name AS product_name, SUM(oi.quantity) AS total_sold
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 5;

-- @query: Bài 15 - User mua nhiều loại sản phẩm nhất
-- COUNT(DISTINCT oi.product_id): Đếm số lượng loại sản phẩm khác nhau mà khách hàng đã mua (tránh đếm trùng nếu họ mua cùng 1 sản phẩm nhiều lần ở các đơn khác nhau).
-- GROUP BY u.id, u.name: Nhóm theo khách hàng.
-- ORDER BY unique_products_bought DESC: Sắp xếp theo số loại sản phẩm giảm dần.
-- LIMIT 1: Lấy người mua nhiều loại nhất.
SELECT u.id AS user_id, u.name AS user_name, COUNT(DISTINCT oi.product_id) AS unique_products_bought
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
GROUP BY u.id, u.name
ORDER BY unique_products_bought DESC
LIMIT 1;
