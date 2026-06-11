// Bài 35: Kết nối PostgreSQL (pg) — demo SQLite khi không có Postgres
// Pattern Pool.query() giống pg — chạy standalone không cần server DB
// Chạy bằng lệnh: cd 35 && npm install && node postgres-connect.js

const Database = require('better-sqlite3');
const path = require('path');

// Trong production với PostgreSQL:
//   const { Pool } = require('pg');
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//   const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

const DB_PATH = path.join(__dirname, 'demo.db');
const db = new Database(DB_PATH);

// Pool giả lập — API giống pg để dễ migrate sang Postgres thật
const pool = {
    query(sql, params = []) {
        // Chuyển placeholder $1, $2 → ? cho SQLite
        let index = 0;
        const sqliteSql = sql.replace(/\$(\d+)/g, () => {
            index += 1;
            return '?';
        });

        const stmt = db.prepare(sqliteSql);

        if (/^\s*SELECT/i.test(sql)) {
            const rows = stmt.all(...params);
            return { rows, rowCount: rows.length };
        }

        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
    },

    async end() {
        db.close();
    },
};

async function setupSchema() {
    pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
}

async function seedData() {
    pool.query('DELETE FROM users');
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['Nguyễn Văn A', 'a@test.com']);
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['Trần Thị B', 'b@test.com']);
}

async function demo() {
    console.log('📦 Demo kết nối DB (SQLite thay Postgres — cùng pattern pg.query)\n');

    await setupSchema();
    await seedData();

    // SELECT với parameterized query — chống SQL injection
    const all = pool.query('SELECT * FROM users ORDER BY id');
    console.log('Tất cả users:', all.rows);

    const one = pool.query('SELECT * FROM users WHERE email = $1', ['a@test.com']);
    console.log('Tìm theo email:', one.rows[0]);

    // INSERT
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['Lê Văn C', 'c@test.com']);
    console.log('Sau INSERT:', pool.query('SELECT COUNT(*) as count FROM users').rows[0]);

    await pool.end();
    console.log('\n✅ Hoàn tất. Migrate sang Postgres: đổi Pool + connectionString, giữ nguyên $1 placeholders.');
}

demo().catch((err) => {
    console.error('Lỗi:', err.message);
    process.exit(1);
});
