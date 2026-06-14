# Level 4 — Subquery (10 bài)

Thư mục này chứa bài tập và lý thuyết về Truy vấn con (Subquery) - một truy vấn SQL nằm lồng bên trong một truy vấn SQL khác.

## Kiến thức cốt lõi (Keywords)
1. **Scalar Subquery (Truy vấn con đơn trị)**: Trả về chính xác 1 dòng và 1 cột (một giá trị đơn duy nhất). Nó có thể được sử dụng ở bất kỳ nơi nào cần một giá trị đơn (ví dụ: so sánh lớn hơn mức trung bình `WHERE salary > (SELECT AVG(salary)...)`).
2. **Correlated Subquery (Truy vấn con tương quan)**: Truy vấn con sử dụng các giá trị từ truy vấn cha ở bên ngoài. Nó sẽ chạy lặp lại cho từng dòng của truy vấn cha.
3. **`EXISTS` / `NOT EXISTS`**: Trả về `TRUE` nếu truy vấn con tìm thấy ít nhất một dòng dữ liệu phù hợp. Rất hiệu quả khi kiểm tra sự tồn tại của dữ liệu liên kết mà không cần thực hiện JOIN.
4. **`IN` / `NOT IN`**: Kiểm tra xem một giá trị có nằm trong tập hợp kết quả trả về của truy vấn con (dạng danh sách) hay không.
5. **`ANY` (hoặc `SOME`)**: So sánh giá trị với bất kỳ phần tử nào trong kết quả của truy vấn con. Ví dụ: `WHERE salary > ANY (SELECT ...)` nghĩa là lớn hơn giá trị nhỏ nhất của tập kết quả.
6. **`ALL`**: So sánh giá trị với tất cả các phần tử trong kết quả của truy vấn con. Ví dụ: `WHERE salary > ALL (SELECT ...)` nghĩa là lớn hơn giá trị lớn nhất của tập kết quả.

## Dataset
Chúng ta sẽ sử dụng cấu trúc tương tự Level 3 gồm:
- `users`: Thông tin người dùng (id, name, salary).
- `departments`: Phòng ban.
- `employees`: Nhân viên (có department_id, salary).
- `orders`: Đơn hàng (id, user_id, amount, status).
- `products`: Sản phẩm (id, name, price).
- `order_items`: Chi tiết đơn hàng.

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-4-subquery
```
