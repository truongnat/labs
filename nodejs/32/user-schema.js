// Bài 32: Thiết kế Mongoose Schema và Validation
// Schema định nghĩa cấu trúc document trong MongoDB

const mongoose = require('mongoose');

// Định nghĩa Schema - giống như model trong RDBMS
const userSchema = new mongoose.Schema({
    name: {
        type: String,           // Kiểu dữ liệu String
        required: [true, 'Tên là bắt buộc'], // Validation: bắt buộc nhập
        trim: true,             // Tự động xóa khoảng trắng đầu/cuối
        minlength: [2, 'Tên phải ít nhất 2 ký tự'],
        maxlength: [100, 'Tên không quá 100 ký tự']
    },
    email: {
        type: String,
        required: true,
        unique: true,           // Email phải duy nhất
        lowercase: true,        // Tự động chuyển về chữ thường
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'] // Regex validation
    },
    age: {
        type: Number,
        min: [18, 'Tuổi phải ít nhất 18'],   // Validation số
        max: [100, 'Tuổi không quá 100']
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Chỉ chấp nhận giá trị này
        default: 'user'          // Giá trị mặc định
    },
    createdAt: {
        type: Date,
        default: Date.now      // Tự động gán thời gian hiện tại
    }
});

// Tạo virtual field không lưu vào DB
// Ví dụ: user.fullName = firstName + lastName
userSchema.virtual('fullName').get(function() {
    return `${this.name} (${this.age})`;
});

// Middleware chạy trước khi lưu (save)
userSchema.pre('save', function(next) {
    console.log('Chuẩn bị lưu user:', this.email);
    next();
});

// Middleware chạy sau khi lưu
userSchema.post('save', function(doc) {
    console.log('Đã lưu user với ID:', doc._id);
});

// Tạo Model từ Schema
const User = mongoose.model('User', userSchema);

module.exports = User;