// Bài 81: Service - Repository Pattern
// Tách biệt: Repository (data access) | Service (business logic) | Controller (HTTP)
// Chạy demo: node 81/service-repository.js

// === REPOSITORY LAYER — chỉ lo truy cập dữ liệu ===
class UserRepository {
    constructor(db = new Map()) {
        this.db = db; // In-memory Map thay cho MongoDB
        this.nextId = 1;
    }

    async findAll() {
        return Array.from(this.db.values());
    }

    async findById(id) {
        return this.db.get(id) || null;
    }

    async create(data) {
        const user = { id: this.nextId++, ...data, createdAt: new Date() };
        this.db.set(user.id, user);
        return user;
    }

    async update(id, data) {
        const user = this.db.get(id);
        if (!user) return null;
        const updated = { ...user, ...data, updatedAt: new Date() };
        this.db.set(id, updated);
        return updated;
    }

    async delete(id) {
        const user = this.db.get(id);
        if (!user) return false;
        this.db.delete(id);
        return true;
    }
}

// === SERVICE LAYER — business logic, validation ===
class UserService {
    constructor(userRepository) {
        this.userRepo = userRepository;
    }

    async registerUser(name, email) {
        if (!name || !email) {
            throw new Error('name và email là bắt buộc');
        }
        if (!email.includes('@')) {
            throw new Error('Email không hợp lệ');
        }

        const existing = (await this.userRepo.findAll()).find(
            (u) => u.email === email
        );
        if (existing) {
            throw new Error('Email đã được sử dụng');
        }

        return this.userRepo.create({ name, email, role: 'user' });
    }

    async getUserProfile(id) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error('User không tồn tại');
        }
        // Không trả password (nếu có) — business rule
        const { password, ...profile } = user;
        return profile;
    }

    async deactivateUser(id) {
        const user = await this.userRepo.findById(id);
        if (!user) throw new Error('User không tồn tại');
        return this.userRepo.update(id, { active: false });
    }
}

// === CONTROLLER LAYER — nhận HTTP request, gọi Service ===
function createUserController(userService) {
    return {
        async register(req, res) {
            try {
                const user = await userService.registerUser(
                    req.body.name,
                    req.body.email
                );
                res.status(201).json(user);
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        },

        async getProfile(req, res) {
            try {
                const user = await userService.getUserProfile(
                    Number(req.params.id)
                );
                res.json(user);
            } catch (err) {
                res.status(404).json({ error: err.message });
            }
        },
    };
}

// === DEMO ===
async function demo() {
    const repo = new UserRepository();
    const service = new UserService(repo);
    const controller = createUserController(service);

    // Mô phỏng HTTP request/response
    const mockRes = () => {
        const res = { statusCode: 200, body: null };
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };
        res.json = (data) => {
            res.body = data;
            return res;
        };
        return res;
    };

    const req1 = { body: { name: 'An', email: 'an@test.com' } };
    const res1 = mockRes();
    await controller.register(req1, res1);
    console.log('Register:', res1.statusCode, res1.body);

    const req2 = { params: { id: '1' } };
    const res2 = mockRes();
    await controller.getProfile(req2, res2);
    console.log('Profile:', res2.body);

    // Email trùng — business rule từ Service
    const req3 = { body: { name: 'B', email: 'an@test.com' } };
    const res3 = mockRes();
    await controller.register(req3, res3);
    console.log('Duplicate email:', res3.statusCode, res3.body);
}

if (require.main === module) {
    demo();
}

module.exports = {
    UserRepository,
    UserService,
    createUserController,
};
