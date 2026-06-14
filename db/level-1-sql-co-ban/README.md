# Level 1 — SQL Cơ bản (10 bài)

Thư mục này chứa bài tập và lý thuyết cơ bản về SQL nhằm giúp làm quen với cách truy vấn dữ liệu từ một bảng duy nhất.

## Kiến thức cốt lõi (Keywords)
1. **`SELECT`**: Dùng để chỉ định các cột dữ liệu mà bạn muốn lấy ra trong kết quả. Sử dụng `SELECT *` để lấy toàn bộ các cột.
2. **`FROM`**: Chỉ định bảng nguồn mà bạn muốn truy vấn dữ liệu (ví dụ: `FROM users`).
3. **`WHERE`**: Dùng để lọc các dòng thỏa mãn một hoặc nhiều điều kiện nhất định.
4. **`ORDER BY`**: Sắp xếp kết quả trả về theo thứ tự tăng dần (`ASC` - mặc định) hoặc giảm dần (`DESC`) dựa trên một hoặc nhiều cột.
5. **`LIMIT`**: Giới hạn số lượng dòng tối đa trả về trong kết quả truy vấn.
6. **`DISTINCT`**: Loại bỏ các dòng trùng lặp, chỉ trả về các giá trị độc nhất (unique values).
7. **`LIKE`**: Lọc chuỗi theo mẫu (pattern matching). Sử dụng ký tự đại diện `%` (đại diện cho chuỗi bất kỳ) hoặc `_` (đại diện cho một ký tự đơn).
8. **`IN`**: Kiểm tra xem một giá trị có nằm trong danh sách các giá trị được chỉ định hay không.
9. **`BETWEEN`**: Lọc dữ liệu nằm trong một khoảng giá trị nhất định (bao gồm cả biên đầu và biên cuối).
10. **`IS NULL` / `IS NOT NULL`**: Kiểm tra xem trường dữ liệu có bị rỗng (NULL) hay không. Trong SQL, không thể dùng toán tử `=` để so sánh với `NULL`.

## Dataset: Bảng `users`
Bảng `users` chứa thông tin cơ bản về người dùng:
- `id`: Định danh duy nhất (SERIAL, Khóa chính)
- `name`: Tên người dùng (VARCHAR)
- `age`: Tuổi (INT)
- `city`: Thành phố sinh sống (VARCHAR, có thể NULL)
- `salary`: Mức lương (INT)

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-1-sql-co-ban
```
