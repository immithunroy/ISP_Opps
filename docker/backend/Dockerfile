# Multi-stage Dockerfile for Backend
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Development stage
FROM base AS development
ENV NODE_ENV=development
COPY backend/ .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
ENV NODE_ENV=production
COPY backend/ .
RUN npm run build

# Production stage - use a fresh copy of Node
FROM node:20-alpine AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create uploads directory
RUN mkdir -p uploads/{assets,employees,attendance,splices,tjboxes,splitters,fiber,maintenance} && \
    chown -R nodejs:nodejs uploads

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {r.statusCode===200?process.exit(0):process.exit(1)})"

CMD ["node", "dist/index.js"]