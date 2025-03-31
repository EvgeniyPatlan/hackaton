#!/bin/bash

# Цей скрипт очищає і перезапускає всю систему, використовуйте його обережно!

echo "УВАГА: Цей скрипт видалить всі дані системи. Продовжити? (y/n)"
read -r response
if [[ "$response" != "y" ]]; then
    echo "Операцію скасовано."
    exit 0
fi

echo "Зупиняємо всі контейнери..."
docker-compose down

echo "Видаляємо томи (всі дані будуть втрачені)..."
docker volume rm bezbarierny-access_postgres_data bezbarierny-access_valkey_data bezbarierny-access_elasticsearch_data bezbarierny-access_file_storage 2>/dev/null || true

echo "Перезапускаємо систему..."
./dev-start.sh

echo "Система успішно перезапущена з чистими даними."
