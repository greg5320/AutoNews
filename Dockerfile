FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Собираем бинарник с ограничением параллелизма для предотвращения OOM на macOS Docker
RUN CGO_ENABLED=0 GOOS=linux go build -p 2 -o autonews ./cmd/server/main.go

# Финальный легковесный образ
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/autonews .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8002

CMD ["./autonews"]
