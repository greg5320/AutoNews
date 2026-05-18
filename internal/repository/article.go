package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/greg5320/AutoNews/internal/models"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type ArticleRepository struct {
	db *sqlx.DB
}

func NewArticleRepository(db *sqlx.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

func (r *ArticleRepository) Create(article *models.Article) (int, error) {
	var id int
	query := `INSERT INTO articles (title, content, status, original_url, feed_id) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id`
	err := r.db.QueryRow(query, article.Title, article.Content, "new", article.OriginalURL, article.FeedID).Scan(&id)
	return id, err
}

func (r *ArticleRepository) GetByID(id int) (*models.Article, error) {
	var article models.Article
	err := r.db.Get(&article, "SELECT * FROM articles WHERE id = $1", id)
	return &article, err
}

func (r *ArticleRepository) GetByOriginalURL(url string) (*models.Article, error) {
	var article models.Article
	err := r.db.Get(&article, "SELECT * FROM articles WHERE original_url = $1", url)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return &article, err
}

func (r *ArticleRepository) UpdateAIAnalysis(id int, summary string, tags pq.StringArray) error {
	query := `UPDATE articles SET ai_summary = $1, tags = $2, status = 'done' WHERE id = $3`
	_, err := r.db.Exec(query, summary, tags, id)
	return err
}

func (r *ArticleRepository) GetUnprocessed() ([]models.Article, error) {
	var articles []models.Article
	err := r.db.Select(&articles, "SELECT * FROM articles WHERE status = 'new' ORDER BY created_at ASC")
	return articles, err
}

func (r *ArticleRepository) GetAll(tag string, feedID int) ([]models.Article, error) {
	var articles []models.Article
	
	query := `SELECT * FROM articles WHERE 1=1`
	var args []interface{}
	counter := 1

	if feedID > 0 {
		query += fmt.Sprintf(` AND feed_id = $%d`, counter)
		args = append(args, feedID)
		counter++
	}
	
	if tag != "" {
		query += fmt.Sprintf(` AND $%d = ANY(tags)`, counter)
		args = append(args, tag)
		counter++
	}
	
	query += ` ORDER BY created_at DESC`
	
	err := r.db.Select(&articles, query, args...)
	return articles, err
}
