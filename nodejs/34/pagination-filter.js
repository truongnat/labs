// Bài 34: Phân trang (Pagination), Sắp xếp (Sort) và Lọc (Filter) trong Mongoose
// Demo in-memory — cùng pattern với Mongoose find().skip().limit().sort()
// Chạy bằng lệnh: node pagination-filter.js

// Trong production dùng Mongoose:
//   User.find(filter).sort(sort).skip(skip).limit(limit)
// Demo này mô phỏng để chạy không cần MongoDB

const products = [
    { _id: '1', name: 'iPhone 15', category: 'phone', price: 25000000, stock: 10 },
    { _id: '2', name: 'Samsung S24', category: 'phone', price: 22000000, stock: 5 },
    { _id: '3', name: 'MacBook Pro', category: 'laptop', price: 45000000, stock: 3 },
    { _id: '4', name: 'Dell XPS', category: 'laptop', price: 32000000, stock: 8 },
    { _id: '5', name: 'AirPods Pro', category: 'accessory', price: 5500000, stock: 20 },
    { _id: '6', name: 'iPad Air', category: 'tablet', price: 18000000, stock: 12 },
    { _id: '7', name: 'Logitech MX', category: 'accessory', price: 2500000, stock: 15 },
    { _id: '8', name: 'ThinkPad X1', category: 'laptop', price: 38000000, stock: 4 },
];

// Xây filter object giống Mongoose query syntax
function buildFilter(query) {
    const filter = {};

    // Lọc theo category — tương đương { category: 'phone' }
    if (query.category) {
        filter.category = query.category;
    }

    // Lọc khoảng giá — tương đương { price: { $gte: min, $lte: max } }
    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = Number(query.minPrice);
        if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    // Tìm theo tên (case-insensitive) — tương đương { name: { $regex: q, $options: 'i' } }
    if (query.q) {
        filter.name = { $regex: query.q, $options: 'i' };
    }

    return filter;
}

function matchFilter(item, filter) {
    for (const [key, value] of Object.entries(filter)) {
        if (key === 'name' && value.$regex) {
            const re = new RegExp(value.$regex, value.$options || '');
            if (!re.test(item.name)) return false;
        } else if (typeof value === 'object' && value !== null) {
            if (value.$gte !== undefined && item[key] < value.$gte) return false;
            if (value.$lte !== undefined && item[key] > value.$lte) return false;
        } else if (item[key] !== value) {
            return false;
        }
    }
    return true;
}

function parseSort(sortStr) {
    // sort=-price,name → sắp xếp price giảm dần, rồi name tăng dần
    if (!sortStr) return [['name', 1]];

    return sortStr.split(',').map((field) => {
        if (field.startsWith('-')) return [field.slice(1), -1];
        return [field, 1];
    });
}

function applySort(items, sortFields) {
    return [...items].sort((a, b) => {
        for (const [field, dir] of sortFields) {
            if (a[field] < b[field]) return -1 * dir;
            if (a[field] > b[field]) return 1 * dir;
        }
        return 0;
    });
}

function paginate(collection, query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 5));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);
    let results = collection.filter((item) => matchFilter(item, filter));
    results = applySort(results, parseSort(query.sort));

    const total = results.length;
    const data = results.slice(skip, skip + limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
}

// --- Demo các truy vấn ---

console.log('=== 1. Trang 1, 3 sản phẩm/trang ===');
console.log(JSON.stringify(paginate(products, { page: 1, limit: 3 }), null, 2));

console.log('\n=== 2. Lọc category=phone, sort=-price ===');
console.log(JSON.stringify(paginate(products, { category: 'phone', sort: '-price' }), null, 2));

console.log('\n=== 3. Lọc giá 5tr–30tr, tìm "pro" ===');
console.log(
    JSON.stringify(paginate(products, { minPrice: 5000000, maxPrice: 30000000, q: 'pro' }), null, 2)
);

console.log('\n=== Mongoose tương đương (khi có MongoDB) ===');
console.log(`
const page = 1, limit = 10;
const skip = (page - 1) * limit;

const result = await Product.find({ category: 'phone', price: { $gte: 5000000 } })
  .sort({ price: -1 })
  .skip(skip)
  .limit(limit);

const total = await Product.countDocuments({ category: 'phone' });
`);
