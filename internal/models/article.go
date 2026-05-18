package models

import (
	"time"

	"github.com/lib/pq"
)

// Article представляет собой новостную статью.
type Article struct {
	ID          int            `db:"id"`
	OriginalURL *string        `db:"original_url"` // Чтобы не дублировать новости из RSS
	Title       string         `db:"title"`
	Content     string         `db:"content"`
	AISummary   *string        `db:"ai_summary"`
	Tags        pq.StringArray `db:"tags"`   // Массив тегов от LLM
	Status      string         `db:"status"` // "new", "processing", "done", "error"
	CreatedAt   time.Time      `db:"created_at"`
}
