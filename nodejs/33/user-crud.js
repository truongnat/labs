// Bài 33: CRUD cơ bản với Mongoose
// Create, Read, Update, Delete - 4 thao tác cơ bản với database

const mongoose = require('./mongoose-connect');
const User = require('./user-schema');

async function crudDemo() {
    try {
        // CREATE - Tạo mới document
        const newUser = await User.create({
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            age: 25
        });
        console.log('Tạo user mới:', newUser);

        // READ - Đọc document
        // Tìm 1 user theo ID
        const user = await User.findById(newUser._id);
        console.log('Tìm user theo ID:', user);

        // Tìm 1 user theo điều kiện
        const userByEmail = await User.findOne({ email: 'nguyenvana@example.com' });
        console.log('Tìm user theo email:', userByEmail);

        // Tìm nhiều users
        const allUsers = await User.find({ age: { $gte: 18 } }); // Tuổi >= 18
        console.log('Tìm users:', allUsers.length);

        // UPDATE - Cập nhật document
        // Cập nhật 1 user
        user.name = 'Nguyễn Văn B';
        await user.save();
        console.log('Cập nhật user:', user);

        // Cập nhật nhiều (findByIdAndUpdate)
        const updated = await User.findByIdAndUpdate(
            newUser._id,
            { age: 26 },
            { new: true } // Trả về document đã cập nhật
        );
        console.log('Update bằng findByIdAndUpdate:', updated);

        // DELETE - Xóa document
        await User.findByIdAndDelete(newUser._id);
        console.log('Đã xóa user');

    } catch (error) {
        console.error('Lỗi CRUD:', error.message);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
    }
}

// Chạy demo
crudDemo();