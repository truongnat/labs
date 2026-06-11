// Bài 60: Memory Leak demo và pattern fix
// Rò rỉ bộ nhớ thường do: global array tích lũy, listener không remove, closure giữ reference
// Chạy bằng lệnh: node memory-leak.js

const { EventEmitter } = require('events');

// --- PHẦN 1: Demo Memory Leak ---
function demoMemoryLeak() {
    console.log('\n=== DEMO MEMORY LEAK ===');

    const leakStore = []; // Global array - không bao giờ được giải phóng

    const interval = setInterval(() => {
        // Mỗi giây thêm 1MB vào array - memory tăng liên tục
        leakStore.push(Buffer.alloc(1024 * 1024, 'X'));
        const mem = process.memoryUsage();
        console.log(`[LEAK] heapUsed: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB | items: ${leakStore.length}`);
    }, 500);

    // Dừng sau 3 giây để demo (production sẽ leak đến khi crash)
    return new Promise((resolve) => {
        setTimeout(() => {
            clearInterval(interval);
            console.log('[LEAK] Dừng demo - trong thực tế app sẽ OOM crash');
            leakStore.length = 0; // Cleanup cho demo
            resolve();
        }, 3000);
    });
}

// --- PHẦN 2: Memory Leak từ EventEmitter listener ---
function demoListenerLeak() {
    console.log('\n=== DEMO LISTENER LEAK ===');

    const emitter = new EventEmitter();
    emitter.setMaxListeners(5); // Cảnh báo sớm khi quá nhiều listener

    for (let i = 0; i < 10; i++) {
        const handler = () => { /* closure giữ reference */ };
        emitter.on('data', handler);
        // BUG: không bao giờ removeListener -> leak
    }

    console.log(`Số listener trên 'data': ${emitter.listenerCount('data')}`);
    console.log('FIX: dùng emitter.off() hoặc once() khi không cần nữa');
}

// --- PHẦN 3: Pattern FIX ---
function demoFixedPattern() {
    console.log('\n=== PATTERN FIX ===');

    const cache = new Map();
    const MAX_CACHE_SIZE = 100;

    function addToCache(key, value) {
        // Fix 1: Giới hạn kích thước cache (LRU-like)
        if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        cache.set(key, value);
    }

    const emitter = new EventEmitter();
    const handler = (data) => console.log('Nhận:', data);

    emitter.on('data', handler);
    emitter.emit('data', 'test');
    emitter.off('data', handler); // Fix 2: Remove listener khi done
    console.log(`Listener sau cleanup: ${emitter.listenerCount('data')}`);

    // Fix 3: WeakRef cho object lớn (Node 14+)
    let bigObject = { data: Buffer.alloc(1024) };
    const weakRef = new WeakRef(bigObject);
    bigObject = null; // Cho phép GC thu hồi

    console.log('WeakRef còn sống:', weakRef.deref() !== undefined);

    // Fix 4: Monitor memory định kỳ
    const memBefore = process.memoryUsage().heapUsed;
    for (let i = 0; i < 50; i++) addToCache(`key-${i}`, `value-${i}`);
    const memAfter = process.memoryUsage().heapUsed;
    console.log(`Cache size: ${cache.size}, memory delta: ${((memAfter - memBefore) / 1024).toFixed(1)} KB`);
}

async function main() {
    console.log('Memory ban đầu:', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1), 'MB');
    await demoMemoryLeak();
    demoListenerLeak();
    demoFixedPattern();
    console.log('\nMemory sau fix:', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1), 'MB');
    console.log('\nDebug tools: node --inspect, Chrome DevTools Memory tab, clinic.js');
}

main();
