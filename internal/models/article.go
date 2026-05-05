package models

import "time"

// Article представляет собой новостную статью.
type Article struct {
	ID        int       `db:"id"`
	Title     string    `db:"title"`
	Content   string    `db:"content"`
	AISummary *string   `db:"ai_summary"` // Указатель, т.к. может быть NULL до обработки
	Status    string    `db:"status"`     // статусы: "new", "processing", "done", "error"
	CreatedAt time.Time `db:"created_at"`
}
