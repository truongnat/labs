# Level 9 — Index & Query Optimization (15 bài)

Thư mục này chứa 15 bài thực hành về tối ưu hóa cơ sở dữ liệu, phân vùng bảng, đánh chỉ mục và phân tích hiệu năng câu lệnh SQL (Query Tuning) trong PostgreSQL.

## Kiến thức cốt lõi (Keywords)
1. **Chỉ mục (Index)**: Cấu trúc dữ liệu phụ giúp tăng tốc độ tìm kiếm dòng dữ liệu trong bảng mà không cần đọc toàn bộ bảng (Seq Scan).
2. **Các loại Index phổ biến trong Postgres**:
   - **B-Tree** (Mặc định): Cây tự cân bằng, tối ưu cho các phép toán so sánh `=`, `<`, `<=`, `>`, `>=`, `BETWEEN`, `IN`.
   - **GIN (Generalized Inverted Index)**: Chỉ mục đảo ngược, tối ưu cho mảng, JSONB và Full Text Search.
   - **BRIN (Block Range Index)**: Đánh chỉ mục theo dải khối (block ranges). Thích hợp cho các bảng khổng lồ có dữ liệu tăng dần theo thời gian (như bảng logs) để tiết kiệm dung lượng chỉ mục.
   - **Hash**: Chỉ áp dụng cho các phép so sánh bằng `=`.
3. **Chỉ mục kết hợp (Composite Index)**: Index được tạo trên nhiều cột cùng lúc (ví dụ: `idx_user_created (user_id, created_at)`). Thứ tự các cột rất quan trọng (quy tắc tiền tố trái - Leftmost Prefix).
4. **Chỉ mục bao phủ (Covering Index)**: Index đi kèm mệnh đề `INCLUDE` chứa các cột cần chọn thêm. Giúp thực hiện *Index Only Scan* (lấy trực tiếp dữ liệu từ Index mà không cần trỏ lại bảng chính - Heap).
5. **Chỉ mục bán phần (Partial Index)**: Index chỉ đánh trên các bản ghi thỏa mãn điều kiện WHERE (tiết kiệm không gian lưu trữ).
6. **Giải thích truy vấn (`EXPLAIN / EXPLAIN ANALYZE`)**:
   - `EXPLAIN`: Hiển thị kế hoạch thực thi dự kiến của bộ tối ưu hóa (Planner).
   - `EXPLAIN ANALYZE`: Thực thi trực tiếp câu lệnh và hiển thị thời gian chạy thực tế cùng các thông số chi tiết của quá trình thực thi.
7. **Tối ưu hóa phân trang (Pagination)**:
   - Phân trang dùng `LIMIT OFFSET` truyền thống sẽ chậm dần khi trang càng lớn do database vẫn phải duyệt qua tất cả các dòng bị bỏ qua.
   - Phân trang Keyset (Cursor-based pagination) tối ưu bằng cách so sánh khóa của trang cuối cùng đã xem (`WHERE id > last_seen_id LIMIT 10`), cho thời gian chạy hằng số $O(1)$.
8. **Phân vùng bảng (Table Partitioning)**: Chia một bảng lớn thành các bảng nhỏ vật lý hơn theo khoảng giá trị (Range), danh sách (List) hoặc mã băm (Hash). Giúp tối ưu hóa lưu trữ và truy vấn thông qua cơ chế *Partition Pruning* (chỉ quét các phân vùng cần thiết).
9. **Dọn dẹp và phân tích (`VACUUM / ANALYZE`)**:
   - `VACUUM`: Thu hồi không gian đĩa bị chiếm dụng bởi các dòng dữ liệu cũ đã bị xóa hoặc cập nhật (dead tuples).
   - `ANALYZE`: Thu thập số liệu thống kê về dữ liệu trong bảng để bộ tối ưu chọn đúng đường đi (kế hoạch thực thi) tốt nhất.

## Dataset
Bao gồm:
- Bảng `customers_opt` để thực hành B-Tree, Composite, Covering, Partial, và Keyset Pagination.
- Bảng `system_logs` (bảng lớn giả lập) để thực hành chỉ mục BRIN.
- Bảng phân vùng `sales_records` (phân vùng theo khoảng năm).

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-9-index-optimization
```
