// Bài 73: gRPC Server (phần Server)
// gRPC dùng HTTP/2 + Protocol Buffers - nhanh, type-safe cho microservices nội bộ
// Chạy bằng lệnh: node grpc-server.js
// Cài đặt: npm install @grpc/grpc-js @grpc/proto-loader
// Client: node grpc-client.js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'hello.proto');

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

// Implement service methods
function sayHello(call, callback) {
    const name = call.request.name || 'World';
    callback(null, { message: `Xin chào, ${name}! (gRPC)` });
}

function sayHelloStream(call) {
    const name = call.request.name || 'World';
    let count = 0;

    const interval = setInterval(() => {
        count++;
        call.write({ message: `Stream #${count} cho ${name}` });
        if (count >= 3) {
            clearInterval(interval);
            call.end();
        }
    }, 500);
}

function main() {
    const server = new grpc.Server();

    server.addService(helloProto.Greeter.service, {
        SayHello: sayHello,
        SayHelloStream: sayHelloStream
    });

    const PORT = '50051';
    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
            if (err) {
                console.error('Lỗi bind:', err.message);
                return;
            }
            server.start();
            console.log(`gRPC server chạy tại localhost:${port}`);
            console.log('Chạy client: node grpc-client.js');
        }
    );
}

main();
