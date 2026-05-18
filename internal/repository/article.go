package repository

import (
	"github.com/greg5320/AutoNews/internal/models"
	"github.com/jmoiron/sqlx"
)

type ArticleRepository struct {
	db *sqlx.DB
}

func NewArticleRepository(db *sqlx.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

// Create сохраняет новую статью в базу
func (r *ArticleRepository) Create(article *models.Article) (int, error) {
	var id int
	query := `INSERT INTO articles (title, content, status) VALUES ($1, $2, $3) RETURNING id`
	err := r.db.QueryRow(query, article.Title, article.Content, "new").Scan(&id)
	return id, err
}

// GetByID возвращает статью по айдишнику
func (r *ArticleRepository) GetByID(id int) (*models.Article, error) {
	var article models.Article
	err := r.db.Get(&article, "SELECT * FROM articles WHERE id = $1", id)
	return &article, err
}

// UpdateSummary обновляет AI-саммари и меняет статус
func (r *ArticleRepository) UpdateSummary(id int, summary string) error {
	query := `UPDATE articles SET ai_summary = $1, status = 'done' WHERE id = $2`
	_, err := r.db.Exec(query, summary, id)
	return err
}

// GetAll возвращает список всех статей, отсортированных по дате (свежие сверху)
// TODO: добавить пагинацию, если статей станет слишком много
func (r *ArticleRepository) GetAll() ([]models.Article, error) {
	var articles []models.Article
	err := r.db.Select(&articles, "SELECT * FROM articles ORDER BY created_at DESC")
	return articles, err
}
