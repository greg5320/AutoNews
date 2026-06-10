FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Собираем бинарник с ограничением параллелизма для предотвращения OOM на macOS Docker
RUN CGO_ENABLED=0 GOOS=linux go build -p 2 -o autonews ./cmd/server/main.go

# Финальный легковесный образ с защитой: запуск от имени не-root пользователя autonews
FROM alpine:latest

# Создаем системную группу и пользователя autonews
RUN addgroup -S autonews && adduser -S autonews -G autonews

WORKDIR /app

# Копируем файлы и сразу устанавливаем владельца autonews
COPY --from=builder --chown=autonews:autonews /app/autonews .
COPY --from=builder --chown=autonews:autonews /app/migrations ./migrations

# Переключаемся на непривилегированного пользователя для защиты от контейнерного побега
USER autonews

EXPOSE 8002

CMD ["./autonews"]
