FROM node:20-alpine
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

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start:prod"]