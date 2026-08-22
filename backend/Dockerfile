# Production Dockerfile for Nexora AI Backend
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including Prisma CLI for client generation)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
