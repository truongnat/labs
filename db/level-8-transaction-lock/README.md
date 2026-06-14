# Level 8 — Transaction & Lock (15 bài)

Thư mục này chứa 15 bài thực hành chuyên sâu về Giao dịch (Transaction), Khóa (Locking), các mức độ cô lập (Isolation Levels) và xử lý tranh chấp dữ liệu (Concurrency Control) trong PostgreSQL.

## Kiến thức cốt lõi (Keywords)
1. **ACID**: 4 thuộc tính bắt buộc của một giao dịch đáng tin cậy:
   - *Atomicity* (Tính nguyên tử): Tất cả đều thành công hoặc tất cả đều thất bại (rollback).
   - *Consistency* (Tính nhất quán): Dữ liệu chuyển từ trạng thái hợp lệ này sang trạng thái hợp lệ khác.
   - *Isolation* (Tính cô lập): Các giao dịch chạy song song không được can thiệp vào nhau.
   - *Durability* (Tính bền vững): Kết quả giao dịch được lưu vĩnh viễn vào đĩa cứng sau khi commit.
2. **Pessimistic Locking (Khóa bi quan)**: Khóa tài nguyên ngay khi đọc để ngăn chặn người khác sửa đổi.
   - `SELECT ... FOR UPDATE`: Khóa dòng để chuẩn bị cập nhật, những phiên khác cố ghi vào dòng này sẽ phải chờ.
   - `SELECT ... FOR UPDATE NOWAIT`: Nếu dòng đang bị khóa bởi phiên khác, báo lỗi ngay lập tức thay vì chờ đợi.
   - `SELECT ... FOR UPDATE SKIP LOCKED`: Bỏ qua các dòng đang bị khóa bởi phiên khác (rất thích hợp để triển khai Queue/Hàng đợi).
   - `SELECT ... FOR SHARE`: Khóa chia sẻ, cho phép các phiên khác đọc nhưng không cho phép sửa đổi dòng cho đến khi giao dịch kết thúc.
3. **Optimistic Locking (Khóa lạc quan)**: Không khóa dòng khi đọc, nhưng khi cập nhật sẽ kiểm tra xem dữ liệu có bị ai khác sửa đổi trước đó không (thường dùng một cột phiên bản `version` hoặc timestamp).
4. **Mức cô lập (Isolation Levels)**:
   - `READ COMMITTED` (Mặc định trong Postgres): Chỉ đọc dữ liệu đã được commit. Tránh được *Dirty Read*.
   - `REPEATABLE READ`: Đảm bảo dữ liệu đọc lần thứ 2 trong giao dịch sẽ y hệt lần thứ 1. Tránh được *Non-repeatable Read*.
   - `SERIALIZABLE`: Mức cao nhất, đảm bảo các giao dịch chạy song song cho ra kết quả y hệt như khi chạy tuần tự từng cái một. Tránh được *Phantom Read* và *Serialization Anomaly*.
5. **Deadlock (Khóa chết)**: Xảy ra khi Giao dịch A giữ Khóa X và muốn lấy Khóa Y, trong khi Giao dịch B đang giữ Khóa Y và muốn lấy Khóa X. Cả hai sẽ chờ nhau vô hạn cho đến khi hệ quản trị cơ sở dữ liệu phát hiện và hủy bỏ (abort) một trong hai giao dịch.

## Dataset
Bao gồm:
- Bảng `accounts`: Lưu số dư tài khoản ngân hàng để thực hành chuyển tiền và khóa tài khoản.
- Bảng `products_stock`: Lưu số lượng tồn kho của sản phẩm để thực hành đặt chỗ (Inventory Reservation).

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-8-transaction-lock
```
*(Lưu ý: Đối với một số bài kiểm tra mô phỏng deadlock hoặc timeout, runner trung tâm sử dụng kết nối đơn lẻ nên sẽ thực thi tuần tự các câu lệnh mô phỏng một cách an toàn).*
