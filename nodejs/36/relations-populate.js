// Bài 36: Quan hệ 1-N và N-N — mô phỏng Mongoose populate (in-memory)
// 1-N: User → Posts | N-N: Post ↔ Tags (qua bảng trung gian)
// Chạy bằng lệnh: node relations-populate.js

// --- In-memory "collections" ---

const users = [
    { _id: 'u1', name: 'Alice', email: 'alice@test.com' },
    { _id: 'u2', name: 'Bob', email: 'bob@test.com' },
];

const posts = [
    { _id: 'p1', title: 'Học Node.js', authorId: 'u1', tagIds: ['t1', 't2'] },
    { _id: 'p2', title: 'Mongoose Populate', authorId: 'u1', tagIds: ['t2'] },
    { _id: 'p3', title: 'PostgreSQL vs Mongo', authorId: 'u2', tagIds: ['t1', 't3'] },
];

const tags = [
    { _id: 't1', name: 'nodejs' },
    { _id: 't2', name: 'mongodb' },
    { _id: 't3', name: 'sql' },
];

// populate(path, select) — giống Mongoose .populate('author').populate('tags')
function populate(doc, path, selectFields) {
    const copy = { ...doc };

    if (path === 'author') {
        const author = users.find((u) => u._id === doc.authorId);
        copy.author = selectFields ? pick(author, selectFields) : author;
    }

    if (path === 'tags') {
        copy.tags = doc.tagIds
            .map((id) => tags.find((t) => t._id === id))
            .filter(Boolean)
            .map((t) => (selectFields ? pick(t, selectFields) : t));
    }

    return copy;
}

function pick(obj, fields) {
    if (!obj) return null;
    const keys = fields.split(' ');
    return keys.reduce((acc, k) => {
        acc[k] = obj[k];
        return acc;
    }, {});
}

// --- Demo quan hệ 1-N: User có nhiều Posts ---

console.log('=== Quan hệ 1-N: Posts của user u1 ===');
const userPosts = posts.filter((p) => p.authorId === 'u1');
console.log(
    userPosts.map((p) => populate(p, 'author', 'name email'))
);

// --- Demo populate nhiều level ---

console.log('\n=== Populate author + tags (N-N qua tagIds) ===');
const postWithRelations = posts
    .filter((p) => p._id === 'p1')
    .map((p) => {
        let result = populate(p, 'author', 'name');
        result = populate(result, 'tags', 'name');
        return result;
    });
console.log(JSON.stringify(postWithRelations[0], null, 2));

// --- Mongoose tương đương ---

console.log('\n=== Mongoose schema tương đương ===');
console.log(`
// 1-N: Post thuộc 1 User
const postSchema = new Schema({
  title: String,
  author: { type: ObjectId, ref: 'User' }  // foreign key
});

// N-N: Post có nhiều Tag, Tag có nhiều Post
const postSchema = new Schema({
  tags: [{ type: ObjectId, ref: 'Tag' }]
});

await Post.findById(id)
  .populate('author', 'name email')
  .populate('tags', 'name');
`);
