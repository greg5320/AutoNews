package models

import "time"

type Feed struct {
	ID        int       `db:"id" json:"id"`
	URL       string    `db:"url" json:"url"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
