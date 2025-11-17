package supabase

import "time"

type ContactRow struct {
	ID       string  `json:"id"`
	Name     *string `json:"name"`
	Whatsapp string  `json:"whatsapp"`
	Var1     *string `json:"var1"`
	Var2     *string `json:"var2"`
	Var3     *string `json:"var3"`
}

type AttachmentRow struct {
	ID        string  `json:"id"`
	FileName  string  `json:"file_name"`
	MimeType  string  `json:"mime_type"`
	PublicURL string  `json:"public_url"`
	Caption   *string `json:"caption"`
}

type AttachmentDescriptor struct {
	Type    string  `json:"type"`
	Name    string  `json:"name"`
	Caption *string `json:"caption"`
}

type MessageRow struct {
	ID          string          `json:"id"`
	Body        *string         `json:"body"`
	Attachments []AttachmentRow `json:"attachments"`
}

type ConfigRow struct {
	IntervaloSegundos *int `json:"intervalo_segundos"`
}

type JobRow struct {
	ID                    string                 `json:"id"`
	UserID                string                 `json:"user_id"`
	Status                string                 `json:"status"`
	TotalContacts         int                    `json:"total_contacts"`
	Processed             int                    `json:"processed_contacts"`
	Success               int                    `json:"success_contacts"`
	Failed                int                    `json:"failed_contacts"`
	RequestedStop         bool                   `json:"requested_stop"`
	LastError             *string                `json:"last_error"`
	LastContactName       *string                `json:"last_contact_name"`
	StartedAt             *time.Time             `json:"started_at"`
	FinishedAt            *time.Time             `json:"finished_at"`
	CreatedAt             time.Time              `json:"created_at"`
	UpdatedAt             time.Time              `json:"updated_at"`
	MessageTemplate       string                 `json:"message_template"`
	AttachmentDescriptors []AttachmentDescriptor `json:"attachment_descriptors"`
	AttachmentsSnapshot   []AttachmentRow        `json:"attachments_snapshot"`
	DelaySeconds          int                    `json:"delay_seconds"`
	ConfigSnapshot        map[string]any         `json:"config_snapshot"`
}

type SendJobSummary struct {
	ID              string     `json:"id"`
	Status          string     `json:"status"`
	TotalContacts   int        `json:"totalContacts"`
	Processed       int        `json:"processedContacts"`
	Success         int        `json:"successContacts"`
	Failed          int        `json:"failedContacts"`
	RequestedStop   bool       `json:"requestedStop"`
	LastError       *string    `json:"lastError"`
	LastContactName *string    `json:"lastContactName"`
	StartedAt       *time.Time `json:"startedAt"`
	FinishedAt      *time.Time `json:"finishedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type JobLogRow struct {
	ID             string                 `json:"id"`
	JobID          string                 `json:"job_id"`
	Sequence       int                    `json:"sequence"`
	Status         string                 `json:"status"`
	ContactID      string                 `json:"contact_id"`
	ContactName    *string                `json:"contact_name"`
	Whatsapp       string                 `json:"whatsapp"`
	ContactPayload ContactRow             `json:"contact_payload"`
	Attachments    []AttachmentDescriptor `json:"attachments"`
	Error          *string                `json:"error"`
	MessagePreview *string                `json:"message_preview"`
	ProcessedAt    *time.Time             `json:"processed_at"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

func NormalizeSummary(row *JobRow) *SendJobSummary {
	if row == nil {
		return nil
	}
	return &SendJobSummary{
		ID:              row.ID,
		Status:          row.Status,
		TotalContacts:   row.TotalContacts,
		Processed:       row.Processed,
		Success:         row.Success,
		Failed:          row.Failed,
		RequestedStop:   row.RequestedStop,
		LastError:       row.LastError,
		LastContactName: row.LastContactName,
		StartedAt:       row.StartedAt,
		FinishedAt:      row.FinishedAt,
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}
}
