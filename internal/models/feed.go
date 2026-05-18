package models

import "time"

type Feed struct {
	ID        int       `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	URL       string    `db:"url" json:"url"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}
