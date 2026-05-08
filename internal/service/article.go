package service

import (
	"log"

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

// ProcessArticles обрабатывает список новых статей.
// Берем текст, отправляем в LLM, ждем ответа, сохраняем в БД.
func (s *ArticleService) ProcessArticles(articles []models.Article) {
	log.Printf("Начинаем обработку %d статей...\n", len(articles))

	// TODO: работает очень медленно, надо бы распараллелить
	// Сейчас мы ждем ответа от API по каждой статье последовательно.
	for _, article := range articles {
		log.Printf("Обрабатываем статью ID=%d: %s\n", article.ID, article.Title)

		summary, err := s.llm.SummarizeText(article.Content)
		if err != nil {
			log.Printf("Ошибка получения summary для статьи %d: %v\n", article.ID, err)
			continue
		}

		err = s.repo.UpdateSummary(article.ID, summary)
		if err != nil {
			log.Printf("Ошибка сохранения summary в БД (статья %d): %v\n", article.ID, err)
			continue
		}

		log.Printf("Статья %d успешно обработана!\n", article.ID)
	}

	log.Println("Обработка завершена.")
}
