-- @query: Bài 1 - Đánh số thứ tự nhân viên
-- ROW_NUMBER() OVER (ORDER BY id): Đánh số thứ tự tự tăng từ 1 dựa theo trình tự tăng dần của id nhân viên.
SELECT ROW_NUMBER() OVER (ORDER BY id) AS no, id, name, salary
FROM employees;

-- @query: Bài 2 - Xếp hạng lương
-- DENSE_RANK() OVER (ORDER BY salary DESC): Xếp hạng lương giảm dần. Nếu có cùng mức lương, họ sẽ nhận chung một thứ hạng và thứ hạng kế tiếp sẽ tăng liền kề (không nhảy số thứ hạng).
SELECT name, salary,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
FROM employees;

-- @query: Bài 3 - Xếp hạng trong từng phòng ban
-- PARTITION BY department_id: Chia các nhân viên thành các phòng ban độc lập.
-- DENSE_RANK() OVER (...): Thực hiện xếp hạng lương giảm dần riêng cho từng phòng ban.
SELECT name, department_id, salary,
       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_salary_rank
FROM employees;

-- @query: Bài 4 - Top 3 nhân viên mỗi phòng ban
-- Dùng CTE để tính thứ hạng nhân viên theo phòng ban.
-- Truy vấn chính lọc các bản ghi có thứ hạng (dept_salary_rank) <= 3.
WITH ranked_employees AS (
    SELECT name, department_id, salary,
           DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_salary_rank
    FROM employees
)
SELECT department_id, name, salary, dept_salary_rank
FROM ranked_employees
WHERE dept_salary_rank <= 3;

-- @query: Bài 5 - Running total doanh thu
-- SUM(amount) OVER (ORDER BY created_at, id): Cộng dồn doanh thu lũy kế theo thứ tự thời gian đặt hàng.
SELECT id AS order_id, created_at, amount,
       SUM(amount) OVER (ORDER BY created_at, id) AS running_total
FROM orders;

-- @query: Bài 6 - Moving average 7 ngày
-- AVG(amount) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW):
-- Tính toán doanh thu trung bình trượt của 7 ngày (bao gồm ngày hiện tại và 6 ngày trước đó).
SELECT created_at, amount,
       AVG(amount) OVER (
           ORDER BY created_at
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       )::numeric(10,2) AS moving_avg_7d
FROM orders;

-- @query: Bài 7 - So sánh doanh thu hôm nay với hôm qua
-- CTE daily_sales: Tính tổng doanh thu theo từng ngày.
-- LAG(sales) OVER (ORDER BY created_at): Lấy doanh thu của ngày đứng trước đó để so sánh.
WITH daily_sales AS (
    SELECT created_at, SUM(amount) AS sales
    FROM orders
    GROUP BY created_at
)
SELECT created_at, sales,
       LAG(sales) OVER (ORDER BY created_at) AS yesterday_sales
FROM daily_sales
ORDER BY created_at;

-- @query: Bài 8 - Tính tăng trưởng
-- CTE daily_sales: Doanh thu mỗi ngày.
-- LAG(sales): Lấy doanh thu ngày hôm trước.
-- Tính phần trăm tăng trưởng: ((sales - yesterday) / yesterday) * 100.
WITH daily_sales AS (
    SELECT created_at, SUM(amount) AS sales
    FROM orders
    GROUP BY created_at
),
sales_compare AS (
    SELECT created_at, sales,
           LAG(sales) OVER (ORDER BY created_at) AS yesterday_sales
    FROM daily_sales
)
SELECT created_at, sales, yesterday_sales,
       COALESCE(
           ((sales - yesterday_sales)::numeric / yesterday_sales * 100)::numeric(10,2),
           0.00
       ) AS growth_percentage
FROM sales_compare;

-- @query: Bài 9 - Lấy order gần nhất của mỗi user
-- ROW_NUMBER() PARTITION BY user_id ORDER BY created_at DESC: Đánh số thứ tự đơn hàng của từng user theo thời gian giảm dần (đơn mới nhất nhận số 1).
WITH ranked_orders AS (
    SELECT id AS order_id, user_id, amount, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
    FROM orders
)
SELECT user_id, order_id, amount, created_at
FROM ranked_orders
WHERE rn = 1;

-- @query: Bài 10 - Order đầu tiên của user
-- Tương tự Bài 9 nhưng sắp xếp tăng dần (`ORDER BY created_at ASC`) để đơn hàng đầu tiên nhận số thứ tự là 1.
WITH ranked_orders AS (
    SELECT id AS order_id, user_id, amount, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn
    FROM orders
)
SELECT user_id, order_id, amount, created_at
FROM ranked_orders
WHERE rn = 1;

-- @query: Bài 11 - Tính retention
-- Tỷ lệ giữ chân khách hàng: Đếm số user mua hàng tháng 5/2026 và quay lại mua hàng vào tháng 6/2026.
WITH active_may AS (
    SELECT DISTINCT user_id FROM orders WHERE DATE_TRUNC('month', created_at) = '2026-05-01'
),
active_june AS (
    SELECT DISTINCT user_id FROM orders WHERE DATE_TRUNC('month', created_at) = '2026-06-01'
)
SELECT COUNT(am.user_id) AS total_may_users,
       COUNT(aj.user_id) AS retained_in_june,
       (COUNT(aj.user_id)::numeric / COUNT(am.user_id) * 100)::numeric(10,2) AS retention_rate
FROM active_may am
LEFT JOIN active_june aj ON am.user_id = aj.user_id;

-- @query: Bài 12 - Cohort analysis
-- Tìm tháng đầu tiên hoạt động của user (cohort_month).
-- Sau đó đếm số lượng khách hàng hoạt động (active_users) trong các tháng tiếp theo (activity_month).
WITH user_first_month AS (
    SELECT user_id, MIN(DATE_TRUNC('month', created_at))::date AS cohort_month
    FROM orders
    GROUP BY user_id
)
SELECT ufm.cohort_month,
       DATE_TRUNC('month', o.created_at)::date AS activity_month,
       COUNT(DISTINCT o.user_id) AS active_users
FROM orders o
JOIN user_first_month ufm ON o.user_id = ufm.user_id
GROUP BY ufm.cohort_month, DATE_TRUNC('month', o.created_at)
ORDER BY ufm.cohort_month, activity_month;

-- @query: Bài 13 - Tính DAU/WAU/MAU
-- DAU: Số user hoạt động theo ngày.
-- rolling_7d_users: Số lượng user hoạt động cộng dồn trong 7 ngày qua (giả lập WAU trên dữ liệu ngày).
SELECT created_at AS date,
       COUNT(DISTINCT user_id) AS dau,
       SUM(COUNT(DISTINCT user_id)) OVER (ORDER BY created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7d_volume
FROM orders
GROUP BY created_at
ORDER BY created_at;

-- @query: Bài 14 - Sessionization
-- Gom cụm các hoạt động của user thành các phiên làm việc (Session) nếu cách nhau dưới 30 phút.
-- Bước 1 (activity_gaps): Lấy thời gian hoạt động trước đó bằng LAG.
-- Bước 2 (session_starts): Đánh dấu 1 (bắt đầu phiên mới) nếu thời gian cách nhau > 30 phút hoặc là hoạt động đầu tiên.
-- Bước 3 (session_ids): Tính tổng tích lũy (Running SUM) của cờ báo hiệu phiên mới để tạo ID phiên (session_id).
WITH activity_gaps AS (
    SELECT user_id, activity_time,
           LAG(activity_time) OVER (PARTITION BY user_id ORDER BY activity_time) AS prev_time
    FROM user_activities
),
session_starts AS (
    SELECT user_id, activity_time,
           CASE WHEN prev_time IS NULL OR activity_time - prev_time > INTERVAL '30 minutes' THEN 1 ELSE 0 END AS is_new_session
    FROM activity_gaps
),
session_ids AS (
    SELECT user_id, activity_time,
           SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY activity_time) AS session_id
    FROM session_starts
)
SELECT user_id, activity_time, session_id
FROM session_ids
ORDER BY user_id, activity_time;

-- @query: Bài 15 - Phát hiện duplicate
-- Lọc các đơn hàng bị trùng lặp của cùng một khách hàng trong cùng một ngày.
-- ROW_NUMBER() PARTITION BY user_id, created_at: Bản ghi trùng thứ 2 trở lên sẽ có rn > 1.
WITH ranked_orders AS (
    SELECT id, user_id, amount, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id, created_at ORDER BY id) AS rn
    FROM orders
)
SELECT id, user_id, amount, created_at
FROM ranked_orders
WHERE rn > 1;

-- @query: Bài 16 - Phát hiện gap sequence
-- LEAD(id): Lấy ID của dòng tiếp theo.
-- WHERE next_id - id > 1: Phát hiện khoảng hở giữa 2 ID liên tiếp (bị mất dữ liệu/mất vé số).
WITH next_tickets AS (
    SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id
    FROM ticket_sequences
)
SELECT id AS gap_start_after, next_id AS gap_end_before, (next_id - id - 1) AS missing_count
FROM next_tickets
WHERE next_id - id > 1;

-- @query: Bài 17 - Tính streak đăng nhập liên tiếp
-- Gaps and Islands:
-- ROW_NUMBER(): Đánh số thứ tự đăng nhập của user.
-- grp = login_date - row_number ngày: Nếu đăng nhập liên tục, hiệu số này sẽ giống nhau.
-- Gom nhóm theo grp để tính độ dài chuỗi liên tục (streak).
WITH ranked_logins AS (
    SELECT user_id, login_date,
           login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL '1 day') AS grp
    FROM user_logins
),
streaks AS (
    SELECT user_id, MIN(login_date) AS streak_start, MAX(login_date) AS streak_end, COUNT(*) AS streak_length
    FROM ranked_logins
    GROUP BY user_id, grp
)
SELECT user_id, streak_start, streak_end, streak_length
FROM streaks
ORDER BY user_id, streak_length DESC;

-- @query: Bài 18 - Tính rolling 30 days
-- RANGE BETWEEN INTERVAL '30 days' PRECEDING AND CURRENT ROW:
-- Tính tổng doanh thu cộng dồn trong phạm vi thời gian 30 ngày trước ngày hiện tại.
SELECT created_at, amount,
       SUM(amount) OVER (
           ORDER BY created_at
           RANGE BETWEEN INTERVAL '30 days' PRECEDING AND CURRENT ROW
       ) AS rolling_30d_revenue
FROM orders
ORDER BY created_at;

-- @query: Bài 19 - Phân nhóm percentile
-- NTILE(4): Phân bổ các dòng đều vào 4 nhóm dựa theo thứ tự lương giảm dần (nhóm 1: top 25%, nhóm 4: 25% thấp nhất).
SELECT name, salary,
       NTILE(4) OVER (ORDER BY salary DESC) AS salary_quartile
FROM employees;

-- @query: Bài 20 - ABC analysis
-- Phân loại ABC khách hàng/đơn hàng:
-- Tính phần trăm lũy kế đóng góp doanh thu của từng đơn hàng từ lớn đến bé.
-- Hạng A: Đóng góp lũy kế đến 80% doanh thu.
-- Hạng B: Đóng góp lũy kế từ 80% - 95% doanh thu.
-- Hạng C: Các đơn đóng góp 5% doanh thu cuối cùng (>95%).
WITH total_sales AS (
    SELECT SUM(amount) AS grand_total FROM orders
),
order_shares AS (
    SELECT id, amount,
           SUM(amount) OVER (ORDER BY amount DESC, id) AS cumulative_amount
    FROM orders
)
SELECT os.id AS order_id, os.amount,
       ((os.cumulative_amount::numeric / ts.grand_total) * 100)::numeric(10,2) AS cumulative_percentage,
       CASE
           WHEN (os.cumulative_amount::numeric / ts.grand_total) <= 0.80 THEN 'A'
           WHEN (os.cumulative_amount::numeric / ts.grand_total) <= 0.95 THEN 'B'
           ELSE 'C'
       END AS abc_class
    FROM order_shares os, total_sales ts
    ORDER BY os.amount DESC, os.id;
