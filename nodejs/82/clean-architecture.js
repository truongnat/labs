// Bài 82: Clean Architecture / Hexagonal (Ports & Adapters)
// Tầng trong không phụ thuộc tầng ngoài — dependency hướng vào Domain
// Chạy demo: node 82/clean-architecture.js

// ═══════════════════════════════════════════════════════════
// DOMAIN LAYER (Entities + Use Cases) — lõi nghiệp vụ thuần
// Không import Express, Mongoose, hay bất kỳ framework nào
// ═══════════════════════════════════════════════════════════

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

// Port (interface) — định nghĩa contract, không implement
class ProductRepositoryPort {
    async findById() {
        throw new Error('Implement ở Adapter');
    }
    async save() {
        throw new Error('Implement ở Adapter');
    }
}

// Use Case — business logic thuần, inject port qua constructor
class CreateProductUseCase {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }

    async execute({ name, price }) {
        if (!name || price <= 0) {
            throw new Error('Tên và giá hợp lệ là bắt buộc');
        }
        const product = new Product(Date.now(), name, price);
        return this.productRepo.save(product);
    }
}

class GetProductUseCase {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }

    async execute(id) {
        const product = await this.productRepo.findById(id);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        return product;
    }
}

// ═══════════════════════════════════════════════════════════
// ADAPTER LAYER — implement Port, kết nối với thế giới bên ngoài
// ═══════════════════════════════════════════════════════════

// Adapter: In-memory DB (có thể thay bằng MongoAdapter, PostgresAdapter)
class InMemoryProductRepository extends ProductRepositoryPort {
    constructor() {
        super();
        this.store = new Map();
    }

    async findById(id) {
        return this.store.get(id) || null;
    }

    async save(product) {
        this.store.set(product.id, product);
        return product;
    }
}

// Adapter: HTTP (Express) — chuyển HTTP request → Use Case
function createProductHttpAdapter(createUseCase, getUseCase) {
    return {
        async create(req, res) {
            try {
                const product = await createUseCase.execute(req.body);
                res.status(201).json(product);
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        },
        async getById(req, res) {
            try {
                const product = await getUseCase.execute(Number(req.params.id));
                res.json(product);
            } catch (err) {
                res.status(404).json({ error: err.message });
            }
        },
    };
}

// ═══════════════════════════════════════════════════════════
// COMPOSITION ROOT — wiring dependencies (giống main() trong DI)
// ═══════════════════════════════════════════════════════════

function bootstrap() {
    const productRepo = new InMemoryProductRepository();
    const createProduct = new CreateProductUseCase(productRepo);
    const getProduct = new GetProductUseCase(productRepo);
    const httpAdapter = createProductHttpAdapter(createProduct, getProduct);
    return { httpAdapter, productRepo };
}

// === DEMO ===
async function demo() {
    const { httpAdapter } = bootstrap();

    const mockRes = () => {
        const res = { statusCode: 200, body: null };
        res.status = (c) => {
            res.statusCode = c;
            return res;
        };
        res.json = (d) => {
            res.body = d;
            return res;
        };
        return res;
    };

    const createReq = { body: { name: 'Laptop', price: 15000000 } };
    const createRes = mockRes();
    await httpAdapter.create(createReq, createRes);
    console.log('Tạo sản phẩm:', createRes.body);

    const getReq = { params: { id: String(createRes.body.id) } };
    const getRes = mockRes();
    await httpAdapter.getById(getReq, getRes);
    console.log('Lấy sản phẩm:', getRes.body);
}

if (require.main === module) {
    demo();
}

module.exports = {
    Product,
    CreateProductUseCase,
    GetProductUseCase,
    InMemoryProductRepository,
    bootstrap,
};
