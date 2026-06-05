package api

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/greg5320/AutoNews/internal/cron"
	"github.com/greg5320/AutoNews/internal/metrics"
	"github.com/greg5320/AutoNews/internal/models"
	"github.com/greg5320/AutoNews/internal/repository"
	"github.com/greg5320/AutoNews/internal/service"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Router struct {
	engine       *gin.Engine
	repo         *repository.ArticleRepository
	feedRepo     *repository.FeedRepository
	settingsRepo *repository.SettingsRepository
	service      *service.ArticleService
	scheduler    *cron.Scheduler
}

func NewRouter(repo *repository.ArticleRepository, feedRepo *repository.FeedRepository, settingsRepo *repository.SettingsRepository, svc *service.ArticleService, scheduler *cron.Scheduler) *Router {
	r := &Router{
		engine:       gin.Default(),
		repo:         repo,
		feedRepo:     feedRepo,
		settingsRepo: settingsRepo,
		service:      svc,
		scheduler:    scheduler,
	}

	r.engine.Use(cors.Default())
	r.engine.Use(prometheusMiddleware())
	r.setupRoutes()
	return r
}

func prometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		metrics.ActiveUsers.Inc()
		defer metrics.ActiveUsers.Dec()

		c.Next()

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(c.Writer.Status())
		method := c.Request.Method
		path := c.FullPath()
		if path == "" {
			path = "unknown"
		}

		if path != "/metrics" {
			metrics.HTTPRequestsTotal.WithLabelValues(method, path, status).Inc()
			metrics.HTTPRequestDuration.WithLabelValues(method, path).Observe(duration)
		}
	}
}

func (r *Router) setupRoutes() {
	r.engine.GET("/metrics", gin.WrapH(promhttp.Handler()))

	r.engine.POST("/articles", r.createArticle)
	r.engine.GET("/articles", r.getArticles)
	r.engine.GET("/articles/:id", r.getArticle)
	r.engine.DELETE("/articles", r.deleteAllArticles)
	r.engine.DELETE("/articles/:id", r.deleteArticle)

	r.engine.GET("/feeds", r.getFeeds)
	r.engine.POST("/feeds", r.createFeed)
	r.engine.DELETE("/feeds/:id", r.deleteFeed)

	r.engine.GET("/settings", r.getSettings)
	r.engine.PUT("/settings", r.updateSettings)
}

func (r *Router) Run(addr string) error {
	return r.engine.Run(addr)
}

func (r *Router) getSettings(c *gin.Context) {
	interval := r.settingsRepo.Get("cron_interval", "10")
	c.JSON(http.StatusOK, gin.H{"cron_interval": interval})
}

func (r *Router) updateSettings(c *gin.Context) {
	var input struct {
		CronInterval string `json:"cron_interval" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := r.scheduler.UpdateInterval(input.CronInterval); err != nil {
		log.Printf("Error updating settings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update scheduler: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated"})
}

func (r *Router) deleteAllArticles(c *gin.Context) {
	if err := r.repo.DeleteAll(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete all articles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All articles deleted"})
}

func (r *Router) deleteArticle(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := r.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete article"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Article deleted"})
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
		Name string `json:"name" binding:"required"`
		URL  string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := r.feedRepo.Create(input.Name, input.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add feed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "name": input.Name, "url": input.URL})
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
