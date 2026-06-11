// Bài 77: Integration Test với Supertest
// Gửi HTTP request thật tới Express app, không cần chạy server riêng
// Chạy: npx jest 77/app.integration.test.js

const request = require('supertest');
const app = require('./app');

describe('Users API — Integration Test', () => {
    test('GET /health trả về status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('POST /users tạo user và GET /users/:id lấy lại', async () => {
        const createRes = await request(app)
            .post('/users')
            .send({ name: 'Nguyễn Văn A', email: 'a@test.com' })
            .set('Content-Type', 'application/json');

        expect(createRes.status).toBe(201);
        expect(createRes.body).toMatchObject({
            name: 'Nguyễn Văn A',
            email: 'a@test.com',
        });
        expect(createRes.body.id).toBeDefined();

        const getRes = await request(app).get(`/users/${createRes.body.id}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.email).toBe('a@test.com');
    });

    test('POST /users thiếu email trả về 400', async () => {
        const res = await request(app)
            .post('/users')
            .send({ name: 'Thiếu email' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('bắt buộc');
    });

    test('GET /users/:id không tồn tại trả về 404', async () => {
        const res = await request(app).get('/users/99999');
        expect(res.status).toBe(404);
    });

    test('DELETE /users/:id xóa user thành công', async () => {
        const { body } = await request(app)
            .post('/users')
            .send({ name: 'Xóa tôi', email: 'delete@test.com' });

        const deleteRes = await request(app).delete(`/users/${body.id}`);
        expect(deleteRes.status).toBe(204);

        const getRes = await request(app).get(`/users/${body.id}`);
        expect(getRes.status).toBe(404);
    });
});
