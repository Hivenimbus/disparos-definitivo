package supabase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL string
	apiKey  string
	http    *http.Client
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

func (c *Client) CreateQueuedJob(ctx context.Context, userID string, totalContacts int) (*JobRow, error) {
	payload := map[string]any{
		"user_id":            userID,
		"status":             "queued",
		"total_contacts":     totalContacts,
		"processed_contacts": 0,
		"success_contacts":   0,
		"failed_contacts":    0,
	}
	var rows []JobRow
	if err := c.do(ctx, http.MethodPost, "/dashboard_send_jobs", nil, payload, &rows, "return=representation"); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("supabase returned no job row")
	}
	return &rows[0], nil
}

func (c *Client) UpdateJob(ctx context.Context, jobID string, patch map[string]any) error {
	q := url.Values{}
	q.Set("id", "eq."+jobID)
	var rows []JobRow
	return c.do(ctx, http.MethodPatch, "/dashboard_send_jobs", q, patch, &rows, "return=representation")
}

func (c *Client) FetchLatestJob(ctx context.Context, userID string) (*JobRow, error) {
	q := url.Values{}
	q.Set("user_id", "eq."+userID)
	q.Set("order", "created_at.desc")
	q.Set("limit", "1")
	var rows []JobRow
	if err := c.do(ctx, http.MethodGet, "/dashboard_send_jobs", q, nil, &rows, ""); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return &rows[0], nil
}

func (c *Client) ListActiveJobs(ctx context.Context) ([]JobRow, error) {
	q := url.Values{}
	q.Set("status", "in.(queued,processing)")
	q.Set("order", "created_at.asc")
	var rows []JobRow
	if err := c.do(ctx, http.MethodGet, "/dashboard_send_jobs", q, nil, &rows, ""); err != nil {
		return nil, err
	}
	return rows, nil
}

func (c *Client) InsertContactLogs(ctx context.Context, jobID string, contacts []ContactRow, attachments []AttachmentDescriptor) error {
	if len(contacts) == 0 {
		return nil
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	rows := make([]map[string]any, 0, len(contacts))
	for _, contact := range contacts {
		rows = append(rows, map[string]any{
			"job_id":       jobID,
			"contact_id":   contact.ID,
			"contact_name": contact.Name,
			"whatsapp":     contact.Whatsapp,
			"status":       "pending",
			"attachments":  attachments,
			"created_at":   now,
			"updated_at":   now,
		})
	}
	return c.do(ctx, http.MethodPost, "/dashboard_send_job_logs", nil, rows, nil, "")
}

func (c *Client) UpdateContactLog(ctx context.Context, jobID string, contact ContactRow, patch map[string]any) error {
	q := url.Values{}
	q.Set("job_id", "eq."+jobID)
	if contact.ID != "" {
		q.Set("contact_id", "eq."+contact.ID)
	} else {
		q.Set("whatsapp", "eq."+contact.Whatsapp)
	}
	return c.do(ctx, http.MethodPatch, "/dashboard_send_job_logs", q, patch, nil, "")
}

func (c *Client) DeleteJobData(ctx context.Context, jobID string) error {
	qLogs := url.Values{}
	qLogs.Set("job_id", "eq."+jobID)
	if err := c.do(ctx, http.MethodDelete, "/dashboard_send_job_logs", qLogs, nil, nil, ""); err != nil {
		return err
	}
	qJob := url.Values{}
	qJob.Set("id", "eq."+jobID)
	return c.do(ctx, http.MethodDelete, "/dashboard_send_jobs", qJob, nil, nil, "")
}

func (c *Client) LoadMessage(ctx context.Context, userID string) (*MessageRow, error) {
	q := url.Values{}
	q.Set("select", "id,body,attachments:dashboard_message_attachments(id,file_name,mime_type,public_url,caption)")
	q.Set("user_id", "eq."+userID)
	q.Set("order", "created_at.desc")
	q.Set("limit", "1")
	var rows []MessageRow
	if err := c.do(ctx, http.MethodGet, "/dashboard_messages", q, nil, &rows, ""); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return &rows[0], nil
}

func (c *Client) LoadContacts(ctx context.Context, userID string) ([]ContactRow, error) {
	q := url.Values{}
	q.Set("select", "id,name,whatsapp,var1,var2,var3")
	q.Set("user_id", "eq."+userID)
	q.Set("order", "created_at.asc")
	var rows []ContactRow
	if err := c.do(ctx, http.MethodGet, "/dashboard_contacts", q, nil, &rows, ""); err != nil {
		return nil, err
	}
	filtered := make([]ContactRow, 0, len(rows))
	for _, row := range rows {
		if strings.TrimSpace(row.Whatsapp) == "" {
			continue
		}
		filtered = append(filtered, row)
	}
	return filtered, nil
}

func (c *Client) LoadConfig(ctx context.Context, userID string) (*ConfigRow, error) {
	q := url.Values{}
	q.Set("select", "intervalo_segundos")
	q.Set("user_id", "eq."+userID)
	q.Set("limit", "1")
	var rows []ConfigRow
	if err := c.do(ctx, http.MethodGet, "/configuracoes", q, nil, &rows, ""); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return &rows[0], nil
}

func (c *Client) do(ctx context.Context, method, path string, query url.Values, body any, out any, prefer string) error {
	u := c.baseURL + path
	if query != nil && len(query) > 0 {
		u = u + "?" + query.Encode()
	}

	var buf io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return err
		}
		buf = bytes.NewReader(data)
	}

	req, err := http.NewRequestWithContext(ctx, method, u, buf)
	if err != nil {
		return err
	}
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if prefer != "" {
		req.Header.Set("Prefer", prefer)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("supabase error %s: %s", resp.Status, strings.TrimSpace(string(data)))
	}

	if out == nil {
		return nil
	}

	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		return err
	}
	return nil
}
