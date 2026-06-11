// Bài 37: Transaction trong Database — Rollback khi có lỗi
// Demo in-memory mô phỏng BEGIN / COMMIT / ROLLBACK
// Chạy bằng lệnh: node transactions-demo.js

const accounts = new Map([
    ['A', 1000],
    ['B', 500],
]);

// Transaction context — snapshot state trước khi thay đổi để rollback
class Transaction {
    constructor(store) {
        this.store = store;
        this.snapshot = new Map(store);
        this.active = true;
    }

    getBalance(id) {
        this.ensureActive();
        return this.store.get(id) ?? 0;
    }

    transfer(from, to, amount) {
        this.ensureActive();

        if (amount <= 0) throw new Error('Số tiền phải > 0');
        if (this.getBalance(from) < amount) throw new Error('Số dư không đủ');

        this.store.set(from, this.getBalance(from) - amount);
        this.store.set(to, this.getBalance(to) + amount);
    }

    commit() {
        this.ensureActive();
        this.active = false;
        console.log('  ✅ COMMIT — thay đổi được lưu vĩnh viễn');
    }

    rollback() {
        if (!this.active) return;
        for (const [k, v] of this.snapshot) {
            this.store.set(k, v);
        }
        this.active = false;
        console.log('  ↩️  ROLLBACK — khôi phục snapshot ban đầu');
    }

    ensureActive() {
        if (!this.active) throw new Error('Transaction đã kết thúc');
    }
}

function printBalances(label) {
    console.log(`  ${label}: A=${accounts.get('A')}, B=${accounts.get('B')}`);
}

console.log('=== Ban đầu ===');
printBalances('Số dư');

// --- Case 1: Transfer thành công → COMMIT ---
console.log('\n--- Case 1: Chuyển 200 A→B (thành công) ---');
const tx1 = new Transaction(accounts);
try {
    tx1.transfer('A', 'B', 200);
    tx1.commit();
} catch (err) {
    tx1.rollback();
    console.error('  Lỗi:', err.message);
}
printBalances('Sau commit');

// --- Case 2: Transfer thất bại → ROLLBACK ---
console.log('\n--- Case 2: Chuyển 9999 A→B (số dư không đủ) ---');
const tx2 = new Transaction(accounts);
try {
    tx2.transfer('A', 'B', 9999);
    tx2.commit();
} catch (err) {
    console.log('  ⚠️  Lỗi trong transaction:', err.message);
    tx2.rollback();
}
printBalances('Sau rollback — số dư không đổi');

console.log('\n=== Postgres / Mongoose tương đương ===');
console.log(`
// PostgreSQL (pg)
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [200, 'A']);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [200, 'B']);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}

// Mongoose
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Account.updateOne({ id: 'A' }, { $inc: { balance: -200 } }).session(session);
  await Account.updateOne({ id: 'B' }, { $inc: { balance: 200 } }).session(session);
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
`);
