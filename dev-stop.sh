#!/bin/bash

# Перевірка наявності Docker Compose
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose не встановлено. Встановіть Docker Compose, щоб продовжити."
    exit 1
fi

# Зупинка всіх сервісів
echo "Зупинка системи 'Безбар'єрний доступ України'..."
docker-compose down

echo "Система зупинена."
echo ""
echo "Для повного видалення даних (включаючи томи) виконайте: docker-compose down -v"
