# Level 10 — Database Design (20 bài)

Thư mục này chứa các thiết kế cơ sở dữ liệu và 20 truy vấn nghiệp vụ thực tế cho 4 hệ thống phổ biến:
1. **Thương mại điện tử (Ecommerce)**
2. **Mạng xã hội (Social Network)**
3. **Dịch vụ gọi xe (Grab/Uber)**
4. **Ứng dụng trò chuyện (Chat App)**

---

## 1. Hệ thống Thương mại điện tử (Ecommerce) 🛒
### Cấu trúc bảng và Mối quan hệ
- `eco_users` (Khách hàng): Lưu trữ thông tin người dùng.
- `eco_products` (Sản phẩm): Lưu tên, giá và số lượng tồn kho (`stock`).
- `eco_vouchers` (Mã giảm giá): Lưu mã, giá trị giảm, mức chi tiêu tối thiểu (`min_spend`) và hạn sử dụng.
- `eco_orders` (Đơn hàng): Liên kết người dùng, lưu giá gốc, giá sau giảm giá, trạng thái đơn hàng.
- `eco_order_items` (Chi tiết đơn hàng): Chi tiết các sản phẩm và số lượng mua trong mỗi đơn.
- `eco_payments` (Thanh toán): Lưu thông tin thanh toán cho từng đơn hàng.

---

## 2. Hệ thống Mạng xã hội (Social Network) 📱
### Cấu trúc bảng và Mối quan hệ
- `soc_users` (Thành viên): Thông tin người dùng mạng xã hội.
- `soc_posts` (Bài viết): Người dùng đăng bài (Mối quan hệ 1-N).
- `soc_comments` (Bình luận): Liên kết người dùng và bài viết được bình luận.
- `soc_likes` (Lượt thích): Người dùng thích bài viết (Mối quan hệ N-N).
- `soc_follows` (Theo dõi): Người dùng follow chéo lẫn nhau (Mối quan hệ N-N tự thân).

---

## 3. Hệ thống Gọi xe công nghệ (Grab) 🚕
### Cấu trúc bảng và Mối quan hệ
- `grab_customers` (Khách hàng): Người đặt xe.
- `grab_drivers` (Tài xế): Có tọa độ vị trí hiện tại (`lat`, `lng`) và trạng thái rảnh rỗi (`is_available`).
- `grab_rides` (Chuyến đi): Liên kết khách hàng và tài xế, lưu tọa độ đón/trả, quãng đường, cước phí, đánh giá sao (`rating`).
- `grab_payments` (Thanh toán cước): Ghi nhận giao dịch thanh toán cho mỗi chuyến đi.

---

## 4. Ứng dụng Chat trực tuyến (Chat App) 💬
### Cấu trúc bảng và Mối quan hệ
- `chat_users` (Người dùng): Danh bạ thành viên.
- `chat_conversations` (Cuộc hội thoại): Có thể là chat đôi hoặc chat nhóm.
- `chat_conversation_members` (Thành viên nhóm): Liên kết N-N giữa người dùng và cuộc hội thoại.
- `chat_messages` (Tin nhắn): Lưu nội dung, thời gian và ID người gửi.
- `chat_read_receipts` (Trạng thái đã đọc): Đánh dấu tin nhắn mới nhất mà một user cụ thể đã đọc trong cuộc hội thoại.

---

## Cách chạy thử nghiệm
Chạy lệnh sau tại thư mục gốc của workspace:
```bash
bun db/run.ts level-10-database-design
```
