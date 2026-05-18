package api

import (
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/greg5320/AutoNews/internal/models"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/service"
)

type Router struct {
	engine  *gin.Engine
	repo    *repository.ArticleRepository
	service *service.ArticleService
}

func NewRouter(repo *repository.ArticleRepository, svc *service.ArticleService) *Router {
	r := &Router{
		engine:  gin.Default(),
		repo:    repo,
		service: svc,
	}

	// Настраиваем CORS, чтобы фронтенд на NextJS мог спокойно дергать API
	r.engine.Use(cors.Default())

	r.setupRoutes()
	return r
}

func (r *Router) setupRoutes() {
	r.engine.POST("/articles", r.createArticle)
	r.engine.GET("/articles", r.getArticles)
	r.engine.GET("/articles/:id", r.getArticle)
}

func (r *Router) Run(addr string) error {
	return r.engine.Run(addr)
}

func (r *Router) getArticles(c *gin.Context) {
	articles, err := r.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось загрузить список статей"})
		return
	}

	// Если пусто, вернем пустой массив вместо null
	if articles == nil {
		articles = []models.Article{}
	}

	c.JSON(http.StatusOK, articles)
}

func (r *Router) createArticle(c *gin.Context) {
	var input struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article := models.Article{
		Title:   input.Title,
		Content: input.Content,
		Status:  "new",
	}

	id, err := r.repo.Create(&article)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить статью"})
		return
	}
	article.ID = id

	// Отдаем статью в воркер-пул для фоновой генерации саммари
	// Для этого вызываем ProcessArticles асинхронно или через отдельный канал
	// В нашем случае ProcessArticles блокирующий, поэтому мы завернем его в горутину 
	// (в реальном проекте лучше отдавать напрямую в канал воркеров)
	go r.service.ProcessArticles([]models.Article{article})

	c.JSON(http.StatusCreated, gin.H{"message": "Статья принята в обработку", "id": id})
}

func (r *Router) getArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID"})
		return
	}

	article, err := r.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Статья не найдена"})
		return
	}

	c.JSON(http.StatusOK, article)
}
