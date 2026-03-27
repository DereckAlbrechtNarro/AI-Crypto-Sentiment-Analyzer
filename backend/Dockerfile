# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Stage 2: Production (lightweight)
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

COPY --from=builder --chown=node:node /app ./

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]