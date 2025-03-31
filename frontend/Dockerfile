FROM node:18-alpine AS base

# Встановлюємо залежності для гарної роботи
RUN apk add --no-cache libc6-compat

# Створюємо робочу директорію
WORKDIR /app

# Встановлюємо pnpm
RUN npm install -g pnpm

# Етап залежностей
FROM base AS deps
# Копіюємо лише файли залежностей
COPY package.json pnpm-lock.yaml* ./
# Встановлюємо залежності
RUN pnpm install --frozen-lockfile

# Етап збірки
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Перевіряємо змінні середовища в етапі збірки
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm build

# Етап продуктового сервера
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Створюємо непривілейованого користувача
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Копіюємо public та .next з етапу збірки
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
# Команда запуску
CMD ["node", "server.js"]
