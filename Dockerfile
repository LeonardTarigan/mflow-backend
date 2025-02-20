# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile
RUN npx prisma generate

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine

# Install pnpm globally in the final stage
RUN npm install -g pnpm

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start:prod"]