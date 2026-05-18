package repository

import (
	"github.com/greg5320/AutoNews/internal/models"
	"github.com/jmoiron/sqlx"
)

type FeedRepository struct {
	db *sqlx.DB
}

func NewFeedRepository(db *sqlx.DB) *FeedRepository {
	return &FeedRepository{db: db}
}

func (r *FeedRepository) Create(name, url string) (int, error) {
	var id int
	err := r.db.QueryRow(`INSERT INTO rss_feeds (name, url) VALUES ($1, $2) RETURNING id`, name, url).Scan(&id)
	return id, err
}

func (r *FeedRepository) GetAll() ([]models.Feed, error) {
	var feeds []models.Feed
	err := r.db.Select(&feeds, "SELECT * FROM rss_feeds ORDER BY created_at DESC")
	return feeds, err
}

func (r *FeedRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM rss_feeds WHERE id = $1", id)
	return err
}
