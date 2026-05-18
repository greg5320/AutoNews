FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Собираем бинарник
RUN CGO_ENABLED=0 GOOS=linux go build -o autonews ./cmd/server/main.go

# Финальный легковесный образ
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/autonews .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8002

CMD ["./autonews"]
