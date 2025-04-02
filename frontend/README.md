# Frontend Microservice

Мікросервіс для веб-інтерфейсу системи "Безбар'єрний доступ України".

## Команди

- `npm install` — встановити залежності
- `npm run dev` — локальна розробка
- `npm run build && npm start` — продакшн

## Docker

- `docker build -t frontend .` — збірка
- `docker run -p 3000:3000 frontend` — запуск

auth-service, location-service (через gateway)
