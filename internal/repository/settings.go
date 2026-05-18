package repository

import (
	"log"

	"github.com/jmoiron/sqlx"
)

type SettingsRepository struct {
	db *sqlx.DB
}

func NewSettingsRepository(db *sqlx.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get(key string, defaultValue string) string {
	var val string
	err := r.db.Get(&val, "SELECT value FROM settings WHERE key = $1", key)
	if err != nil {
		log.Printf("Warning: failed to get setting %s: %v", key, err)
		return defaultValue
	}
	return val
}

func (r *SettingsRepository) Set(key string, value string) error {
	query := `
		INSERT INTO settings (key, value) 
		VALUES ($1, $2) 
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
	_, err := r.db.Exec(query, key, value)
	return err
}
