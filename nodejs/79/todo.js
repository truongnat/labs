// Bài 79: TDD (Test-Driven Development) — Module CRUD Todo
// Quy trình TDD: Red → Green → Refactor
// 1. Viết test FAIL trước  2. Viết code tối thiểu PASS  3. Refactor
// Chạy test: npx jest 79/todo.test.js

/**
 * TodoStore — CRUD in-memory cho demo TDD
 * Trong TDD thực tế: viết test create() trước, rồi mới implement create()
 */
class TodoStore {
    constructor() {
        this.todos = [];
        this.nextId = 1;
    }

    create(title) {
        if (!title || title.trim() === '') {
            throw new Error('Tiêu đề không được rỗng');
        }
        const todo = {
            id: this.nextId++,
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        this.todos.push(todo);
        return todo;
    }

    findAll() {
        return [...this.todos];
    }

    findById(id) {
        return this.todos.find((t) => t.id === id) || null;
    }

    update(id, updates) {
        const todo = this.findById(id);
        if (!todo) {
            throw new Error('Todo không tồn tại');
        }
        if (updates.title !== undefined) {
            if (!updates.title.trim()) {
                throw new Error('Tiêu đề không được rỗng');
            }
            todo.title = updates.title.trim();
        }
        if (updates.completed !== undefined) {
            todo.completed = Boolean(updates.completed);
        }
        return todo;
    }

    delete(id) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1) {
            throw new Error('Todo không tồn tại');
        }
        return this.todos.splice(index, 1)[0];
    }
}

module.exports = { TodoStore };
