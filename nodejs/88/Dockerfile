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