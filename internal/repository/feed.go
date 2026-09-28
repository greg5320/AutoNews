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

func (r *FeedRepository) GetByID(id int) (*models.Feed, error) {
	var feed models.Feed
	err := r.db.Get(&feed, "SELECT * FROM rss_feeds WHERE id = $1", id)
	return &feed, err
}

func (r *FeedRepository) GetByURL(url string) (*models.Feed, error) {
	var feed models.Feed
	err := r.db.Get(&feed, "SELECT * FROM rss_feeds WHERE url = $1", url)
	return &feed, err
}

func (r *FeedRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM rss_feeds WHERE id = $1", id)
	return err
}

func (r *FeedRepository) UpdateName(id int, name string) error {
	_, err := r.db.Exec("UPDATE rss_feeds SET name = $1 WHERE id = $2", name, id)
	return err
}

func (r *FeedRepository) Subscribe(userID string, feedID int) error {
	_, err := r.db.Exec("INSERT INTO user_feeds (user_id, feed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", userID, feedID)
	return err
}

func (r *FeedRepository) Unsubscribe(userID string, feedID int) error {
	_, err := r.db.Exec("DELETE FROM user_feeds WHERE user_id = $1 AND feed_id = $2", userID, feedID)
	return err
}

func (r *FeedRepository) GetUserFeedCount(userID string) (int, error) {
	var count int
	err := r.db.Get(&count, "SELECT COUNT(*) FROM user_feeds WHERE user_id = $1", userID)
	return count, err
}

func (r *FeedRepository) GetUserFeeds(userID string) ([]models.Feed, error) {
	var feeds []models.Feed
	query := `SELECT f.* FROM rss_feeds f 
	          JOIN user_feeds uf ON f.id = uf.feed_id 
	          WHERE uf.user_id = $1 
	          ORDER BY f.created_at DESC`
	err := r.db.Select(&feeds, query, userID)
	return feeds, err
}
