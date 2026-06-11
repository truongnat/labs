// Bài 31: Kết nối MongoDB với Mongoose
// Mongoose là ODM (Object Document Mapper) cho MongoDB

const mongoose = require('mongoose');

// Connection string tới MongoDB
// Đối với MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname
// Đối với MongoDB local: mongodb://localhost:27017/ten-database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nodejs_exercises';

// Kết nối MongoDB với Mongoose
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Kết nối MongoDB thành công');
    })
    .catch(err => {
        console.error('❌ Kết nối MongoDB thất bại:', err.message);
        process.exit(1); // Thoát process nếu kết nối thất bại
    });

// Xử lý sự kiện kết nối
mongoose.connection.on('connected', () => {
    console.log('MongoDB: Đã kết nối');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB lỗi:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB: Đã ngắt kết nối');
});

// Đóng kết nối khi app dừng
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB: Đã đóng kết nối');
    process.exit(0);
});

// Export connection để các file khác dùng
module.exports = mongoose;