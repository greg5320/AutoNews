package db

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// NewPostgresDB подключается к постгресу.
func NewPostgresDB() (*sqlx.DB, error) {
	// Внутри Docker мы подключаемся по имени сервиса 'postgres'
	// TODO: обязательно вынести это в .env, сейчас для теста поменял localhost на postgres
	dsn := "host=postgres port=5432 user=postgres password=postgres dbname=autonews sslmode=disable"
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	log.Println("Успешно подключились к PostgreSQL")
	return db, nil
}
