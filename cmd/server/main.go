package main

import (
	"log"

	"github.com/greg5320/AutoNews/internal/db"
	"github.com/greg5320/AutoNews/internal/logger"
	"github.com/greg5320/AutoNews/internal/repository"
)

func main() {
	// Инициализируем логгер
	logger.Init()

	log.Println("Запуск AutoNews... Пока просто пустая оболочка.")

	// Подключаемся к БД
	database, err := db.NewPostgresDB()
	if err != nil {
		log.Fatalf("Не удалось подключиться к БД: %v", err)
	}
	defer database.Close()

	// Инициализируем репозиторий
	repo := repository.NewArticleRepository(database)
	_ = repo // TODO: использовать repo в бизнес-логике

	// TODO: Добавить чтение конфига из env или yaml
}
