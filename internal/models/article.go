package models

import (
	"time"

	"github.com/lib/pq"
)

// Article представляет собой новостную статью.
type Article struct {
	ID          int            `db:"id"`
	OriginalURL *string        `db:"original_url"`
	FeedID      *int           `db:"feed_id"`
	Title       string         `db:"title"`
	Content     string         `db:"content"`
	AISummary   *string        `db:"ai_summary"`
	Tags        pq.StringArray `db:"tags"`
	Status      string         `db:"status"`
	CreatedAt   time.Time      `db:"created_at"`
}
