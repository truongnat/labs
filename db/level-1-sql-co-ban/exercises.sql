-- @query: Bài 1 - Lấy toàn bộ user
-- SELECT: Từ khóa khai báo việc trích xuất dữ liệu.
-- *: Đại diện cho việc lấy tất cả các cột của bảng.
-- FROM users: Chỉ định lấy từ bảng có tên là 'users'.
SELECT *
FROM users;

-- @query: Bài 2 - Lấy user ở Hanoi
-- SELECT *: Chọn tất cả các cột.
-- FROM users: Nguồn dữ liệu từ bảng 'users'.
-- WHERE: Mệnh đề thiết lập điều kiện lọc dữ liệu.
-- city = 'Hanoi': Lọc ra những dòng mà giá trị ở cột 'city' chính xác là chuỗi 'Hanoi'.
SELECT *
FROM users
WHERE city = 'Hanoi';

-- @query: Bài 3 - Lấy user có tuổi > 25
-- WHERE age > 25: Lọc ra những bản ghi mà giá trị trong cột 'age' lớn hơn số 25.
SELECT *
FROM users
WHERE age > 25;

-- @query: Bài 4 - Sắp xếp theo salary giảm dần
-- ORDER BY: Mệnh đề dùng để sắp xếp kết quả trả về.
-- salary: Chỉ định cột dùng để sắp xếp là 'salary'.
-- DESC: (Descending) Sắp xếp theo thứ tự giảm dần (từ lớn nhất đến nhỏ nhất). Nếu dùng ASC sẽ là tăng dần.
SELECT *
FROM users
ORDER BY salary DESC;

-- @query: Bài 5 - Lấy 5 user lương cao nhất
-- ORDER BY salary DESC: Sắp xếp danh sách người dùng theo mức lương giảm dần trước.
-- LIMIT 5: Giới hạn số lượng kết quả trả về tối đa là 5 dòng (sau khi đã sắp xếp).
SELECT *
FROM users
ORDER BY salary DESC
LIMIT 5;

-- @query: Bài 6 - Lấy danh sách city không trùng
-- SELECT DISTINCT: Loại bỏ các dòng trùng lặp trong kết quả trả về, chỉ giữ lại các giá trị độc nhất.
-- city: Cột muốn lọc giá trị không trùng.
-- FROM users: Nguồn dữ liệu.
SELECT DISTINCT city
FROM users;

-- @query: Bài 7 - Tìm user tên bắt đầu bằng "A"
-- WHERE name: Điều kiện áp dụng lên cột tên.
-- LIKE: Toán tử so sánh chuỗi theo mẫu (pattern matching).
-- 'A%': Mẫu tìm kiếm. Chữ 'A' viết hoa ở đầu, và ký tự '%' đại diện cho bất kỳ chuỗi ký tự nào phía sau (không ký tự nào, 1 ký tự hoặc nhiều ký tự).
SELECT *
FROM users
WHERE name LIKE 'A%';

-- @query: Bài 8 - Tìm user có salary từ 1000–3000
-- WHERE salary: Điều kiện áp dụng lên cột lương.
-- BETWEEN 1000 AND 3000: Lọc các giá trị nằm trong khoảng từ 1000 đến 3000 (bao gồm cả giá trị 1000 và 3000). Nó tương đương với điều kiện `salary >= 1000 AND salary <= 3000`.
SELECT *
FROM users
WHERE salary BETWEEN 1000 AND 3000;

-- @query: Bài 9 - Tìm user không có city
-- WHERE city: Điều kiện lọc trên cột thành phố.
-- IS NULL: Toán tử kiểm tra xem trường thông tin có bị trống/rỗng (NULL) hay không. Trong SQL ta phải dùng 'IS NULL' thay vì '= NULL'.
SELECT *
FROM users
WHERE city IS NULL;

-- @query: Bài 10 - Tìm user ở Hanoi hoặc HCM
-- WHERE city: Điều kiện lọc trên cột thành phố.
-- IN ('Hanoi', 'HCM'): Kiểm tra xem giá trị cột 'city' có nằm trong tập hợp gồm 'Hanoi' hoặc 'HCM' hay không. Đây là cách viết ngắn gọn thay cho `city = 'Hanoi' OR city = 'HCM'`.
SELECT *
FROM users
WHERE city IN ('Hanoi', 'HCM');
