// Bài 75: Hàm tiện ích cần unit test
// File này chứa logic thuần — tách riêng khỏi test để dễ mock và tái sử dụng

function add(a, b) {
    return a + b;
}

function divide(a, b) {
    if (b === 0) throw new Error('Không thể chia cho 0');
    return a / b;
}

module.exports = { add, divide };
