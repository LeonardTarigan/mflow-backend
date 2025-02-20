# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including bcrypt)
RUN pnpm install --frozen-lockfile

# Rebuild bcrypt for Alpine Linux
RUN pnpm rebuild bcrypt

# Copy prisma directory
COPY prisma ./prisma

# Generate Prisma client
RUN pnpx prisma generate

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start:prod"]
