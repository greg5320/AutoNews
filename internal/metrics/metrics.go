package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// GeminiTokensSpent считает потраченные токены Gemini с группировкой по типу (prompt / candidates / total).
	GeminiTokensSpent = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "autonews_gemini_tokens_spent_total",
			Help: "Общее число токенов Gemini, потраченных на суммаризацию.",
		},
		[]string{"type"},
	)

	// HTTPRequestsTotal считает количество обработанных HTTP-запросов.
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "autonews_http_requests_total",
			Help: "Общее число обработанных HTTP-запросов.",
		},
		[]string{"method", "path", "status"},
	)

	// HTTPRequestDuration измеряет время обработки HTTP-запросов.
	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "autonews_http_request_duration_seconds",
			Help: "Время обработки HTTP-запросов в секундах.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	// ActiveUsers отслеживает число активных сессий/пользователей на сайте.
	ActiveUsers = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "autonews_active_users",
			Help: "Текущее число активных пользователей в приложении.",
		},
	)
)
