// Bài 88: Dockerize Node.js Application
// Dockerfile cho Node.js production

// === Dockerfile ===
/*
# Stage 1: Build (chỉ dùng khi cần build TypeScript)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy dependencies từ stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Tạo user không phải root (bảo mật)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
*/

// === .dockerignore ===
/*
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
.env
README.md
*/

// === Cách build và chạy ===
/*
# Build image
docker build -t nodejs-app .

# Chạy container
docker run -d -p 3000:3000 --name my-nodejs-app nodejs-app

# Xem logs
docker logs -f my-nodejs-app
*/