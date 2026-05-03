package main

import (
	"log"

	"github.com/greg5320/AutoNews/internal/logger"
)

func main() {
	// Инициализируем логгер
	logger.Init()

	log.Println("Запуск AutoNews... Пока просто пустая оболочка.")

	// TODO: Добавить чтение конфига из env или yaml
	// TODO: Инициализировать подключение к БД
}
