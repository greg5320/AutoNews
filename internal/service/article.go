package service

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/greg5320/AutoNews/internal/llm"
	"github.com/greg5320/AutoNews/internal/models"
	"github.com/greg5320/AutoNews/internal/repository"
)

type ArticleService struct {
	repo *repository.ArticleRepository
	llm  *llm.GeminiClient
}

func NewArticleService(repo *repository.ArticleRepository, gemini *llm.GeminiClient) *ArticleService {
	return &ArticleService{
		repo: repo,
		llm:  gemini,
	}
}

// worker читает из канала и обрабатывает статьи параллельно.
// Добавил context.WithTimeout, чтобы горутина не зависала, если API тупит.
func (s *ArticleService) worker(id int, jobs <-chan models.Article, wg *sync.WaitGroup) {
	defer wg.Done()

	for article := range jobs {
		log.Printf("Воркер %d взял в работу статью ID=%d\n", id, article.ID)

		// Ставим жесткий таймаут в 10 секунд на один запрос к LLM
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

		analysis, err := s.llm.AnalyzeText(ctx, article.Content)
		cancel() // освобождаем ресурсы контекста

		if err != nil {
			log.Printf("Воркер %d: Ошибка получения AI анализа (статья %d): %v\n", id, article.ID, err)
			continue
		}

		err = s.repo.UpdateAIAnalysis(article.ID, analysis.Summary, analysis.Tags)
		if err != nil {
			log.Printf("Воркер %d: Ошибка сохранения анализа в БД (статья %d): %v\n", id, article.ID, err)
			continue
		}

		log.Printf("Воркер %d: Статья %d успешно обработана!\n", id, article.ID)
	}
}

// ProcessArticles теперь использует Worker Pool, ура!
func (s *ArticleService) ProcessArticles(articles []models.Article) {
	numWorkers := 3 // TODO: вынести в конфиг
	log.Printf("Начинаем обработку %d статей (воркеров: %d)...\n", len(articles), numWorkers)

	jobs := make(chan models.Article, len(articles))
	var wg sync.WaitGroup

	// Запускаем пул воркеров
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.worker(w, jobs, &wg)
	}

	// Раскидываем задачи в канал
	for _, article := range articles {
		jobs <- article
	}
	close(jobs) // закрываем канал, чтобы воркеры вышли из цикла, когда доделают работу

	// Ждем, пока все воркеры не отчитаются
	wg.Wait()

	log.Println("Все воркеры закончили работу. Обработка завершена.")
}

func (s *ArticleService) ProcessArticleSync(article models.Article) (*models.Article, error) {
	log.Printf("[ON-DEMAND] Starting AI analysis for article ID=%d (%s)\n", article.ID, article.Title)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	analysis, err := s.llm.AnalyzeText(ctx, article.Content)
	if err != nil {
		return nil, err
	}

	err = s.repo.UpdateAIAnalysis(article.ID, analysis.Summary, analysis.Tags)
	if err != nil {
		return nil, err
	}

	return s.repo.GetByID(article.ID)
}
