package logger

import (
	"log"
	"os"
)

// Init инициализирует базовый логгер для проекта.
// TODO: в будущем можно будет прикрутить zap или logrus, если логов станет много.
func Init() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("Логгер инициализирован. Погнали!")
}
