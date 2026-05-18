package repository

import (
	"database/sql"
	"errors"

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

// Create сохраняет новую статью в базу.
// Если url уже есть (уникальный индекс), возвращает ошибку.
func (r *ArticleRepository) Create(article *models.Article) (int, error) {
	var id int
	query := `INSERT INTO articles (title, content, status, original_url) 
	          VALUES ($1, $2, $3, $4) RETURNING id`
	err := r.db.QueryRow(query, article.Title, article.Content, "new", article.OriginalURL).Scan(&id)
	return id, err
}

// GetByID возвращает статью по айдишнику
func (r *ArticleRepository) GetByID(id int) (*models.Article, error) {
	var article models.Article
	err := r.db.Get(&article, "SELECT * FROM articles WHERE id = $1", id)
	return &article, err
}

// GetByOriginalURL проверяет, есть ли уже такая статья
func (r *ArticleRepository) GetByOriginalURL(url string) (*models.Article, error) {
	var article models.Article
	err := r.db.Get(&article, "SELECT * FROM articles WHERE original_url = $1", url)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil // Не найдена, это нормально
	}
	return &article, err
}

// UpdateAIAnalysis обновляет AI-саммари, теги и меняет статус
func (r *ArticleRepository) UpdateAIAnalysis(id int, summary string, tags pq.StringArray) error {
	query := `UPDATE articles SET ai_summary = $1, tags = $2, status = 'done' WHERE id = $3`
	_, err := r.db.Exec(query, summary, tags, id)
	return err
}

// GetAll возвращает список всех статей, отсортированных по дате (свежие сверху)
// TODO: добавить пагинацию, если статей станет слишком много
func (r *ArticleRepository) GetAll() ([]models.Article, error) {
	var articles []models.Article
	err := r.db.Select(&articles, "SELECT * FROM articles ORDER BY created_at DESC")
	return articles, err
}
