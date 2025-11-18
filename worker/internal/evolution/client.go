package evolution

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	baseURL string
	client  *http.Client
}

type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("evolution API error %d: %s", e.StatusCode, e.Message)
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimSuffix(baseURL, "/"),
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) SendText(ctx context.Context, userAPIKey, number, text string) error {
	payload := map[string]any{
		"number": number,
		"text":   text,
	}
	return c.post(ctx, userAPIKey, "/send/text", payload)
}

type MediaPayload struct {
	Number  string  `json:"number"`
	Type    string  `json:"type"`
	URL     string  `json:"url"`
	Caption *string `json:"caption,omitempty"`
}

func (c *Client) SendMedia(ctx context.Context, userAPIKey string, payload MediaPayload) error {
	return c.post(ctx, userAPIKey, "/send/media", payload)
}

func (c *Client) post(ctx context.Context, userAPIKey, path string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("apikey", userAPIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return &APIError{
			StatusCode: resp.StatusCode,
			Message:    strings.TrimSpace(string(body)),
		}
	}
	return nil
}


