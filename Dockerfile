# === Builder ===
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma

RUN pnpx prisma generate

COPY . .

RUN pnpm build

RUN pnpm prune --prod --ignore-scripts

# === Production ===
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/main"]