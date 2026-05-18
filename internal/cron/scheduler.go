package cron

import (
	"context"
	"log"
	"time"

	"github.com/greg5320/AutoNews/internal/models"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/rss"
	"github.com/greg5320/AutoNews/internal/service"
	cronlib "github.com/robfig/cron/v3"
)

type Scheduler struct {
	c       *cronlib.Cron
	parser  *rss.Parser
	repo    *repository.ArticleRepository
	service *service.ArticleService
}

func NewScheduler(repo *repository.ArticleRepository, svc *service.ArticleService) *Scheduler {
	return &Scheduler{
		c:       cronlib.New(),
		parser:  rss.NewParser(),
		repo:    repo,
		service: svc,
	}
}

// Start запускает шедулер
func (s *Scheduler) Start() {
	// Добавляем джобу: раз в 30 минут (для дебага можно поставить "@every 1m")
	// TODO: вынести список фидов в конфиг
	feeds := []string{
		"https://hnrss.org/frontpage",
		// "https://habr.com/ru/rss/all/all/", // Если нужен хабр
	}

	s.c.AddFunc("@every 10m", func() {
		log.Println("[CRON] Запускаем парсинг RSS...")
		for _, url := range feeds {
			s.fetchAndProcess(url)
		}
	})

	s.c.Start()
	log.Println("Шедулер успешно запущен (период: каждые 10 мин)")
	
	// Можно сразу пнуть один раз при старте
	go func() {
		for _, url := range feeds {
			s.fetchAndProcess(url)
		}
	}()
}

func (s *Scheduler) Stop() {
	s.c.Stop()
}

func (s *Scheduler) fetchAndProcess(url string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	articles, err := s.parser.FetchArticles(ctx, url)
	if err != nil {
		log.Printf("[CRON] Ошибка парсинга %s: %v\n", url, err)
		return
	}

	var newArticles []models.Article

	for _, article := range articles {
		// Проверяем, есть ли уже такая статья по урлу
		existing, err := s.repo.GetByOriginalURL(*article.OriginalURL)
		if err != nil {
			log.Printf("[CRON] Ошибка при поиске дубликата: %v\n", err)
			continue
		}

		if existing != nil {
			// Уже парсили, пропускаем
			continue
		}

		// Сохраняем в базу как new
		id, err := s.repo.Create(&article)
		if err != nil {
			log.Printf("[CRON] Ошибка сохранения новой статьи: %v\n", err)
			continue
		}
		
		article.ID = id
		newArticles = append(newArticles, article)
	}

	if len(newArticles) > 0 {
		log.Printf("[CRON] Отправляем %d новых статей в Worker Pool\n", len(newArticles))
		// Отдаем в пул асинхронно
		go s.service.ProcessArticles(newArticles)
	} else {
		log.Printf("[CRON] Нет новых статей с %s\n", url)
	}
}
