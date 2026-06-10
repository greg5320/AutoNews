package cron

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/greg5320/AutoNews/internal/models"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/rss"
	"github.com/greg5320/AutoNews/internal/service"
	cronlib "github.com/robfig/cron/v3"
)

type Scheduler struct {
	c            *cronlib.Cron
	parser       *rss.Parser
	tgParser     *rss.TelegramParser
	repo         *repository.ArticleRepository
	feedRepo     *repository.FeedRepository
	settingsRepo *repository.SettingsRepository
	service      *service.ArticleService
	entryID      cronlib.EntryID
	mu           sync.Mutex
}

func NewScheduler(repo *repository.ArticleRepository, feedRepo *repository.FeedRepository, settingsRepo *repository.SettingsRepository, svc *service.ArticleService) *Scheduler {
	return &Scheduler{
		c:            cronlib.New(),
		parser:       rss.NewParser(),
		tgParser:     rss.NewTelegramParser(),
		repo:         repo,
		feedRepo:     feedRepo,
		settingsRepo: settingsRepo,
		service:      svc,
	}
}

func (s *Scheduler) Start() {
	interval := s.settingsRepo.Get("cron_interval", "10")
	spec := fmt.Sprintf("@every %sm", interval)

	id, err := s.c.AddFunc(spec, func() {
		s.runParsing()
	})
	
	if err != nil {
		log.Printf("Scheduler start error: %v\n", err)
	}

	s.entryID = id
	s.c.Start()
	log.Printf("Scheduler started (%s)\n", spec)
	
	go s.runParsing()
}

func (s *Scheduler) Stop() {
	s.c.Stop()
}

func (s *Scheduler) UpdateInterval(minutes string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	spec := fmt.Sprintf("@every %sm", minutes)
	
	// Remove old job
	if s.entryID != 0 {
		s.c.Remove(s.entryID)
	}

	// Add new job
	id, err := s.c.AddFunc(spec, func() {
		s.runParsing()
	})
	
	if err != nil {
		return err
	}

	s.entryID = id
	err = s.settingsRepo.Set("cron_interval", minutes)
	
	log.Printf("Scheduler interval updated to %s\n", spec)
	return err
}

func (s *Scheduler) runParsing() {
	log.Println("[CRON] Starting RSS parsing...")
	
	// Disabled automatic background processing to save tokens; articles are processed on-demand.

	feeds, err := s.feedRepo.GetAll()
	if err != nil {
		log.Printf("[CRON] Error loading feeds: %v\n", err)
		return
	}

	for _, feed := range feeds {
		s.FetchAndProcess(feed)
	}
}

func (s *Scheduler) FetchAndProcess(feed models.Feed) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var articles []models.Article
	var err error

	if rss.IsTelegramURL(feed.URL) {
		articles, err = s.tgParser.FetchArticles(ctx, feed.URL)
	} else {
		articles, err = s.parser.FetchArticles(ctx, feed.URL)
	}

	if err != nil {
		log.Printf("[CRON] Parse error %s: %v\n", feed.URL, err)
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

		article.FeedID = &feed.ID
		id, err := s.repo.Create(&article)
		if err != nil {
			log.Printf("[CRON] DB insert error: %v\n", err)
			continue
		}
		
		article.ID = id
		newArticles = append(newArticles, article)
	}

	if len(newArticles) > 0 {
		log.Printf("[CRON] Saved %d new articles. They will be analyzed on-demand.\n", len(newArticles))
	}
}
