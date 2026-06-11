// Bài 70: GraphQL Apollo Server cơ bản
// GraphQL cho phép client chọn đúng fields cần lấy - 1 endpoint thay nhiều REST routes
// Chạy bằng lệnh: node graphql-basic.js
// Cài đặt: npm install @apollo/server graphql

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema định nghĩa types và operations
const typeDefs = `#graphql
    type User {
        id: ID!
        name: String!
        email: String!
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
    }

    type Mutation {
        createUser(name: String!, email: String!): User!
    }
`;

// Database giả lập
const users = [
    { id: '1', name: 'Nguyễn Văn A', email: 'a@example.com' },
    { id: '2', name: 'Trần Thị B', email: 'b@example.com' }
];

// Resolvers - map GraphQL operations sang logic thực tế
const resolvers = {
    Query: {
        users: () => users,
        user: (_, { id }) => users.find((u) => u.id === id)
    },
    Mutation: {
        createUser: (_, { name, email }) => {
            const user = { id: String(users.length + 1), name, email };
            users.push(user);
            return user;
        }
    }
};

async function main() {
    const server = new ApolloServer({ typeDefs, resolvers });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 3470 }
    });

    console.log(`GraphQL server: ${url}`);
    console.log('\nTest queries tại Apollo Sandbox hoặc curl:');
    console.log(`
curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ users { id name email } }"}'
`);
}

main().catch(console.error);
