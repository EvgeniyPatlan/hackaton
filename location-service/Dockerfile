FROM node:18-alpine

WORKDIR /app

# Встановлення необхідних залежностей для Alpine
RUN apk add --no-cache openssl libc6-compat

# Копіюємо файли залежностей
COPY package*.json ./
# Встановлення всіх залежностей з використанням legacy-peer-deps для уникнення конфліктів
RUN npm install --legacy-peer-deps

# Копіюємо код
COPY . .
RUN rm -rf node_modules/.cache
RUN rm -rf dist

# Генерація клієнта Prisma, якщо необхідно
RUN npx prisma generate

# Запуск скрипта, який спочатку проводить збірку, а потім запускає сервіс
CMD sh -c "npm run build && npm run start:prod"
