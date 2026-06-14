# Level 3 — JOIN (15 bài)

Thư mục này chứa bài tập và lý thuyết liên kết dữ liệu từ nhiều bảng bằng cách sử dụng phép JOIN trong SQL.

## Kiến thức cốt lõi (Keywords)
1. **`INNER JOIN`**: Chỉ trả về những dòng có sự khớp nhau về khóa ở cả hai bảng được liên kết.
2. **`LEFT JOIN` (hoặc `LEFT OUTER JOIN`)**: Trả về toàn bộ các dòng của bảng bên trái và các dòng phù hợp ở bảng bên phải. Nếu không khớp, cột của bảng bên phải sẽ có giá trị `NULL`.
3. **`RIGHT JOIN` (hoặc `RIGHT OUTER JOIN`)**: Trả về toàn bộ các dòng của bảng bên phải và các dòng phù hợp ở bảng bên trái. (Ngược lại với LEFT JOIN).
4. **`FULL JOIN` (hoặc `FULL OUTER JOIN`)**: Trả về tất cả các dòng của cả hai bảng. Nếu không có dòng khớp, các cột tương ứng sẽ có giá trị `NULL`.
5. **`CROSS JOIN`**: Phép nhân Descartes (Cartesian product), trả về mọi tổ hợp kết hợp có thể có của các dòng từ hai bảng (không cần điều kiện khớp khóa `ON`).
6. **`SELF JOIN`**: Một bảng tự kết hợp với chính nó (cần sử dụng các bí danh khác nhau cho cùng một bảng, ví dụ `FROM employees e JOIN employees m ON e.manager_id = m.id`).

## Dataset: Nhiều bảng liên quan đến doanh nghiệp
Chúng ta sẽ định nghĩa các bảng sau:
- `users`: Thông tin khách hàng.
- `orders`: Đơn hàng do khách hàng đặt.
- `products`: Các sản phẩm được bán.
- `order_items`: Chi tiết các sản phẩm trong đơn hàng (liên kết nhiều-nhiều giữa `orders` và `products`).
- `departments`: Phòng ban trong công ty.
- `employees`: Nhân viên, có liên kết đến phòng ban và cấp quản lý (manager_id - liên kết tự thân).

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-3-join
```
