package rss

import (
	"context"
	"fmt"
	"log"

	"github.com/greg5320/AutoNews/internal/models"
	"github.com/mmcdole/gofeed"
)

type Parser struct {
	fp *gofeed.Parser
}

func NewParser() *Parser {
	return &Parser{
		fp: gofeed.NewParser(),
	}
}

// FetchArticles забирает новости из указанного фида и конвертирует их в наши модельки
func (p *Parser) FetchArticles(ctx context.Context, url string) ([]models.Article, error) {
	feed, err := p.fp.ParseURLWithContext(url, ctx)
	if err != nil {
		return nil, fmt.Errorf("ошибка парсинга фида %s: %w", url, err)
	}

	var articles []models.Article
	for _, item := range feed.Items {
		
		// Используем description, если есть, иначе пытаемся взять content
		content := item.Description
		if content == "" {
			content = item.Content
		}

		// Если совсем пусто, пропускаем
		if content == "" {
			continue
		}

		link := item.Link
		
		articles = append(articles, models.Article{
			Title:       item.Title,
			Content:     content,
			OriginalURL: &link,
			Status:      "new",
		})
	}

	log.Printf("Спарсили %d статей с %s\n", len(articles), url)
	return articles, nil
}
