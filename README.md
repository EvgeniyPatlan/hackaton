# Система "Безбар'єрний доступ України"

Мікросервісна архітектура для системи, що дозволяє збирати та відображати інформацію про доступність об'єктів інфраструктури для людей з обмеженими можливостями.

## Архітектура системи

Система побудована за мікросервісною архітектурою і складається з наступних компонентів:

- **API Gateway** - єдина точка входу для всіх клієнтських додатків (nginx)
- **Auth Service** - сервіс аутентифікації та авторизації (NestJS)
- **Location Service** - управління об'єктами доступності (NestJS)
- **User Service** - управління користувачами і ролями (NestJS)
- **File Service** - управління файлами та зображеннями (NestJS)
- **Moderation Service** - модерація та верифікація даних (NestJS)
- **Analytics Service** - статистика та аналітика (NestJS)
- **Notification Service** - система сповіщень (NestJS)
- **AI Service** - сервіс AI-модерації зображень (Python/FastAPI)
- **Frontend** - веб-інтерфейс (Next.js)

## Технічний стек

- **Бекенд**: Node.js, TypeScript, NestJS, Python, FastAPI
- **Фронтенд**: Next.js, React, TailwindCSS, Leaflet
- **База даних**: PostgreSQL з PostGIS
- **Кешування**: Valkey (Redis)
- **Пошук**: Elasticsearch
- **Контейнеризація**: Docker, Docker Compose
- **API Gateway**: Nginx

## Підготовка до запуску

### Передумови

Для запуску системи вам знадобиться:

- Docker
- Docker Compose
- Git

### Клонування репозиторію

```bash
git clone https://github.com/your-username/bezbarierny-access.git
cd bezbarierny-access
```
Структура каталогів
Створіть таку структуру каталогів:

bezbarierny-access/
├── api-gateway/
│   ├── conf.d/
│   ├── certs/
│   └── nginx.conf
├── auth-service/
├── user-service/
├── location-service/
├── file-service/
├── moderation-service/
├── analytics-service/
├── notification-service/
├── ai-service/
├── frontend/
└── database/
    └── init/

Запуск системи
1. Налаштування змінних середовища
Створіть файл .env в кореневому каталозі:

# Загальні налаштування
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=bezbarierny_access
DATABASE_URL=postgres://admin:password@postgres:5432/bezbarierny_access

# JWT Секрет
JWT_SECRET=your_secure_jwt_secret

# Налаштування сервісів
NODE_ENV=development

2. Запуск системи через Docker Compose
```bash
docker-compose up -d
```
Це запустить всі сервіси, визначені у файлі docker-compose.yml.

3. Перевірка статусу сервісів

```bash
docker-compose ps
```

Доступ до сервісів

Веб-інтерфейс: http://localhost:3000
API Gateway: http://localhost:80
Swagger документація:
Auth Service: http://localhost/api/docs/auth/
User Service: http://localhost/api/docs/users/
Location Service: http://localhost/api/docs/locations/
File Service: http://localhost/api/docs/files/
Moderation Service: http://localhost/api/docs/moderation/
Analytics Service: http://localhost/api/docs/analytics/
Notification Service: http://localhost/api/docs/notifications/
AI Service: http://localhost/api/docs/ai/


Розробка
Запуск окремих сервісів

Ви можете запустити окремі сервіси, використовуючи:

```bash
docker-compose up -d service-name
```

Де service-name - назва сервісу з docker-compose.yml (наприклад, auth-service, frontend тощо).

Перегляд логів
```bash
docker-compose logs -f [service-name]
```

Зупинка системи

```bash
docker-compose down
```

Для повного видалення даних (включаючи томи):
```bash
docker-compose down -v
```

Розширення системи
Для додавання нового мікросервісу:

Створіть каталог для нового сервісу
Створіть Dockerfile та код сервісу
Додайте сервіс до docker-compose.yml
Додайте відповідні маршрути до api-gateway/conf.d/default.conf
Тестування
Для запуску тестів в окремому сервісі:

```bash
docker-compose exec service-name npm run test
```

Ліцензія
MIT


