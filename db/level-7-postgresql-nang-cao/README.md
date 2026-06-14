# Level 7 — PostgreSQL nâng cao (20 bài)

Thư mục này chứa bài tập và lý thuyết về các tính năng mạnh mẽ, đặc trưng của PostgreSQL như làm việc với dữ liệu bán cấu trúc (JSONB, ARRAY), kiểu dữ liệu nâng cao (UUID, ENUM), tối ưu hóa chỉ mục (Partial Index, GIN Index) và Tìm kiếm toàn văn (Full Text Search).

## Kiến thức cốt lõi (Keywords)
1. **`JSONB`**: Định dạng lưu trữ JSON dưới dạng nhị phân đã được phân tích cú pháp. JSONB hỗ trợ đánh chỉ mục GIN, giúp truy vấn các trường dữ liệu động bên trong JSON cực kỳ nhanh chóng (nhanh hơn nhiều so với kiểu `JSON` thuần túy dạng chuỗi).
2. **`ARRAY`**: Kiểu dữ liệu mảng trong Postgres (ví dụ: `TEXT[]`, `INT[]`). Hỗ trợ các toán tử kiểm tra phần tử (`@>`), kiểm tra giao nhau (`&&`), tìm vị trí...
3. **`UUID`**: Định danh duy nhất toàn cầu (Universally Unique Identifier). Dùng thay cho ID dạng số tự tăng để tăng tính bảo mật và hỗ trợ phân tán dữ liệu tốt hơn. Cần extension `uuid-ossp` hoặc tính năng gen UUID có sẵn từ PG 13+.
4. **`ENUM`**: Kiểu dữ liệu liệt kê do người dùng tự định nghĩa (User-defined type) giúp ràng buộc dữ liệu đầu vào trong một tập giá trị cố định (ví dụ: trạng thái đơn hàng).
5. **`UPSERT` (`ON CONFLICT`)**: Cú pháp chèn dữ liệu mới, nhưng nếu xảy ra xung đột khóa chính hoặc ràng buộc duy nhất (unique constraint), Postgres sẽ chuyển sang cập nhật (UPDATE) dữ liệu cũ thay vì báo lỗi.
6. **Generated Column (Cột tự tính toán)**: Cột có giá trị luôn được tính toán tự động từ các cột khác trong cùng dòng. Không thể insert trực tiếp vào cột này.
7. **Chỉ mục nâng cao (Partial Index & GIN Index)**:
   - *Partial Index*: Chỉ tạo index trên một phần dữ liệu thỏa mãn điều kiện WHERE cụ thể (tiết kiệm không gian đĩa và tăng tốc ghi).
   - *GIN (Generalized Inverted Index)*: Chỉ mục đảo ngược đa dụng, bắt buộc khi cần index mảng, tài liệu JSONB hoặc Full Text Search.
8. **Full Text Search (FTS)**: Công cụ tìm kiếm toàn văn tích hợp sẵn của Postgres. Sử dụng `to_tsvector` để phân tách từ và loại bỏ từ dừng, và `to_tsquery` để truy vấn từ khóa tìm kiếm.

## Dataset
Được khởi tạo trong file `setup.sql` bao gồm:
- Extension `uuid-ossp` để tự sinh UUID.
- Kiểu ENUM `user_status`.
- Bảng `advanced_users` chứa ID dạng UUID, lương, số điện thoại dạng mảng (`TEXT[]`), trạng thái kiểu ENUM, cột tính toán tự động, và cột `metadata` kiểu `JSONB`.
- Bảng `articles` chứa tiêu đề và nội dung kiểu TEXT để thực hành Full Text Search.

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-7-postgresql-nang-cao
```
