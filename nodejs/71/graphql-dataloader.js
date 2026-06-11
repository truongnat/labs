// Bài 71: GraphQL Resolvers + DataLoader - fix N+1 Problem
// N+1: query 100 posts -> 1 query posts + 100 queries authors (chậm!)
// DataLoader batch + cache requests trong 1 tick event loop
// Chạy bằng lệnh: node graphql-dataloader.js
// Cài đặt: npm install @apollo/server graphql dataloader

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const DataLoader = require('dataloader');

// Mock database với query counter
let queryCount = 0;

function dbQuery(sql) {
    queryCount++;
    console.log(`  [DB Query #${queryCount}] ${sql}`);
}

const posts = [
    { id: '1', title: 'GraphQL là gì?', authorId: '1' },
    { id: '2', title: 'N+1 Problem', authorId: '2' },
    { id: '3', title: 'DataLoader pattern', authorId: '1' }
];

const authors = [
    { id: '1', name: 'Nguyễn Văn A' },
    { id: '2', name: 'Trần Thị B' }
];

const typeDefs = `#graphql
    type Author {
        id: ID!
        name: String!
    }

    type Post {
        id: ID!
        title: String!
        author: Author!
    }

    type Query {
        posts: [Post!]!
    }
`;

function createLoaders() {
    // DataLoader batch load authors theo IDs
    const authorLoader = new DataLoader(async (authorIds) => {
        dbQuery(`SELECT * FROM authors WHERE id IN (${authorIds.join(',')})`);
        return authorIds.map((id) => authors.find((a) => a.id === id));
    });

    return { authorLoader };
}

const resolvers = {
    Query: {
        posts: () => {
            dbQuery('SELECT * FROM posts');
            return posts;
        }
    },
    Post: {
        // KHÔNG query DB trực tiếp ở đây - dùng DataLoader
        author: (post, _, { loaders }) => loaders.authorLoader.load(post.authorId)
    }
};

async function main() {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 3471 },
        context: async () => ({
            loaders: createLoaders() // Mỗi request có loaders riêng (cache per-request)
        })
    });

    console.log(`GraphQL DataLoader demo: ${url}`);
    console.log('\nChạy query { posts { id title author { name } } }');
    console.log('Không DataLoader: 1 + N queries | Có DataLoader: 2 queries (posts + batch authors)\n');

    // Demo tự chạy query bằng http built-in
    const http = require('http');
    queryCount = 0;

    await new Promise((resolve, reject) => {
        const body = JSON.stringify({ query: `{ posts { id title author { name } } }` });
        const req = http.request(new URL(url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const parsed = JSON.parse(data);
                console.log('Kết quả:', JSON.stringify(parsed.data, null, 2));
                console.log(`\nTổng DB queries: ${queryCount} (với DataLoader: 2 thay vì 4)`);
                resolve();
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

main().catch(console.error);
