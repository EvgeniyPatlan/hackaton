# Посібник для розробників системи "Безбар'єрний доступ України"

Цей документ містить інформацію для розробників, які працюють над проектом "Безбар'єрний доступ України".

## Загальна архітектура

Система побудована за мікросервісною архітектурою, де кожен сервіс відповідає за конкретний бізнес-домен:

1. **Auth Service** - аутентифікація, авторизація, управління сесіями
2. **User Service** - управління користувачами та ролями
3. **Location Service** - управління об'єктами доступності
4. **File Service** - управління файлами та зображеннями
5. **Moderation Service** - модерація та верифікація даних
6. **Analytics Service** - статистика та аналітика
7. **Notification Service** - система сповіщень
8. **AI Service** - AI-модерація зображень та аналіз фото

## Технічний стек

- **Бекенд**: Node.js (TypeScript), NestJS, Python (FastAPI)
- **Фронтенд**: Next.js, React, TailwindCSS, Leaflet
- **Бази даних**: PostgreSQL з PostGIS, Valkey (Redis), Elasticsearch
- **Контейнеризація**: Docker, Docker Compose
- **API Gateway**: Nginx

## Розробка мікросервісів

### Структура мікросервісу на NestJS

Рекомендована структура для мікросервісів на NestJS:

service-name/
├── src/
│   ├── main.ts               # Точка входу
│   ├── app.module.ts         # Головний модуль
│   ├── config/               # Конфігурація
│   ├── common/               # Спільні компоненти
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── domain/               # Бізнес-логіка
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── infrastructure/       # Зовнішні залежності
│   │   ├── database/
│   │   ├── cache/
│   │   └── external-services/
│   └── api/                  # API контролери
│       ├── controllers/
│       ├── dto/
│       └── response/
├── test/                     # Тести
├── prisma/                   # Prisma ORM
│   └── schema.prisma
├── Dockerfile
├── .dockerignore
├── package.json
└── tsconfig.json


### Комунікація між сервісами

Сервіси повинні комунікувати між собою через:

1. **REST API** - для синхронної комунікації
2. **Redis PubSub** - для асинхронної комунікації та подій

Приклад комунікації через REST API:

```typescript
// В сервісі-споживачі
@Injectable()
export class ExternalService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getDataFromService(id: string): Promise<any> {
    const url = `${this.configService.get('SOME_SERVICE_URL')}/endpoint/${id}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
}
```
Приклад комунікації через Redis PubSub:

```typescript
// В сервісі-видавці
@Injectable()
export class EventPublisher {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async publishEvent(channel: string, data: any): Promise<void> {
    await this.redisClient.publish(channel, JSON.stringify(data));
  }
}

// В сервісі-споживачі
@Injectable()
export class EventSubscriber implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly eventHandlerService: EventHandlerService,
  ) {}

  onModuleInit() {
    this.redisClient.subscribe('channel-name');
    this.redisClient.on('message', (channel, message) => {
      if (channel === 'channel-name') {
        const data = JSON.parse(message);
        this.eventHandlerService.handleEvent(data);
      }
    });
  }
}
```

База даних
Система використовує PostgreSQL з розширенням PostGIS для зберігання геопросторових даних. Для роботи з базою даних використовується ORM Prisma.

Основні моделі
users - користувачі системи
roles - ролі користувачів
organizations - організації
locations - об'єкти доступності
accessibility_features - елементи безбар'єрності об'єкту
photos - фотографії об'єктів
verifications - верифікації даних
reviews - відгуки користувачів
notifications - сповіщення
audit_logs - аудит дій користувачів
Міграції
Для міграцій використовується Prisma:

```bash
# Генерація міграції
npx prisma migrate dev --name migration_name

# Застосування міграцій
npx prisma migrate deploy

```

Фронтенд
Фронтенд побудований на Next.js 14 з використанням React та TailwindCSS.

Структура проекту

frontend/
├── public/
│   └── locales/           # Файли локалізації
├── src/
│   ├── app/               # App Router (Next.js 14)
│   ├── components/        # React компоненти
│   │   ├── common/        # Спільні компоненти
│   │   ├── layout/        # Компоненти шаблону
│   │   ├── map/           # Компоненти карти
│   │   └── forms/         # Форми
│   ├── hooks/             # Кастомні хуки
│   ├── lib/               # Бібліотеки та утиліти
│   ├── services/          # Сервіси для API
│   └── store/             # Redux стор
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json

API Взаємодія
Для взаємодії з API використовується RTK Query:

```typescript

// src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
    prepareHeaders: (headers, { getState }) => {
      // Додаємо токен до заголовків
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Додаємо ендпоінти
  }),
});
```
Розгортання
Локальне розгортання
```bash
# Запуск всіх сервісів
docker-compose up -d

# Запуск окремого сервісу
docker-compose up -d service-name

# Перегляд логів
docker-compose logs -f [service-name]

# Зупинка системи
docker-compose down
```

Продакшн розгортання
Для продакшн середовища рекомендується використовувати Kubernetes:

Створити Kubernetes кластер
Налаштувати Ingress Controller
Створити Kubernetes маніфести для кожного сервісу
Використовувати Helm для розгортання
Стандарти кодування
TypeScript
Використовуйте строгу типізацію (strict: true в tsconfig.json)
Використовуйте інтерфейси для визначення структури даних
Уникайте використання any
NestJS
Дотримуйтесь архітектурних принципів NestJS
Використовуйте вбудовані механізми DI
Використовуйте декоратори для контролерів, методів та параметрів
React/Next.js
Використовуйте функціональні компоненти та хуки
Дотримуйтесь принципу "один компонент - одна відповідальність"
Використовуйте SSR/SSG де це можливо для кращої продуктивності
Загальні стандарти
Пишіть юніт та інтеграційні тести
Дотримуйтесь стилю коду згідно з ESLint/Prettier
Документуйте API з використанням OpenAPI/Swagger
Тестування
Юніт тести
```bash
npm run test
```

Інтеграційні тести

```bash
npm run test:e2e

```

CI/CD
Для CI/CD використовується GitHub Actions/GitLab CI:

Запуск тестів при кожному push
Статичний аналіз коду
Збірка Docker образів
Розгортання в тестове середовище
Автоматичне розгортання в продакшн після схвалення

Troubleshooting
Типові помилки

Проблеми з доступом до бази даних

Перевірте змінні середовища
Перевірте, чи запущена база даних


Проблеми з міжсервісною комунікацією

Перевірте налаштування DNS у Docker Compose
Перевірте, чи запущені всі необхідні сервіси


Проблеми з авторизацією

Перевірте змінну JWT_SECRET
Перевірте термін дії токенів




