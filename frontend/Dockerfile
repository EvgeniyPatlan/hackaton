FROM node:18-alpine

WORKDIR /app

# Копіюємо лише package.json спочатку
COPY package*.json ./

# Встановлення залежностей, включаючи next-i18next
RUN npm install next-i18next

# Копіюємо весь проект
COPY . .

# Важливо: переконуємося, що dist-директорія очищена
RUN rm -rf dist

# Додаємо діагностичну інформацію
RUN echo "Вміст поточної директорії:" && ls -la
RUN echo "Вміст package.json:" && cat package.json

# Явно запускаємо збірку і переконуємося, що вона працює
RUN npm run build

# Перевіряємо результат збірки
RUN echo "Вміст dist-директорії:" && ls -la dist || echo "Директорія dist не існує!"

# Встановлення locales
RUN mkdir -p /app/public/locales/en /app/public/locales/uk
COPY public/locales /app/public/locales

# Експозиція порту (якщо потрібно)
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "run", "start"]
