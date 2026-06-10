package rss

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/greg5320/AutoNews/internal/models"
)

type TelegramParser struct {
	client *http.Client
}

func NewTelegramParser() *TelegramParser {
	return &TelegramParser{
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func NormalizeTelegramURL(url string) string {
	url = strings.TrimSpace(url)
	if url == "" {
		return ""
	}
	
	// Remove leading @ if present
	if strings.HasPrefix(url, "@") {
		return "https://t.me/s/" + url[1:]
	}
	
	// If it doesn't contain t.me, but is just a username (no slashes, no dots)
	if !strings.Contains(url, "/") && !strings.Contains(url, ".") {
		return "https://t.me/s/" + url
	}
	
	// If it contains t.me/s/
	if strings.Contains(url, "t.me/s/") {
		if !strings.HasPrefix(url, "http") {
			url = "https://" + url
		}
		return url
	}
	
	// If it contains t.me/ but not t.me/s/
	if strings.Contains(url, "t.me/") {
		if !strings.HasPrefix(url, "http") {
			url = "https://" + url
		}
		url = strings.Replace(url, "t.me/", "t.me/s/", 1)
		return url
	}
	
	return url
}

func IsTelegramURL(url string) bool {
	return strings.Contains(url, "t.me/") || strings.HasPrefix(url, "@") || (!strings.Contains(url, "/") && !strings.Contains(url, "."))
}

func (p *TelegramParser) FetchArticles(ctx context.Context, channelURL string) ([]models.Article, error) {
	normalizedURL := NormalizeTelegramURL(channelURL)
	if normalizedURL == "" {
		return nil, fmt.Errorf("invalid telegram URL")
	}

	req, err := http.NewRequestWithContext(ctx, "GET", normalizedURL, nil)
	if err != nil {
		return nil, err
	}
	// Telegram public preview requires a browser-like User-Agent
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("telegram returned status %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	var articles []models.Article

	doc.Find(".tgme_widget_message").Each(func(i int, s *goquery.Selection) {
		// Post content
		textSel := s.Find(".tgme_widget_message_text")
		if textSel.Length() == 0 {
			return // Skip messages without text (e.g. photos/files only)
		}

		// Extract post text
		content := strings.TrimSpace(textSel.Text())
		if content == "" {
			return
		}

		// Extract post link
		dateSel := s.Find("a.tgme_widget_message_date")
		postURL := ""
		if dateSel.Length() > 0 {
			if href, exists := dateSel.Attr("href"); exists {
				postURL = href
			}
		}

		// Generate title from the first sentence or first 80 characters
		title := "Telegram Post"
		lines := strings.Split(content, "\n")
		if len(lines) > 0 {
			firstLine := strings.TrimSpace(lines[0])
			if len(firstLine) > 80 {
				title = firstLine[:77] + "..."
			} else if len(firstLine) > 0 {
				title = firstLine
			}
		}

		articles = append(articles, models.Article{
			Title:       title,
			Content:     content,
			OriginalURL: &postURL,
			Status:      "new",
		})
	})

	return articles, nil
}
