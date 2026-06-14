-- @query: Bài 1 - Giao dịch chuyển tiền cơ bản
-- BEGIN: Bắt đầu một Transaction. Mọi thay đổi sau đó chỉ nằm ở dạng tạm thời.
-- UPDATE: Trừ 200 từ tài khoản An (id=1) và cộng 200 vào tài khoản Bình (id=2).
-- COMMIT: Xác nhận hoàn tất giao dịch. Mọi thay đổi được ghi vĩnh viễn vào DB.
BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;
COMMIT;

-- @query: Bài 2 - Giao dịch rút tiền có kiểm tra số dư (vấp lỗi ràng buộc)
-- Rút 1500 từ tài khoản của An (id=1).
-- Do tài khoản An chỉ có 800 (1000 - 200 từ bài 1), việc trừ 1500 sẽ vi phạm ràng buộc CHECK (balance >= 0) và gây ra lỗi SQL.
-- ROLLBACK: Khi có lỗi xảy ra, bắt buộc phải dùng ROLLBACK để hủy toàn bộ các thao tác trước đó trong giao dịch, đưa dữ liệu trở lại trạng thái ban đầu.
BEGIN;
UPDATE accounts SET balance = balance - 1500 WHERE id = 1;
ROLLBACK;

-- @query: Bài 3 - Đặt Savepoint để rollback một phần giao dịch
-- SAVEPOINT: Đặt một mốc trung gian trong giao dịch.
-- Nếu một câu lệnh sau mốc này bị lỗi, ta có thể rollback về mốc này thay vì hủy bỏ toàn bộ giao dịch.
-- ROLLBACK TO SAVEPOINT: Hủy bỏ các lệnh sau savepoint và tiếp tục thực hiện các câu lệnh hợp lệ khác trước khi COMMIT.
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- Trừ 100 hợp lệ
SAVEPOINT point1;
UPDATE accounts SET balance = balance + 10000 WHERE id = 999; -- Lệnh lỗi vì id 999 không tồn tại
ROLLBACK TO SAVEPOINT point1; -- Khôi phục về mốc point1, bỏ qua lệnh lỗi
UPDATE accounts SET balance = balance + 100 WHERE id = 3; -- Cộng 100 hợp lệ cho Cường
COMMIT;

-- @query: Bài 4 - Khóa dòng bằng FOR UPDATE (Pessimistic Lock)
-- FOR UPDATE: Khóa bi quan. Khóa dòng dữ liệu (id=1) để chuẩn bị cập nhật.
-- Các giao dịch khác cố tình UPDATE hoặc SELECT FOR UPDATE dòng này sẽ phải xếp hàng đợi cho đến khi giao dịch này COMMIT/ROLLBACK.
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- @query: Bài 5 - Khóa dòng không chờ bằng FOR UPDATE NOWAIT
-- NOWAIT: Nếu dòng dữ liệu (id=1) đang bị khóa bởi giao dịch khác, Postgres sẽ lập tức báo lỗi (error code 55P03) thay vì đứng chờ vô hạn. Giúp giải phóng luồng xử lý của ứng dụng khi gặp tranh chấp.
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;
COMMIT;

-- @query: Bài 6 - Bỏ qua dòng bị khóa bằng FOR UPDATE SKIP LOCKED
-- SKIP LOCKED: Lọc và bỏ qua tất cả các dòng đang bị khóa bởi giao dịch khác.
-- Rất thích hợp để xây dựng hệ thống Hàng đợi (Queue), nơi nhiều worker cùng lấy các tác vụ rảnh rỗi để xử lý song song mà không sợ bị trùng lặp hay nghẽn khóa.
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE SKIP LOCKED;
COMMIT;

-- @query: Bài 7 - Khóa đọc chia sẻ bằng FOR SHARE
-- FOR SHARE: Khóa chia sẻ. Cho phép các giao dịch khác cùng đọc dòng này (cùng SELECT FOR SHARE), nhưng không giao dịch nào được phép cập nhật (UPDATE) dòng này cho đến khi giao dịch hiện tại hoàn tất.
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR SHARE;
COMMIT;

-- @query: Bài 8 - Mô phỏng Lost Update (Ghi đè dữ liệu bị mất)
-- Lost Update xảy ra khi hai luồng xử lý cùng đọc số dư cũ (ví dụ: 700), tính toán rồi ghi đè lên nhau.
-- Ở đây giả lập Giao dịch đọc số dư ra biến tạm:
SELECT balance FROM accounts WHERE id = 1;
-- Sau đó cập nhật đè số dư dựa trên giá trị cũ đã đọc (giả sử cập nhật thành 1200):
UPDATE accounts SET balance = 1200 WHERE id = 1;

-- @query: Bài 9 - Phòng chống Lost Update bằng Khóa lạc quan (Optimistic Locking)
-- Optimistic Locking: Sử dụng cột 'version' để kiểm tra xem dòng đã bị thay đổi bởi ai khác chưa trước khi cập nhật.
-- WHERE id = 1 AND version = 1: Nếu dòng đã bị cập nhật bởi luồng khác, version của nó sẽ tăng lên và điều kiện WHERE sẽ sai, dẫn đến UPDATE không ảnh hưởng đến dòng nào (0 rows affected). Ứng dụng sẽ phát hiện được xung đột này để retry.
UPDATE accounts 
SET balance = 1300, version = version + 1 
WHERE id = 1 AND version = 1;

-- @query: Bài 10 - Mức cô lập Read Committed
-- READ COMMITTED: Mức cô lập mặc định. Chỉ đọc các dữ liệu đã được COMMIT bởi các giao dịch khác. Phòng tránh được Dirty Read (đọc dữ liệu rác chưa commit).
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT balance FROM accounts WHERE id = 1;
COMMIT;

-- @query: Bài 11 - Mức cô lập Repeatable Read
-- REPEATABLE READ: Đảm bảo dữ liệu đọc lần thứ hai trong cùng một giao dịch sẽ giống hệt lần thứ nhất, kể cả khi có giao dịch khác vừa COMMIT thay đổi giữa hai lần đọc. Phòng tránh được Non-repeatable Read.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE id = 1;
COMMIT;

-- @query: Bài 12 - Mức cô lập Serializable
-- SERIALIZABLE: Mức cô lập nghiêm ngặt nhất. Postgres sẽ theo dõi các phụ thuộc khóa và báo lỗi (Serialization Failure) nếu phát hiện các giao dịch song song có thể dẫn đến trạng thái dữ liệu không nhất quán. Phòng tránh được mọi hiện tượng dị thường (Anomalies).
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT balance FROM accounts WHERE id = 1;
COMMIT;

-- @query: Bài 13 - Mô phỏng Deadlock tuần tự
-- Deadlock xảy ra khi hai tiến trình khóa tài nguyên chéo nhau.
-- Ở đây ta mô phỏng thứ tự khóa tuần tự tài khoản 1 rồi tài khoản 2 trong một giao dịch.
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;
COMMIT;

-- @query: Bài 14 - Thiết lập giới hạn thời gian chờ khóa (lock_timeout)
-- SET lock_timeout = 1000: Thiết lập giới hạn thời gian chờ khóa là 1000ms (1 giây).
-- Nếu câu lệnh bị chặn bởi khóa khác vượt quá 1 giây, Postgres sẽ tự động hủy truy vấn đó, tránh treo hệ thống.
SET lock_timeout = 1000;
SHOW lock_timeout;

-- @query: Bài 15 - Giữ chỗ kho hàng (Inventory Reservation) tránh bán quá mức (overselling)
-- FOR UPDATE: Khóa dòng sản phẩm 101 để đảm bảo số lượng stock đọc ra là chính xác nhất và không ai có thể can thiệp sửa đổi cho đến khi ta cập nhật trừ kho xong và commit.
BEGIN;
SELECT stock FROM products_stock WHERE id = 101 FOR UPDATE;
UPDATE products_stock SET stock = stock - 1 WHERE id = 101;
COMMIT;
