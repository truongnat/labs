// Bài 11: Xử lý đường dẫn với module path
// path giúp ghép/parse đường dẫn đúng trên mọi OS (Windows dùng \, Unix dùng /)
// Chạy bằng lệnh: node path.js

const path = require('path');

const fileName = 'demo.txt';
const subFolder = 'data';

// path.join() - ghép các segment thành 1 đường dẫn, tự xử lý dấu /
// Luôn dùng join thay vì nối chuỗi thủ công
const joinedPath = path.join(__dirname, subFolder, fileName);
console.log('path.join():', joinedPath);

// path.resolve() - trả về đường dẫn tuyệt đối
// Khác join: resolve xử lý từ phải sang trái, gặp absolute path thì dừng
const resolvedPath = path.resolve(__dirname, subFolder, fileName);
console.log('path.resolve():', resolvedPath);

// path.parse() - tách đường dẫn thành object
const parsed = path.parse(joinedPath);
console.log('\npath.parse():');
console.log('  root  :', parsed.root);   // / hoặc C:\
console.log('  dir   :', parsed.dir);    // thư mục cha
console.log('  base  :', parsed.base);   // tên file + extension
console.log('  ext   :', parsed.ext);    // .txt
console.log('  name  :', parsed.name);   // tên file không extension

// path.basename() - lấy tên file
console.log('\npath.basename():', path.basename(joinedPath));

// path.extname() - lấy phần mở rộng
console.log('path.extname():', path.extname(joinedPath));

// path.dirname() - lấy thư mục cha
console.log('path.dirname():', path.dirname(joinedPath));

// Demo khác biệt join vs resolve với absolute path
console.log('\n--- join vs resolve ---');
console.log('join("/a", "/b")   :', path.join('/a', '/b'));       // /b (relative trên Unix)
console.log('resolve("/a", "/b"):', path.resolve('/a', '/b'));    // /b (absolute wins)
