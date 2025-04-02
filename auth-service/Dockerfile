FROM node:18-alpine

WORKDIR /app

# Встановлення необхідних залежностей для Prisma (альтернативні пакети)
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
# Встановлення всіх залежностей з використанням legacy-peer-deps для уникнення конфліктів
RUN npm install --legacy-peer-deps

# Копіювання коду проекту
COPY . .
RUN rm -rf node_modules/.cache
RUN rm -rf dist

# Генерація клієнта Prisma
RUN npx prisma generate

# Збірка проекту
RUN npm run build

# Запуск додатку
CMD ["npm", "run", "start:prod"]
