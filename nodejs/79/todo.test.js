// Bài 79: TDD CRUD — Viết test TRƯỚC, implement SAU
// Mỗi describe block mô phỏng 1 chu kỳ Red-Green-Refactor
// Chạy: npx jest 79/todo.test.js

const { TodoStore } = require('./todo');

describe('TodoStore — TDD CRUD', () => {
    let store;

    beforeEach(() => {
        store = new TodoStore();
    });

    // === RED → GREEN: CREATE ===
    describe('create()', () => {
        test('tạo todo với tiêu đề hợp lệ', () => {
            const todo = store.create('Học Node.js');
            expect(todo.id).toBe(1);
            expect(todo.title).toBe('Học Node.js');
            expect(todo.completed).toBe(false);
            expect(todo.createdAt).toBeDefined();
        });

        test('từ chối tiêu đề rỗng', () => {
            expect(() => store.create('')).toThrow('Tiêu đề không được rỗng');
            expect(() => store.create('   ')).toThrow('Tiêu đề không được rỗng');
        });
    });

    // === READ ===
    describe('findAll() & findById()', () => {
        test('findAll trả về danh sách đã tạo', () => {
            store.create('Task 1');
            store.create('Task 2');
            expect(store.findAll()).toHaveLength(2);
        });

        test('findById trả về null nếu không tồn tại', () => {
            expect(store.findById(999)).toBeNull();
        });
    });

    // === UPDATE ===
    describe('update()', () => {
        test('cập nhật title và completed', () => {
            const todo = store.create('Cũ');
            const updated = store.update(todo.id, {
                title: 'Mới',
                completed: true,
            });
            expect(updated.title).toBe('Mới');
            expect(updated.completed).toBe(true);
        });

        test('update todo không tồn tại ném lỗi', () => {
            expect(() => store.update(99, { title: 'X' })).toThrow(
                'Todo không tồn tại'
            );
        });
    });

    // === DELETE ===
    describe('delete()', () => {
        test('xóa todo thành công', () => {
            const todo = store.create('Xóa tôi');
            const deleted = store.delete(todo.id);
            expect(deleted.title).toBe('Xóa tôi');
            expect(store.findById(todo.id)).toBeNull();
        });

        test('xóa todo không tồn tại ném lỗi', () => {
            expect(() => store.delete(99)).toThrow('Todo không tồn tại');
        });
    });
});
