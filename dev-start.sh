#!/bin/bash

# Перевірка наявності Docker та Docker Compose
if ! command -v docker &> /dev/null
then
    echo "Docker не встановлено. Встановіть Docker, щоб продовжити."
    exit 1
fi

if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose не встановлено. Встановіть Docker Compose, щоб продовжити."
    exit 1
fi

# Створення необхідних каталогів, якщо вони не існують
mkdir -p api-gateway/conf.d
mkdir -p api-gateway/certs
mkdir -p database/init
mkdir -p auth-service
mkdir -p user-service
mkdir -p location-service
mkdir -p file-service
mkdir -p moderation-service
mkdir -p analytics-service
mkdir -p notification-service
mkdir -p ai-service
mkdir -p frontend

# Перевірка наявності необхідних файлів
if [ ! -f "api-gateway/nginx.conf" ]; then
    echo "ПОМИЛКА: Відсутній файл api-gateway/nginx.conf"
    exit 1
fi

if [ ! -f "api-gateway/conf.d/default.conf" ]; then
    echo "ПОМИЛКА: Відсутній файл api-gateway/conf.d/default.conf"
    exit 1
fi

if [ ! -f "database/init/01-init.sql" ]; then
    echo "ПОМИЛКА: Відсутній файл database/init/01-init.sql"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "ПОМИЛКА: Відсутній файл docker-compose.yml"
    exit 1
fi

# Створення .env файлу, якщо він ще не існує
if [ ! -f ".env" ]; then
    echo "Створення файлу .env з типовими налаштуваннями..."
    cat > .env << EOL
# Загальні налаштування
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=bezbarierny_access
DATABASE_URL=postgres://admin:password@postgres:5432/bezbarierny_access

# JWT Секрет
JWT_SECRET=development_jwt_secret_key

# Налаштування сервісів
NODE_ENV=development
PYTHON_ENV=development

# Порти сервісів
AUTH_SERVICE_PORT=3001
LOCATION_SERVICE_PORT=3002
USER_SERVICE_PORT=3003
FILE_SERVICE_PORT=3004
MODERATION_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006
NOTIFICATION_SERVICE_PORT=3007
AI_SERVICE_PORT=3008
FRONTEND_PORT=3000
