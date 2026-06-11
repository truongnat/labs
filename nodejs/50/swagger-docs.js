// Bài 50: Tạo tài liệu API tự động bằng Swagger (OpenAPI)
// Swagger UI giúp team frontend/test explore API mà không đọc code
// Chạy bằng lệnh: cd 50 && npm install && node swagger-docs.js

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3050;

// OpenAPI 3.0 spec — có thể tách ra file swagger.json riêng
const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'Node.js Exercises API',
        version: '1.0.0',
        description: 'Demo Swagger cho bài 50 — tài liệu API tự động',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local dev' }],
    paths: {
        '/api/users': {
            get: {
                summary: 'Lấy danh sách users',
                tags: ['Users'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: 10 },
                    },
                ],
                responses: {
                    200: {
                        description: 'Danh sách users',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/User' },
                                        },
                                        total: { type: 'integer' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Tạo user mới',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateUser' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User đã tạo',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
            },
        },
        '/api/users/{id}': {
            get: {
                summary: 'Lấy user theo ID',
                tags: ['Users'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: {
                        description: 'User detail',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                    404: { description: 'Không tìm thấy' },
                },
            },
        },
    },
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Nguyễn Văn A' },
                    email: { type: 'string', format: 'email', example: 'a@test.com' },
                },
            },
            CreateUser: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { type: 'string', minLength: 2 },
                    email: { type: 'string', format: 'email' },
                },
            },
        },
    },
};

const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@test.com' },
    { id: 2, name: 'Trần Thị B', email: 'b@test.com' },
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/users', (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    res.json({ data: users, total: users.length, page, limit });
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find((u) => u.id === Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
});

app.post('/api/users', (req, res) => {
    const user = { id: Date.now(), ...req.body };
    users.push(user);
    res.status(201).json(user);
});

app.listen(PORT, () => {
    console.log(`Swagger demo: http://localhost:${PORT}/api-docs`);
    console.log(`API: http://localhost:${PORT}/api/users`);
});
