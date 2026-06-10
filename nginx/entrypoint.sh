#!/bin/sh

# Проверяем, существуют ли сертификаты. Если нет — генерируем самоподписанные
if [ ! -f /etc/nginx/ssl/live/localhost/fullchain.pem ]; then
    echo "[NGINX] Сертификат не найден. Генерируем самоподписанный SSL-сертификат для localhost..."
    mkdir -p /etc/nginx/ssl/live/localhost
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/live/localhost/privkey.pem \
        -out /etc/nginx/ssl/live/localhost/fullchain.pem \
        -subj "/CN=localhost"
fi

echo "[NGINX] Запуск Nginx..."
exec nginx -g "daemon off;"
