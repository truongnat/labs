// Bài 27: Template Engine (EJS) để render HTML động
// EJS cho phép nhúng JavaScript trong HTML template

const express = require('express');
const path = require('path');
const app = express();

// Cấu hình EJS làm view engine
// Các file template sẽ nằm trong thư mục 'views'
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route render EJS template
app.get('/', (req, res) => {
    // res.render(ten_file, data) render template với dữ liệu
    res.render('index', {
        title: 'Trang chủ - Node.js EJS',
        username: 'Nguyễn Văn A',
        products: [
            { id: 1, name: 'iPhone 15', price: 25000000 },
            { id: 2, name: 'Samsung S24', price: 20000000 }
        ]
    });
});

// Route với dữ liệu động
app.get('/users/:id', (req, res) => {
    const user = {
        id: req.params.id,
        name: 'User ' + req.params.id,
        email: 'user' + req.params.id + '@example.com'
    };
    res.render('user', { user });
});

// Tạo thư mục views với file index.ejs:
// <!DOCTYPE html>
// <html>
// <head><title><%= title %></title></head>
// <body>
//   <h1>Xin chào <%= username %>!</h1>
//   <ul>
//   <% products.forEach(product => { %>
//     <li><%= product.name %> - <%= product.price %></li>
//   <% }) %>
//   </ul>
// </body>
// </html>

app.listen(3000);