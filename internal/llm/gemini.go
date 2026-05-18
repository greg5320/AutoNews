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

var AllowedTags = []string{
	"Политика", "Экономика", "Общество", "Происшествия", "Бизнес",
	"Наука", "Технологии", "Медицина", "Здоровье", "Образование",
	"Спорт", "Культура", "Искусство", "Кино", "Музыка",
	"Путешествия", "Авто", "Недвижимость", "Криминал", "Экология",
	"Погода", "Мода", "Еда", "Игры", "История",
	"Финансы", "Психология", "Лайфстайл", "Религия", "Юмор",
}

type AIAnalysisResult struct {
	Summary string   `json:"summary"`
	Tags    []string `json:"tags"`
}

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

func (g *GeminiClient) AnalyzeText(ctx context.Context, text string) (*AIAnalysisResult, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=%s", g.apiKey)

	allowedTagsStr := strings.Join(AllowedTags, ", ")
	prompt := fmt.Sprintf(`Проанализируй новость. Сделай краткую выжимку (summary) и выбери от 3 до 5 релевантных тегов (tags).
ВНИМАНИЕ: Теги можно выбирать СТРОГО и ТОЛЬКО из этого списка: [%s].
Верни ответ СТРОГО в формате JSON, без маркдауна и лишних символов:
{"summary": "текст", "tags": ["тег1", "тег2"]}
Текст: %s`, allowedTagsStr, text)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
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
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	var result AIAnalysisResult
	if err := json.Unmarshal([]byte(rawText), &result); err != nil {
		return nil, fmt.Errorf("ошибка парсинга JSON от модели: %w (текст: %s)", err, rawText)
	}

	return &result, nil
}
