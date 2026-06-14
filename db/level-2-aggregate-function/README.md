# Level 2 — Aggregate Function (10 bài)

Thư mục này chứa bài tập và lý thuyết về các hàm tổng hợp (Aggregate Functions) và gom nhóm dữ liệu trong SQL.

## Kiến thức cốt lõi (Keywords)
1. **`COUNT()`**: Đếm số lượng dòng trong kết quả. `COUNT(*)` đếm tất cả các dòng, còn `COUNT(column)` đếm các dòng có giá trị khác `NULL` tại cột đó.
2. **`SUM()`**: Tính tổng các giá trị số trong một cột.
3. **`AVG()`**: Tính giá trị trung bình (Average) của một cột số.
4. **`MIN()`**: Tìm giá trị nhỏ nhất trong một cột.
5. **`MAX()`**: Tìm giá trị lớn nhất trong một cột.
6. **`GROUP BY`**: Nhóm các dòng có cùng giá trị trong một hoặc nhiều cột để thực hiện các phép tính tổng hợp trên từng nhóm đó.
7. **`HAVING`**: Tương tự như mệnh đề `WHERE` nhưng dùng để lọc các nhóm sau khi đã gom nhóm bằng `GROUP BY`. `WHERE` lọc từng dòng trước khi nhóm, còn `HAVING` lọc các nhóm sau khi nhóm.

## Dataset: Bảng `orders`
Bảng `orders` lưu thông tin về các đơn hàng của người dùng:
- `id`: Định danh duy nhất của đơn hàng (SERIAL, Khóa chính)
- `user_id`: Định danh người dùng (INT)
- `amount`: Số tiền đơn hàng (INT)
- `status`: Trạng thái đơn hàng (VARCHAR, ví dụ: 'paid', 'pending', 'cancelled')

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-2-aggregate-function
```
