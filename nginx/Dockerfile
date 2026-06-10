FROM nginx:alpine

# Устанавливаем openssl для автоматической генерации самоподписанных сертификатов
RUN apk add --no-cache openssl

# Копируем конфигурацию и скрипт инициализации
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
