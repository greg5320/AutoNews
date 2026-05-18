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
	logger.Init()
	log.Println("Запуск AutoNews...")

	database, err := db.NewPostgresDB()
	if err != nil {
		log.Fatalf("Не удалось подключиться к БД: %v", err)
	}
	defer database.Close()

	repo := repository.NewArticleRepository(database)
	feedRepo := repository.NewFeedRepository(database)
	
	apiKey := os.Getenv("GEMINI_API_KEY")
	geminiClient := llm.NewGeminiClient(apiKey)

	articleService := service.NewArticleService(repo, geminiClient)

	scheduler := cron.NewScheduler(repo, feedRepo, articleService)
	scheduler.Start()
	defer scheduler.Stop()

	router := api.NewRouter(repo, feedRepo, articleService)
	log.Println("Слушаем порт :8002...")
	if err := router.Run(":8002"); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}
