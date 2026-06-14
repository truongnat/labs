-- @query: Bài 1 - Viết lại query dùng subquery thành CTE
-- WITH avg_salary AS (...): Định nghĩa một CTE tên là `avg_salary` chứa lương trung bình.
-- CTE này đóng vai trò như một bảng tạm thời có sẵn cho truy vấn chính bên dưới sử dụng.
WITH avg_salary AS (
    SELECT AVG(salary) AS avg_val
    FROM users
)
SELECT u.id, u.name, u.salary
FROM users u, avg_salary
WHERE u.salary > avg_salary.avg_val;

-- @query: Bài 2 - Top customer bằng CTE
-- WITH customer_spending AS (...): Tính tổng chi tiêu của mỗi khách hàng trước.
-- Sau đó, truy vấn chính thực hiện liên kết (JOIN) bảng tạm này với bảng users, sắp xếp giảm dần và lấy người chi nhiều nhất.
WITH customer_spending AS (
    SELECT user_id, SUM(amount) AS total_spent
    FROM orders
    GROUP BY user_id
)
SELECT u.id, u.name, cs.total_spent
FROM users u
INNER JOIN customer_spending cs ON u.id = cs.user_id
ORDER BY cs.total_spent DESC
LIMIT 1;

-- @query: Bài 3 - Tổng doanh thu theo tháng
-- DATE_TRUNC('month', created_at): Làm tròn ngày về ngày đầu tiên của tháng (ví dụ: 2026-01-10 -> 2026-01-01).
-- Sau khi làm tròn, ta thực hiện tính tổng doanh thu theo từng tháng trong CTE, rồi in ra kết quả sắp xếp theo thứ tự thời gian.
WITH monthly_revenue AS (
    SELECT DATE_TRUNC('month', created_at)::date AS order_month, SUM(amount) AS revenue
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT order_month, revenue
FROM monthly_revenue
ORDER BY order_month;

-- @query: Bài 4 - Tính running total
-- Running Total: Tổng doanh thu tích lũy cộng dồn theo thời gian.
-- SUM(amount) OVER (ORDER BY created_at, id): Sử dụng Window Function trong CTE để cộng dồn tiền đơn hàng theo trình tự thời gian.
WITH ordered_sales AS (
    SELECT id AS order_id, created_at, amount,
           SUM(amount) OVER (ORDER BY created_at, id) AS running_total
    FROM orders
)
SELECT order_id, created_at, amount, running_total
FROM ordered_sales
ORDER BY created_at, order_id;

-- @query: Bài 5 - Tính cohort analysis
-- Cohort Analysis: Phân tích nhóm thuần tập.
-- CTE 1 (user_cohort): Tìm tháng đầu tiên phát sinh đơn hàng của mỗi khách hàng (được coi là tháng đăng ký/tháng gốc).
-- CTE 2 (cohort_revenue): Nối đơn hàng với tháng gốc của user, tính tổng doanh thu mà cohort đó tạo ra ở từng tháng tiếp theo.
WITH user_cohort AS (
    SELECT user_id, DATE_TRUNC('month', MIN(created_at))::date AS cohort_month
    FROM orders
    GROUP BY user_id
),
cohort_revenue AS (
    SELECT uc.cohort_month,
           DATE_TRUNC('month', o.created_at)::date AS spending_month,
           SUM(o.amount) AS total_amount
    FROM orders o
    JOIN user_cohort uc ON o.user_id = uc.user_id
    GROUP BY uc.cohort_month, DATE_TRUNC('month', o.created_at)
)
SELECT cohort_month, spending_month, total_amount
FROM cohort_revenue
ORDER BY cohort_month, spending_month;

-- @query: Bài 6 - Recursive lấy cây nhân viên
-- WITH RECURSIVE employee_path AS (...): Thiết lập đệ quy cây nhân sự.
-- Anchor Member (Query Neo): Chọn nhân viên cấp cao nhất (manager_id IS NULL) - ở đây là CEO Hùng, khởi tạo level = 1.
-- Recursive Member (Query Đệ Quy): INNER JOIN bảng nhân viên `employees e` với bảng đệ quy `employee_path ep` dựa trên điều kiện `e.manager_id = ep.id`.
-- Nó sẽ đi dần từ cấp trên xuống cấp dưới, đồng thời xây dựng đường dẫn phân cấp `path`.
WITH RECURSIVE employee_path AS (
    SELECT id, name, manager_id, 1 AS level, name::text AS path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, ep.level + 1, (ep.path || ' -> ' || e.name)::text
    FROM employees e
    INNER JOIN employee_path ep ON e.manager_id = ep.id
)
SELECT id, name, level, path
FROM employee_path
ORDER BY path;

-- @query: Bài 7 - Tìm tất cả cấp dưới của manager
-- Bài toán: Tìm toàn bộ cấp dưới (trực tiếp & gián tiếp) của Sơn (Tech Lead, id = 2).
-- Anchor Member: Bắt đầu từ Sơn.
-- Recursive Member: Tìm những nhân viên có manager_id bằng với id của những người đã nằm trong bảng tạm đệ quy.
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id, 0 AS depth
    FROM employees
    WHERE id = 2
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, s.depth + 1
    FROM employees e
    INNER JOIN subordinates s ON e.manager_id = s.id
)
SELECT id, name, manager_id, depth
FROM subordinates
WHERE id != 2; -- Loại bỏ chính Sơn (Tech Lead) ra khỏi danh sách kết quả cấp dưới

-- @query: Bài 8 - Category tree
-- Tìm đường dẫn đầy đủ của cây danh mục từ gốc đến con cháu.
-- Anchor Member: Lấy các danh mục gốc không có cha (parent_id IS NULL).
-- Recursive Member: Kết nối danh mục con với cha của chúng để cộng dồn tên đường dẫn danh mục.
WITH RECURSIVE category_hierarchy AS (
    SELECT id, name, parent_id, name::text AS path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.id, c.name, c.parent_id, (ch.path || ' > ' || c.name)::text
    FROM categories c
    INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
)
SELECT id, name, path
FROM category_hierarchy
ORDER BY path;

-- @query: Bài 9 - Sinh dãy số 1–100
-- WITH RECURSIVE numbers AS (...): Tự sinh số liên tiếp.
-- Anchor Member: SELECT 1 làm số khởi đầu.
-- Recursive Member: Cộng 1 vào số trước đó (`n + 1`) với điều kiện dừng là `n < 100`.
-- Để kết quả in ra không quá dài trên terminal, ta dùng LIMIT 10 trong truy vấn chính.
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM numbers
    WHERE n < 100
)
SELECT n
FROM numbers
LIMIT 10;

-- @query: Bài 10 - Sinh lịch ngày trong tháng
-- Sinh toàn bộ các ngày trong tháng 1/2026.
-- Anchor Member: Lấy ngày bắt đầu là '2026-01-01'.
-- Recursive Member: Cộng thêm 1 ngày (`date + INTERVAL '1 day'`) vào ngày trước đó.
-- Điều kiện dừng: Khi ngày nhỏ hơn '2026-01-31'.
WITH RECURSIVE calendar AS (
    SELECT '2026-01-01'::date AS date
    
    UNION ALL
    
    SELECT (date + INTERVAL '1 day')::date
    FROM calendar
    WHERE date < '2026-01-31'::date
)
SELECT date
FROM calendar;
