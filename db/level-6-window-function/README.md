# Level 6 — Window Function (20 bài)

Thư mục này chứa 20 bài tập và lý thuyết sâu sắc về Hàm cửa sổ (Window Functions) - một trong những tính năng mạnh mẽ nhất của SQL dùng cho phân tích dữ liệu (Data Analysis) và báo cáo.

## Kiến thức cốt lõi (Keywords)
1. **Window Function**: Tính toán trên một tập hợp các dòng có liên quan đến dòng hiện tại (được gọi là "cửa sổ" - window), nhưng không làm gộp các dòng lại như `GROUP BY`. Mỗi dòng vẫn giữ nguyên tính độc lập của nó trong kết quả trả về.
2. **`OVER`**: Cú pháp bắt buộc để khai báo hàm cửa sổ.
3. **`PARTITION BY`**: Chia các dòng thành các phân vùng (nhóm) để áp dụng hàm cửa sổ độc lập trên từng nhóm đó (tương tự `GROUP BY` nhưng không làm gộp dòng).
4. **`ORDER BY`**: Xác định thứ tự các dòng trong từng phân vùng để thực hiện tính toán (ví dụ: cộng dồn theo thời gian).
5. **Hàm xếp hạng**:
   - `ROW_NUMBER()`: Đánh số thứ tự duy nhất, liên tục từ 1 cho các dòng trong phân vùng.
   - `RANK()`: Xếp hạng có nhảy bậc nếu trùng giá trị (ví dụ: 1, 2, 2, 4).
   - `DENSE_RANK()`: Xếp hạng liên tục, không nhảy bậc nếu trùng giá trị (ví dụ: 1, 2, 2, 3).
6. **Hàm giá trị**:
   - `LAG(column, offset)`: Lấy giá trị của dòng đứng trước dòng hiện tại `offset` bước (mặc định là 1). Rất hữu ích để so sánh số liệu với ngày hôm trước.
   - `LEAD(column, offset)`: Lấy giá trị của dòng đứng sau dòng hiện tại `offset` bước.
   - `FIRST_VALUE(column)`: Lấy giá trị đầu tiên của cửa sổ.
   - `LAST_VALUE(column)`: Lấy giá trị cuối cùng của cửa sổ.
7. **Hàm tích lũy**: `SUM() OVER (...)`, `AVG() OVER (...)` cho phép tính tổng lũy kế (running total) hoặc trung bình trượt (moving average).

## Dataset
Bao gồm:
- `departments` & `employees`: Phòng ban và nhân viên để thực hành xếp hạng lương.
- `orders`: Đơn hàng để thực hành tính doanh thu cộng dồn, trung bình trượt, cohort, khách hàng trung thành.
- `user_logins`: Lịch sử đăng nhập để tính chuỗi ngày đăng nhập liên tiếp (streak).
- `user_activities`: Lịch sử hoạt động để gom phiên hoạt động (sessionization).
- `ticket_sequences`: Dãy số để phát hiện các khoảng trống (gaps).

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-6-window-function
```
