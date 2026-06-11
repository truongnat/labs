// Bài 18: Tạo, cắt (slice) và nối (concat) Buffer
// Buffer là cách Node.js xử lý dữ liệu nhị phân (binary data)

// Tạo Buffer từ chuỗi
const buf1 = Buffer.from('Hello World', 'utf-8');
console.log('Buffer từ chuỗi:', buf1.toString()); // Hello World
console.log('Độ dài buffer:', buf1.length); // 11 bytes

// Tạo Buffer với độ dài cụ thể (fill bằng 0)
const buf2 = Buffer.alloc(5);
console.log('Buffer rỗng:', buf2); // <Buffer 00 00 00 00 00>

// Tạo buffer nhanh (không fill, có thể chứa dữ liệu cũ)
const buf3 = Buffer.allocUnsafe(5);
console.log('Buffer unsafe:', buf3);

// Slice (cắt) buffer - tạo view mới từ vị trí start đến end
const buf4 = Buffer.from('abcdef');
const sliced = buf4.slice(0, 3); // Lấy 3 ký tự đầu
console.log('Sliced buffer:', sliced.toString()); // abc

// Concat (nối) buffer
const buf5 = Buffer.from('Hello');
const buf6 = Buffer.from(' World');
const concatenated = Buffer.concat([buf5, buf6]);
console.log('Concatenated:', concatenated.toString()); // Hello World

// Buffer cũng có thể xử lý số (big-endian/little-endian)
const bufNum = Buffer.alloc(4);
bufNum.writeInt32BE(12345, 0); // Ghi số 12345 vào buffer
console.log('Số từ buffer:', bufNum.readInt32BE(0)); // 12345