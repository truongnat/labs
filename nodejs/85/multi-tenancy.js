// Bài 85: Multi-tenancy SaaS Demo
// Nhiều khách hàng (tenant) dùng chung 1 app, data tách biệt
// Chiến lược: Shared DB + tenant_id column (phổ biến nhất)
// Chạy demo: node 85/multi-tenancy.js

const express = require('express');

// === TENANT CONTEXT — xác định tenant từ request ===
// Production: subdomain (acme.app.com), header (X-Tenant-ID), hoặc JWT claim

function tenantMiddleware(req, res, next) {
    const tenantId =
        req.headers['x-tenant-id'] ||
        req.query.tenant ||
        'default';

    if (!tenantId) {
        return res.status(400).json({ error: 'Thiếu tenant ID' });
    }

    req.tenantId = tenantId;
    next();
}

// === DATA LAYER — mỗi record gắn tenant_id ===
class TenantAwareStore {
    constructor() {
        // { tenantId: { collection: [records] } }
        this.data = new Map();
    }

    _getTenantData(tenantId) {
        if (!this.data.has(tenantId)) {
            this.data.set(tenantId, { users: [], orders: [] });
        }
        return this.data.get(tenantId);
    }

    createUser(tenantId, user) {
        const tenant = this._getTenantData(tenantId);
        const record = { id: tenant.users.length + 1, tenantId, ...user };
        tenant.users.push(record);
        return record;
    }

    getUsers(tenantId) {
        return this._getTenantData(tenantId).users;
    }

    createOrder(tenantId, order) {
        const tenant = this._getTenantData(tenantId);
        const record = { id: tenant.orders.length + 1, tenantId, ...order };
        tenant.orders.push(record);
        return record;
    }

    getOrders(tenantId) {
        return this._getTenantData(tenantId).orders;
    }
}

const store = new TenantAwareStore();

// === EXPRESS APP ===
const app = express();
app.use(express.json());
app.use(tenantMiddleware);

// Mỗi route tự động scope theo req.tenantId
app.get('/users', (req, res) => {
    res.json({
        tenant: req.tenantId,
        users: store.getUsers(req.tenantId),
    });
});

app.post('/users', (req, res) => {
    const user = store.createUser(req.tenantId, req.body);
    res.status(201).json(user);
});

app.get('/orders', (req, res) => {
    res.json({
        tenant: req.tenantId,
        orders: store.getOrders(req.tenantId),
    });
});

app.post('/orders', (req, res) => {
    const order = store.createOrder(req.tenantId, req.body);
    res.status(201).json(order);
});

// === DEMO tự chạy khi start ===
async function runDemo() {
    const PORT = process.env.PORT || 3085;

    return new Promise((resolve) => {
        const server = app.listen(PORT, async () => {
            console.log(`Multi-tenant SaaS demo: http://localhost:${PORT}`);
            console.log('Header: X-Tenant-ID: acme | globex\n');

            // Mô phỏng 2 tenant dùng chung app
            const tenants = ['acme', 'globex'];
            for (const tenant of tenants) {
                store.createUser(tenant, {
                    name: `Admin ${tenant}`,
                    email: `admin@${tenant}.com`,
                });
                store.createOrder(tenant, {
                    product: 'Gói Pro',
                    amount: tenant === 'acme' ? 99000 : 199000,
                });
            }

            console.log('Tenant ACME users:', store.getUsers('acme'));
            console.log('Tenant GLOBEX users:', store.getUsers('globex'));
            console.log('\nTest với curl:');
            console.log(`  curl -H "X-Tenant-ID: acme" http://localhost:${PORT}/users`);
            console.log(`  curl -H "X-Tenant-ID: globex" http://localhost:${PORT}/orders`);

            resolve(server);
        });
    });
}

if (require.main === module) {
    runDemo();
}

module.exports = { app, TenantAwareStore, tenantMiddleware };
