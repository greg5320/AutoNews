package main

import (
	"log"
	"os"

	"github.com/greg5320/AutoNews/internal/cron"
	"github.com/greg5320/AutoNews/internal/db"
	"github.com/greg5320/AutoNews/internal/llm"
	"github.com/greg5320/AutoNews/internal/logger"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/service"
	"github.com/greg5320/AutoNews/pkg/api"
)

func main() {
	// Инициализируем логгер
	logger.Init()

	log.Println("Запуск AutoNews...")

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

	// Инициализируем и запускаем шедулер для парсинга RSS
	scheduler := cron.NewScheduler(repo, articleService)
	scheduler.Start()
	defer scheduler.Stop()

	// Поднимаем REST API
	router := api.NewRouter(repo, articleService)
	log.Println("Слушаем порт :8002...")
	if err := router.Run(":8002"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
