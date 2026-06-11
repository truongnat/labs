// Bài 69: Distributed Lock - xử lý Race Condition khi mua hàng
// Nhiều user cùng mua 1 sản phẩm cuối cùng -> cần lock để tránh oversell
// Chạy bằng lệnh: node distributed-lock.js

const { EventEmitter } = require('events');

// In-memory Distributed Lock (production: Redis SET NX EX + Lua script)
class InMemoryLock {
    constructor() {
        this.locks = new Map(); // key -> { owner, expiresAt }
    }

    async acquire(key, ttlMs = 5000, owner = `pid-${process.pid}-${Date.now()}`) {
        const now = Date.now();
        const existing = this.locks.get(key);

        if (existing && existing.expiresAt > now) {
            return null; // Lock đang bị giữ
        }

        this.locks.set(key, { owner, expiresAt: now + ttlMs });
        return owner;
    }

    async release(key, owner) {
        const lock = this.locks.get(key);
        if (lock && lock.owner === owner) {
            this.locks.delete(key);
            return true;
        }
        return false;
    }
}

// Mock Redis lock pattern
class RedisLockPattern {
    constructor() {
        this.store = new Map();
    }

    // SET key value NX EX ttl - atomic acquire
    async acquire(key, ttlSec = 5) {
        const token = `${Date.now()}-${Math.random()}`;
        if (this.store.has(key)) return null;

        this.store.set(key, { token, expires: Date.now() + ttlSec * 1000 });
        setTimeout(() => this.store.delete(key), ttlSec * 1000);
        return token;
    }

    async release(key, token) {
        const lock = this.store.get(key);
        if (lock && lock.token === token) {
            this.store.delete(key);
        }
    }
}

const lock = new InMemoryLock();
let inventory = { 'product-1': 1 }; // Chỉ còn 1 sản phẩm

// --- BUG: Không có lock -> oversell ---
async function purchaseWithoutLock(userId) {
    await new Promise((r) => setTimeout(r, Math.random() * 50));

    if (inventory['product-1'] > 0) {
        await new Promise((r) => setTimeout(r, 10)); // Simulate DB write
        inventory['product-1']--;
        return { success: true, userId };
    }
    return { success: false, userId, reason: 'Hết hàng' };
}

// --- FIX: Có distributed lock ---
async function purchaseWithLock(userId) {
    const lockKey = 'lock:product-1';
    const owner = await lock.acquire(lockKey, 3000);

    if (!owner) {
        return { success: false, userId, reason: 'Đang có người mua, thử lại' };
    }

    try {
        await new Promise((r) => setTimeout(r, Math.random() * 50));

        if (inventory['product-1'] > 0) {
            await new Promise((r) => setTimeout(r, 10));
            inventory['product-1']--;
            return { success: true, userId };
        }
        return { success: false, userId, reason: 'Hết hàng' };
    } finally {
        await lock.release(lockKey, owner); // Luôn release lock
    }
}

async function simulateRace(name, purchaseFn, resetInventory) {
    console.log(`\n=== ${name} ===`);
    resetInventory();

    const users = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const results = await Promise.all(users.map((u) => purchaseFn(u)));

    const success = results.filter((r) => r.success);
    console.log('Kết quả:', results.map((r) => `${r.userId}: ${r.success ? 'MUA OK' : r.reason}`).join(' | '));
    console.log(`Số người mua thành công: ${success.length}, inventory còn: ${inventory['product-1']}`);

    if (success.length > 1) {
        console.log('⚠️  OVERSOLD - race condition!');
    } else {
        console.log('✓ An toàn');
    }
}

async function main() {
    await simulateRace('KHÔNG có lock (có thể oversell)', purchaseWithoutLock, () => {
        inventory['product-1'] = 1;
    });

    await simulateRace('CÓ lock (an toàn)', purchaseWithLock, () => {
        inventory['product-1'] = 1;
    });

    console.log('\nProduction: Redis SET lock:product-1 token NX EX 5');
    console.log('Release: Lua script check token trước khi DEL (tránh xóa lock của process khác)');
}

main();
