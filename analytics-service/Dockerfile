FROM node:18-alpine

WORKDIR /app

# Копіюємо файли package
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь проект
COPY . .

# Генеруємо Prisma Client
RUN npx prisma generate

# Збираємо проект
RUN npm run build

# Встановлюємо змінну середовища для production
ENV NODE_ENV=production

# Expose порт
EXPOSE 3000

# Команда старту
CMD ["npm", "run", "start:prod"]