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
	c        *cronlib.Cron
	parser   *rss.Parser
	repo     *repository.ArticleRepository
	feedRepo *repository.FeedRepository
	service  *service.ArticleService
}

func NewScheduler(repo *repository.ArticleRepository, feedRepo *repository.FeedRepository, svc *service.ArticleService) *Scheduler {
	return &Scheduler{
		c:        cronlib.New(),
		parser:   rss.NewParser(),
		repo:     repo,
		feedRepo: feedRepo,
		service:  svc,
	}
}

func (s *Scheduler) Start() {
	s.c.AddFunc("@every 10m", func() {
		s.runParsing()
	})

	s.c.Start()
	log.Println("Scheduler started (@every 10m)")
	
	go s.runParsing()
}

func (s *Scheduler) Stop() {
	s.c.Stop()
}

func (s *Scheduler) runParsing() {
	log.Println("[CRON] Starting RSS parsing...")
	
	// Сначала проверяем, нет ли залипших статей в статусе new
	unprocessed, err := s.repo.GetUnprocessed()
	if err == nil && len(unprocessed) > 0 {
		log.Printf("[CRON] Found %d stuck articles, sending to Worker Pool\n", len(unprocessed))
		go s.service.ProcessArticles(unprocessed)
	}

	feeds, err := s.feedRepo.GetAll()
	if err != nil {
		log.Printf("[CRON] Error loading feeds: %v\n", err)
		return
	}

	for _, feed := range feeds {
		s.fetchAndProcess(feed.URL)
	}
}

func (s *Scheduler) fetchAndProcess(url string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	articles, err := s.parser.FetchArticles(ctx, url)
	if err != nil {
		log.Printf("[CRON] Parse error %s: %v\n", url, err)
		return
	}

	var newArticles []models.Article

	for _, article := range articles {
		existing, err := s.repo.GetByOriginalURL(*article.OriginalURL)
		if err != nil {
			log.Printf("[CRON] Duplicate check error: %v\n", err)
			continue
		}
		if existing != nil {
			continue
		}

		id, err := s.repo.Create(&article)
		if err != nil {
			log.Printf("[CRON] DB insert error: %v\n", err)
			continue
		}
		
		article.ID = id
		newArticles = append(newArticles, article)
	}

	if len(newArticles) > 0 {
		log.Printf("[CRON] Sending %d articles to Worker Pool\n", len(newArticles))
		go s.service.ProcessArticles(newArticles)
	}
}
