package db

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// NewPostgresDB подключается к постгресу.
func NewPostgresDB() (*sqlx.DB, error) {
	// Внутри Docker мы подключаемся по имени сервиса 'postgres'
	// TODO: обязательно вынести это в .env, сейчас для теста поменял localhost на postgres
	dsn := "host=postgres port=5432 user=postgres password=postgres dbname=autonews sslmode=disable"
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("ошибка подключения к бд: %w", err)
	}

	log.Println("Успешно подключились к PostgreSQL")
	if err := EnsureSchema(db); err != nil {
		log.Printf("Предупреждение: ошибка проверки/создания таблиц изоляции: %v\n", err)
	}
	return db, nil
}

func EnsureSchema(db *sqlx.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS rss_feeds (
		id SERIAL PRIMARY KEY,
		url TEXT UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL DEFAULT 'Hacker News',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS articles (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		content TEXT NOT NULL,
		ai_summary TEXT,
		tags TEXT[],
		status VARCHAR(50) DEFAULT 'new',
		original_url TEXT UNIQUE,
		feed_id INT REFERENCES rss_feeds(id) ON DELETE SET NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS settings (
		key VARCHAR(50) PRIMARY KEY,
		value TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS user_feeds (
		user_id VARCHAR(255) NOT NULL,
		feed_id INT NOT NULL REFERENCES rss_feeds(id) ON DELETE CASCADE,
		PRIMARY KEY (user_id, feed_id)
	);

	CREATE TABLE IF NOT EXISTS user_deleted_articles (
		user_id VARCHAR(255) NOT NULL,
		article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
		PRIMARY KEY (user_id, article_id)
	);

	CREATE TABLE IF NOT EXISTS user_metadata (
		user_id VARCHAR(255) PRIMARY KEY,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	INSERT INTO settings (key, value) VALUES ('cron_interval', '10') ON CONFLICT DO NOTHING;
	INSERT INTO rss_feeds (url, name) VALUES ('https://hnrss.org/frontpage', 'Hacker News') ON CONFLICT DO NOTHING;
	`
	_, err := db.Exec(schema)
	return err
}
