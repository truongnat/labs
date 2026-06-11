// Bài 96: E-commerce Cart - Giữ chỗ inventory 15 phút
// Khi thêm vào giỏ, stock bị hold; hết hạn tự trả lại kho
// Chạy bằng lệnh: node cart-inventory-hold.js
// Demo: curl -X POST http://localhost:3096/api/carts -H "Content-Type: application/json" -d '{"userId":"u1"}'

const http = require('http');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3096;
const HOLD_MINUTES = Number(process.env.HOLD_MINUTES || 15);
const HOLD_MS = HOLD_MINUTES * 60 * 1000;

// === In-memory inventory ===
const products = new Map([
    ['p1', { id: 'p1', name: 'Áo thun Node.js', price: 299000, stock: 10 }],
    ['p2', { id: 'p2', name: 'Mũ Developer', price: 150000, stock: 5 }],
    ['p3', { id: 'p3', name: 'Sticker Pack', price: 49000, stock: 100 }]
]);

const carts = new Map();      // cartId -> cart object
const holds = new Map();      // holdId -> { cartId, productId, qty, expiresAt, timer }
const userCarts = new Map();  // userId -> cartId

function availableStock(productId) {
    const product = products.get(productId);
    if (!product) return 0;

    let held = 0;
    for (const hold of holds.values()) {
        if (hold.productId === productId) held += hold.qty;
    }
    return product.stock - held;
}

function createCart(userId) {
    const cartId = randomUUID();
    const cart = {
        id: cartId,
        userId,
        items: [],
        holds: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + HOLD_MS).toISOString()
    };
    carts.set(cartId, cart);
    userCarts.set(userId, cartId);
    return cart;
}

function getOrCreateCart(userId) {
    const existingId = userCarts.get(userId);
    if (existingId && carts.has(existingId)) {
        const cart = carts.get(existingId);
        if (cart.status === 'active') return cart;
    }
    return createCart(userId);
}

function scheduleHoldRelease(holdId) {
    const hold = holds.get(holdId);
    if (!hold) return;

    const delay = Math.max(0, hold.expiresAt - Date.now());
    hold.timer = setTimeout(() => releaseHold(holdId, 'expired'), delay);
}

function releaseHold(holdId, reason = 'manual') {
    const hold = holds.get(holdId);
    if (!hold) return;

    if (hold.timer) clearTimeout(hold.timer);

    const cart = carts.get(hold.cartId);
    if (cart) {
        cart.items = cart.items.filter((item) => item.holdId !== holdId);
        cart.holds = cart.holds.filter((id) => id !== holdId);
        if (cart.items.length === 0 && cart.status === 'active') {
            cart.status = 'expired';
        }
    }

    holds.delete(holdId);
    console.log(`[Hold] Trả stock ${hold.productId} x${hold.qty} (${reason})`);
}

function addToCart(cartId, productId, qty) {
    const cart = carts.get(cartId);
    const product = products.get(productId);

    if (!cart || cart.status !== 'active') {
        throw new Error('Giỏ hàng không hợp lệ hoặc đã hết hạn');
    }
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (qty < 1) throw new Error('Số lượng phải >= 1');

    const available = availableStock(productId);
    if (qty > available) {
        throw new Error(`Không đủ hàng. Còn ${available} (đã trừ hold)`);
    }

    const holdId = randomUUID();
    const expiresAt = Date.now() + HOLD_MS;

    holds.set(holdId, {
        holdId,
        cartId,
        productId,
        qty,
        expiresAt,
        timer: null
    });

    scheduleHoldRelease(holdId);

    cart.items.push({
        holdId,
        productId,
        name: product.name,
        price: product.price,
        qty,
        holdExpiresAt: new Date(expiresAt).toISOString()
    });
    cart.holds.push(holdId);
    cart.expiresAt = new Date(expiresAt).toISOString();

    return { cart, holdId, availableAfter: availableStock(productId) };
}

function checkout(cartId) {
    const cart = carts.get(cartId);
    if (!cart || cart.status !== 'active') {
        throw new Error('Giỏ hàng không hợp lệ');
    }
    if (cart.items.length === 0) {
        throw new Error('Giỏ hàng trống');
    }

    let total = 0;
    for (const item of cart.items) {
        const product = products.get(item.productId);
        if (availableStock(item.productId) < item.qty) {
            throw new Error(`Sản phẩm ${item.name} không còn đủ hàng`);
        }
        product.stock -= item.qty;
        total += product.price * item.qty;
        releaseHold(item.holdId, 'checkout');
    }

    cart.status = 'checked_out';
    cart.checkedOutAt = new Date().toISOString();
    cart.total = total;

    return cart;
}

function serializeProduct(product) {
    return {
        ...product,
        available: availableStock(product.id),
        held: product.stock - availableStock(product.id)
    };
}

// === HTTP API ===
function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch { reject(new Error('JSON không hợp lệ')); }
        });
        req.on('error', reject);
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    try {
        if (req.method === 'GET' && url.pathname === '/api/products') {
            const list = [...products.values()].map(serializeProduct);
            return sendJson(res, 200, { holdMinutes: HOLD_MINUTES, products: list });
        }

        if (req.method === 'POST' && url.pathname === '/api/carts') {
            const body = await readBody(req);
            if (!body.userId) return sendJson(res, 400, { error: 'Cần userId' });
            const cart = getOrCreateCart(body.userId);
            return sendJson(res, 201, { cart, holdMinutes: HOLD_MINUTES });
        }

        if (req.method === 'POST' && url.pathname.match(/^\/api\/carts\/[^/]+\/items$/)) {
            const cartId = url.pathname.split('/')[3];
            const body = await readBody(req);
            const result = addToCart(cartId, body.productId, body.qty || 1);
            return sendJson(res, 200, result);
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/carts/')) {
            const cartId = url.pathname.split('/')[3];
            const cart = carts.get(cartId);
            if (!cart) return sendJson(res, 404, { error: 'Giỏ không tồn tại' });
            return sendJson(res, 200, { cart, holdMinutes: HOLD_MINUTES });
        }

        if (req.method === 'POST' && url.pathname.match(/^\/api\/carts\/[^/]+\/checkout$/)) {
            const cartId = url.pathname.split('/')[3];
            const cart = checkout(cartId);
            return sendJson(res, 200, { message: 'Thanh toán thành công', cart });
        }

        if (req.method === 'GET' && url.pathname === '/health') {
            return sendJson(res, 200, {
                status: 'ok',
                activeCarts: [...carts.values()].filter((c) => c.status === 'active').length,
                activeHolds: holds.size
            });
        }

        sendJson(res, 404, {
            error: 'Not found',
            routes: [
                'GET /api/products',
                'POST /api/carts { userId }',
                'POST /api/carts/:id/items { productId, qty }',
                'GET /api/carts/:id',
                'POST /api/carts/:id/checkout'
            ]
        });
    } catch (err) {
        sendJson(res, 400, { error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Cart + Inventory Hold chạy tại http://localhost:${PORT}`);
    console.log(`Hold time: ${HOLD_MINUTES} phút`);
    console.log('GET /api/products  |  POST /api/carts  |  POST /api/carts/:id/items  |  POST /api/carts/:id/checkout');
});
