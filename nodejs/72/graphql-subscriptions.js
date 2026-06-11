// Bài 72: GraphQL Subscriptions - realtime qua WebSocket
// Client subscribe event, server push khi có thay đổi (chat, notification, stock price)
// Chạy bằng lệnh: node graphql-subscriptions.js
// Cài đặt: npm install @apollo/server graphql graphql-ws ws @graphql-tools/schema

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const express = require('express');
const http = require('http');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';

const typeDefs = `#graphql
    type Message {
        id: ID!
        user: String!
        text: String!
        createdAt: String!
    }

    type Query {
        messages: [Message!]!
    }

    type Mutation {
        sendMessage(user: String!, text: String!): Message!
    }

    type Subscription {
        messageAdded: Message!
    }
`;

const messages = [];

const resolvers = {
    Query: {
        messages: () => messages
    },
    Mutation: {
        sendMessage: (_, { user, text }) => {
            const message = {
                id: String(messages.length + 1),
                user,
                text,
                createdAt: new Date().toISOString()
            };
            messages.push(message);
            pubsub.publish(MESSAGE_ADDED, { messageAdded: message });
            return message;
        }
    },
    Subscription: {
        messageAdded: {
            subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED])
        }
    }
};

async function main() {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const app = express();
    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ]
    });

    await server.start();

    app.use('/graphql', express.json(), expressMiddleware(server));

    const PORT = 3472;
    httpServer.listen(PORT, () => {
        console.log(`GraphQL HTTP:  http://localhost:${PORT}/graphql`);
        console.log(`GraphQL WS:    ws://localhost:${PORT}/graphql`);
        console.log('\nSubscription query:');
        console.log('  subscription { messageAdded { id user text createdAt } }');
        console.log('\nMutation test:');
        console.log('  mutation { sendMessage(user: "Alice", text: "Hello!") { id } }');
    });

    // Demo: tự publish message sau 2s
    setTimeout(() => {
        const msg = {
            id: String(messages.length + 1),
            user: 'system',
            text: 'Auto message từ server demo',
            createdAt: new Date().toISOString()
        };
        messages.push(msg);
        pubsub.publish(MESSAGE_ADDED, { messageAdded: msg });
        console.log('\n[Demo] Published auto message qua subscription');
    }, 2000);
}

main().catch(console.error);
