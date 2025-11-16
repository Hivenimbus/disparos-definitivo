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
	apiKey  string
	http    *http.Client
}

type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("evolution API error %d: %s", e.StatusCode, e.Message)
}

func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		baseURL: strings.TrimSuffix(baseURL, "/"),
		apiKey:  apiKey,
		http: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) SendText(ctx context.Context, instanceID, number, text string) error {
	payload := map[string]string{
		"number": number,
		"text":   text,
	}
	return c.post(ctx, fmt.Sprintf("/message/sendText/%s", instanceID), payload)
}

type MediaPayload struct {
	Number    string `json:"number"`
	MediaType string `json:"mediatype"`
	MimeType  string `json:"mimetype"`
	Caption   string `json:"caption"`
	Media     string `json:"media"`
	FileName  string `json:"fileName"`
}

func (c *Client) SendMedia(ctx context.Context, instanceID string, payload MediaPayload) error {
	return c.post(ctx, fmt.Sprintf("/message/sendMedia/%s", instanceID), payload)
}

func (c *Client) SendAudio(ctx context.Context, instanceID, number string, mediaURL string) error {
	payload := map[string]any{
		"number": number,
		"audio":  mediaURL,
	}
	return c.post(ctx, fmt.Sprintf("/message/sendWhatsAppAudio/%s", instanceID), payload)
}

func (c *Client) post(ctx context.Context, path string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
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


