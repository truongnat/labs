// Bài 73: gRPC Client (phần Client)
// Client gọi RPC methods trên server - unary và server streaming
// Chạy bằng lệnh: node grpc-client.js
// (Cần chạy server trước: node grpc-server.js)

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'hello.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

const client = new helloProto.Greeter(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

// Unary RPC - 1 request, 1 response
client.SayHello({ name: 'Node.js Developer' }, (err, response) => {
    if (err) {
        console.error('Lỗi (server chưa chạy?):', err.message);
        console.log('Hãy chạy: node grpc-server.js');
        process.exit(1);
    }
    console.log('Unary response:', response.message);
});

// Server streaming RPC - 1 request, nhiều responses
const stream = client.SayHelloStream({ name: 'Streamer' });

stream.on('data', (response) => {
    console.log('Stream data:', response.message);
});

stream.on('end', () => {
    console.log('Stream kết thúc');
});

stream.on('error', (err) => {
    console.error('Stream error:', err.message);
});
