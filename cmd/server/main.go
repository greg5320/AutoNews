package main

import (
	"log"
	"os"

	"github.com/greg5320/AutoNews/internal/db"
	"github.com/greg5320/AutoNews/internal/llm"
	"github.com/greg5320/AutoNews/internal/logger"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/service"
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

	// Инициализируем зависимости
	repo := repository.NewArticleRepository(database)
	
	// TODO: доставать ключ из .env, пока так
	apiKey := os.Getenv("GEMINI_API_KEY")
	geminiClient := llm.NewGeminiClient(apiKey)

	articleService := service.NewArticleService(repo, geminiClient)
	_ = articleService // TODO: вызывать в воркерах или роутах
}
