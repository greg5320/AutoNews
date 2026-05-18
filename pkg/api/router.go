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
	engine   *gin.Engine
	repo     *repository.ArticleRepository
	feedRepo *repository.FeedRepository
	service  *service.ArticleService
}

func NewRouter(repo *repository.ArticleRepository, feedRepo *repository.FeedRepository, svc *service.ArticleService) *Router {
	r := &Router{
		engine:   gin.Default(),
		repo:     repo,
		feedRepo: feedRepo,
		service:  svc,
	}

	r.engine.Use(cors.Default())
	r.setupRoutes()
	return r
}

func (r *Router) setupRoutes() {
	r.engine.POST("/articles", r.createArticle)
	r.engine.GET("/articles", r.getArticles)
	r.engine.GET("/articles/:id", r.getArticle)

	r.engine.GET("/feeds", r.getFeeds)
	r.engine.POST("/feeds", r.createFeed)
	r.engine.DELETE("/feeds/:id", r.deleteFeed)
}

func (r *Router) Run(addr string) error {
	return r.engine.Run(addr)
}

func (r *Router) getArticles(c *gin.Context) {
	tag := c.Query("tag")
	feedIDStr := c.Query("feed_id")
	
	feedID := 0
	if feedIDStr != "" {
		if id, err := strconv.Atoi(feedIDStr); err == nil {
			feedID = id
		}
	}

	articles, err := r.repo.GetAll(tag, feedID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load articles"})
		return
	}
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save article"})
		return
	}
	article.ID = id

	go r.service.ProcessArticles([]models.Article{article})

	c.JSON(http.StatusCreated, gin.H{"message": "Article accepted", "id": id})
}

func (r *Router) getArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	article, err := r.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}
	c.JSON(http.StatusOK, article)
}

func (r *Router) getFeeds(c *gin.Context) {
	feeds, err := r.feedRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load feeds"})
		return
	}
	if feeds == nil {
		feeds = []models.Feed{}
	}
	c.JSON(http.StatusOK, feeds)
}

func (r *Router) createFeed(c *gin.Context) {
	var input struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := r.feedRepo.Create(input.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add feed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "url": input.URL})
}

func (r *Router) deleteFeed(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := r.feedRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete feed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
