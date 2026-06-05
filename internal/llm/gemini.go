package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/greg5320/AutoNews/internal/metrics"
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
		UsageMetadata struct {
			PromptTokenCount     int `json:"promptTokenCount"`
			CandidatesTokenCount int `json:"candidatesTokenCount"`
			TotalTokenCount      int `json:"totalTokenCount"`
		} `json:"usageMetadata"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("пустой ответ от модели")
	}

	// Записываем метрики токенов в Prometheus
	metrics.GeminiTokensSpent.WithLabelValues("prompt").Add(float64(geminiResp.UsageMetadata.PromptTokenCount))
	metrics.GeminiTokensSpent.WithLabelValues("candidates").Add(float64(geminiResp.UsageMetadata.CandidatesTokenCount))
	metrics.GeminiTokensSpent.WithLabelValues("total").Add(float64(geminiResp.UsageMetadata.TotalTokenCount))

	// Рассчитываем приблизительную стоимость для Gemini 3.1 Flash-Lite:
	// Входные токены (prompt): $0.10 за 1,000,000 токенов ($0.00000010 за штуку)
	// Выходные токены (candidates): $0.40 за 1,000,000 токенов ($0.00000040 за штуку)
	promptCost := float64(geminiResp.UsageMetadata.PromptTokenCount) * 0.10 / 1000000
	candidatesCost := float64(geminiResp.UsageMetadata.CandidatesTokenCount) * 0.40 / 1000000
	totalCost := promptCost + candidatesCost
	metrics.GeminiCostUSD.Add(totalCost)

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
