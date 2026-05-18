package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// AIAnalysisResult содержит результаты анализа статьи нейросетью.
type AIAnalysisResult struct {
	Summary string   `json:"summary"`
	Tags    []string `json:"tags"`
}

// GeminiClient — простой клиент для работы с Gemini API
type GeminiClient struct {
	apiKey string
	client *http.Client
}

func NewGeminiClient(apiKey string) *GeminiClient {
	return &GeminiClient{
		apiKey: apiKey,
		client: &http.Client{},
	}
}

// AnalyzeText отправляет текст в LLM и возвращает выжимку + теги в структурированном виде
func (g *GeminiClient) AnalyzeText(ctx context.Context, text string) (*AIAnalysisResult, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%s", g.apiKey)

	prompt := `Проанализируй новость. Сделай краткую выжимку (summary) и придумай от 3 до 5 релевантных тегов (tags).
Верни ответ СТРОГО в формате JSON, без маркдауна и лишних символов:
{"summary": "текст", "tags": ["тег1", "тег2"]}
Текст: ` + text

	// Формируем payload по спеке гугла
	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json", // Заставляем модель вернуть валидный JSON
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("ошибка сборки JSON: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка при обращении к API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("bad status %d: %s", resp.StatusCode, string(respBody))
	}

	// Парсим ответ гугла
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("пустой ответ от модели")
	}

	rawText := geminiResp.Candidates[0].Content.Parts[0].Text
	
	// Иногда модель все равно оборачивает JSON в markdown-блоки ```json ... ```
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	var result AIAnalysisResult
	if err := json.Unmarshal([]byte(rawText), &result); err != nil {
		return nil, fmt.Errorf("ошибка парсинга JSON от модели: %w (текст: %s)", err, rawText)
	}

	return &result, nil
}
