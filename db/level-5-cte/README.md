# Level 5 — CTE (WITH) (10 bài)

Thư mục này chứa bài tập và lý thuyết về Biểu thức bảng chung (Common Table Expressions - CTE) trong SQL, bao gồm cả CTE đệ quy (`WITH RECURSIVE`).

## Kiến thức cốt lõi (Keywords)
1. **`WITH` (CTE)**: Định nghĩa một bảng phụ tạm thời trong phạm vi thực thi của một truy vấn duy nhất (SELECT, INSERT, UPDATE hoặc DELETE). CTE giúp mã nguồn SQL trở nên sạch sẽ, dễ đọc và dễ bảo trì hơn so với Subquery lồng nhau sâu.
   ```sql
   WITH cte_name AS (
       SELECT ...
   )
   SELECT * FROM cte_name;
   ```
2. **`WITH RECURSIVE` (CTE đệ quy)**: Một dạng CTE đặc biệt cho phép tự tham chiếu đến chính nó. Đây là công cụ cực kỳ mạnh mẽ để truy vấn cấu trúc phân cấp (cây danh mục, cây nhân sự, cấu trúc sơ đồ tổ chức) hoặc sinh dãy số/dữ liệu tự động.
   Một CTE đệ quy gồm 2 phần kết hợp bởi `UNION` hoặc `UNION ALL`:
   - **Anchor Member**: Điểm bắt đầu (truy vấn neo), được thực thi đầu tiên.
   - **Recursive Member**: Thành phần đệ quy, liên tục tham chiếu lại CTE để lấy dữ liệu cấp tiếp theo cho đến khi không còn kết quả.

## Dataset
Bao gồm các bảng được thiết kế đặc biệt:
- `users`: ID, Tên, Lương.
- `orders`: ID, user_id, amount, status, created_at (kiểu DATE để phân tích theo tháng).
- `employees`: Cấu trúc nhân viên cấp bậc phân quyền (id, name, manager_id).
- `categories`: Cấu trúc cây danh mục sản phẩm (id, name, parent_id).

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-5-cte
```
