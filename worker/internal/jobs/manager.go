package jobs

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"sync"
	"time"

	"github.com/jpcb2/disparos-definitivo/worker/internal/evolution"
	"github.com/jpcb2/disparos-definitivo/worker/internal/supabase"
)

var finishedStatuses = map[string]struct{}{
	"completed": {},
	"failed":    {},
	"stopped":   {},
}

var (
	ErrJobInProgress       = errors.New("job already running")
	ErrNoActiveJob         = errors.New("no active job")
	ErrJobStillRunning     = errors.New("job still running")
	ErrJobNotFinished      = errors.New("job not finished")
	ErrJobAlreadyPaused    = errors.New("job already paused")
	ErrJobNotPaused        = errors.New("job is not paused")
	ErrNoMessageConfigured = errors.New("no message configured")
	ErrNoContentConfigured = errors.New("no message or attachments configured")
	ErrNoContacts          = errors.New("no contacts available")
)

type Manager struct {
	supabase     *supabase.Client
	evolution    *evolution.Client
	defaultDelay time.Duration
	activeMu     sync.RWMutex
	active       map[string]*ActiveJob
	logger       *log.Logger
}

type ActiveJob struct {
	mu          sync.RWMutex
	runtime     *supabase.SendJobSummary
	messageBody string
	attachments []supabase.AttachmentRow
	descriptors []supabase.AttachmentDescriptor
	contacts    []supabase.ContactRow
	delay       time.Duration
	userID      string
	resumed     bool
	paused      bool
}

func NewManager(
	supabaseClient *supabase.Client,
	evolutionClient *evolution.Client,
	defaultDelaySeconds int,
	logger *log.Logger,
) *Manager {
	return &Manager{
		supabase:     supabaseClient,
		evolution:    evolutionClient,
		defaultDelay: time.Duration(defaultDelaySeconds) * time.Second,
		active:       make(map[string]*ActiveJob),
		logger:       logger,
	}
}

func (m *Manager) Shutdown(ctx context.Context) {
	m.activeMu.Lock()
	defer m.activeMu.Unlock()

	var wg sync.WaitGroup
	for userID, active := range m.active {
		m.logger.Printf("[worker] stopping job user_id=%s...", userID)
		wg.Add(1)
		go func(u string, a *ActiveJob) {
			defer wg.Done()
			a.update(func(runtime *supabase.SendJobSummary) {
				runtime.RequestedStop = true
			})
		}(userID, active)
	}
	// We don't wait for actual job completion here because they run in separate goroutines
	// and check requestedStop. The important part is signaling stop.
	m.logger.Println("[worker] shutdown signal sent to all jobs")
}

func (m *Manager) RecoverActiveJobs(ctx context.Context) {
	rows, err := m.supabase.ListActiveJobs(ctx)
	if err != nil {
		m.logger.Printf("[worker] failed to list active jobs for recovery: %v", err)
		return
	}
	for i := range rows {
		row := rows[i]
		if err := m.resumeJob(ctx, &row); err != nil {
			m.logger.Printf("[worker] failed to resume job job_id=%s user_id=%s: %v", row.ID, row.UserID, err)
			msg := "disparo interrompido devido a falha na retomada do worker"
			if closeErr := m.forceCloseJob(ctx, &row, "failed", msg); closeErr != nil {
				m.logger.Printf("[worker] failed to close orphan job job_id=%s user_id=%s: %v", row.ID, row.UserID, closeErr)
			}
		}
	}
}

func (m *Manager) resumeJob(ctx context.Context, row *supabase.JobRow) error {
	// Check if job is already active in memory
	if m.hasActiveJob(row.UserID) {
		return ErrJobInProgress
	}

	logs, err := m.supabase.LoadJobLogs(ctx, row.ID)
	if err != nil {
		return err
	}

	if row.RequestedStop {
		if err := m.forceCloseJob(ctx, row, "stopped", "disparo cancelado antes da retomada"); err != nil {
			return err
		}
		return nil
	}

	pendingContacts := make([]supabase.ContactRow, 0)
	successCount := 0
	failedCount := 0
	var lastContactName *string
	lastError := row.LastError

	for _, logRow := range logs {
		switch logRow.Status {
		case "success":
			successCount++
			name := firstNonEmpty(ptrValue(logRow.ContactPayload.Name), logRow.ContactPayload.Whatsapp)
			if strings.TrimSpace(name) != "" {
				nameCopy := name
				lastContactName = &nameCopy
			}
		case "failed":
			failedCount++
			name := firstNonEmpty(ptrValue(logRow.ContactPayload.Name), logRow.ContactPayload.Whatsapp)
			if strings.TrimSpace(name) != "" {
				nameCopy := name
				lastContactName = &nameCopy
			}
			if logRow.Error != nil {
				lastError = logRow.Error
			}
		case "pending":
			pendingContacts = append(pendingContacts, logRow.ContactPayload)
		}
	}

	if len(pendingContacts) == 0 {
		finalStatus := "completed"
		if row.RequestedStop {
			finalStatus = "stopped"
		}
		if failedCount > 0 && successCount == 0 {
			finalStatus = "failed"
		}
		if err := m.forceCloseJob(ctx, row, finalStatus, "job finalizado durante recuperação"); err != nil {
			return err
		}
		return nil
	}

	delay := time.Duration(row.DelaySeconds) * time.Second
	if delay <= 0 {
		delay = m.defaultDelay
	}

	runtime := supabase.NormalizeSummary(row)
	runtime.Status = "processing"
	runtime.Processed = successCount + failedCount
	runtime.Success = successCount
	runtime.Failed = failedCount
	runtime.LastContactName = lastContactName
	runtime.LastError = lastError
	runtime.RequestedStop = row.RequestedStop
	runtime.PauseRequested = row.PauseRequested

	active := &ActiveJob{
		runtime:     runtime,
		messageBody: strings.TrimSpace(row.MessageTemplate),
		attachments: filterAttachments(row.AttachmentsSnapshot),
		descriptors: row.AttachmentDescriptors,
		contacts:    pendingContacts,
		delay:       delay,
		userID:      row.UserID,
		resumed:     true,
		paused:      row.PauseRequested,
	}

	m.activeMu.Lock()
	m.active[row.UserID] = active
	m.activeMu.Unlock()

	go m.runJob(context.Background(), active)

	m.logger.Printf("[worker] resumed job user_id=%s job_id=%s processed=%d remaining=%d", row.UserID, row.ID, runtime.Processed, len(pendingContacts))
	return nil
}

func (m *Manager) StartJob(ctx context.Context, userID string) (*supabase.SendJobSummary, error) {
	if userID == "" {
		return nil, fmt.Errorf("user_id obrigatório")
	}
	if m.hasActiveJob(userID) {
		return nil, ErrJobInProgress
	}

	// Double check: ensure no other active job exists in DB before creating a new one
	existing, err := m.supabase.FetchActiveJob(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing active jobs: %w", err)
	}
	if existing != nil {
		return nil, ErrJobInProgress
	}

	if err := m.cleanupFinishedJob(ctx, userID); err != nil {
		return nil, err
	}

	message, contacts, cfg, err := m.loadJobInputs(ctx, userID)
	if err != nil {
		return nil, err
	}
	if message == nil {
		return nil, ErrNoMessageConfigured
	}

	messageBody := strings.TrimSpace(valueOrEmpty(message.Body))
	attachments := filterAttachments(message.Attachments)
	if messageBody == "" && len(attachments) == 0 {
		return nil, ErrNoContentConfigured
	}
	if len(contacts) == 0 {
		return nil, ErrNoContacts
	}

	delay := m.defaultDelay
	if cfg != nil && cfg.IntervaloSegundos != nil && *cfg.IntervaloSegundos >= 0 {
		delay = time.Duration(*cfg.IntervaloSegundos) * time.Second
	}

	descriptors := buildAttachmentDescriptors(attachments)
	jobRow, err := m.supabase.CreateQueuedJob(ctx, supabase.CreateJobInput{
		UserID:                userID,
		TotalContacts:         len(contacts),
		MessageTemplate:       messageBody,
		AttachmentDescriptors: descriptors,
		AttachmentsSnapshot:   attachments,
		DelaySeconds:          int(delay / time.Second),
		ConfigSnapshot:        buildConfigSnapshot(cfg),
		PauseRequested:        false,
	})
	if err != nil {
		return nil, err
	}

	if err := m.supabase.InsertContactLogs(ctx, jobRow.ID, contacts, descriptors); err != nil {
		return nil, err
	}

	active := &ActiveJob{
		runtime:     supabase.NormalizeSummary(jobRow),
		messageBody: messageBody,
		attachments: attachments,
		descriptors: descriptors,
		contacts:    contacts,
		delay:       delay,
		userID:      userID,
	}

	m.activeMu.Lock()
	m.active[userID] = active
	m.activeMu.Unlock()

	go m.runJob(context.Background(), active)

	return active.snapshot(), nil
}

func (m *Manager) RequestStop(ctx context.Context, userID string) (*supabase.SendJobSummary, error) {
	if job := m.getActiveJob(userID); job != nil {
		summary := job.snapshot()
		job.update(func(runtime *supabase.SendJobSummary) {
			runtime.RequestedStop = true
			runtime.PauseRequested = false
			job.paused = false
		})
		if err := m.supabase.UpdateJob(ctx, summary.ID, patchWithTimestamp(map[string]any{
			"requested_stop":  true,
			"pause_requested": false,
			"paused_at":       nil,
		})); err != nil {
			return nil, err
		}
		return job.snapshot(), nil
	}

	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, ErrNoActiveJob
	}
	if _, ok := finishedStatuses[row.Status]; ok {
		return nil, ErrNoActiveJob
	}
	summary, err := m.stopOrphanJob(ctx, row)
	if err != nil {
		return nil, err
	}
	return summary, nil
}

func (m *Manager) RequestPause(ctx context.Context, userID string) (*supabase.SendJobSummary, error) {
	if job := m.getActiveJob(userID); job != nil {
		if job.pausedState() {
			return job.snapshot(), ErrJobAlreadyPaused
		}
		job.update(func(runtime *supabase.SendJobSummary) {
			runtime.PauseRequested = true
		})
		job.paused = true
		if err := m.supabase.UpdateJob(ctx, job.runtime.ID, patchWithTimestamp(map[string]any{
			"pause_requested": true,
			"paused_at":       time.Now().UTC(),
		})); err != nil {
			return nil, err
		}
		return job.snapshot(), nil
	}

	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, ErrNoActiveJob
	}
	if _, ok := finishedStatuses[row.Status]; ok {
		return nil, ErrNoActiveJob
	}
	if row.PauseRequested {
		return supabase.NormalizeSummary(row), ErrJobAlreadyPaused
	}
	if err := m.supabase.UpdateJob(ctx, row.ID, patchWithTimestamp(map[string]any{
		"pause_requested": true,
		"paused_at":       time.Now().UTC(),
	})); err != nil {
		return nil, err
	}
	row.PauseRequested = true
	now := time.Now().UTC()
	row.PausedAt = &now
	return supabase.NormalizeSummary(row), nil
}

func (m *Manager) ResumeJob(ctx context.Context, userID string) (*supabase.SendJobSummary, error) {
	if job := m.getActiveJob(userID); job != nil {
		if !job.pausedState() {
			return job.snapshot(), ErrJobNotPaused
		}
		job.update(func(runtime *supabase.SendJobSummary) {
			runtime.PauseRequested = false
		})
		job.paused = false
		if err := m.supabase.UpdateJob(ctx, job.runtime.ID, patchWithTimestamp(map[string]any{
			"pause_requested": false,
			"paused_at":       nil,
		})); err != nil {
			return nil, err
		}
		return job.snapshot(), nil
	}

	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return nil, err
	}
	if row == nil || !row.PauseRequested {
		return nil, ErrJobNotPaused
	}
	if _, ok := finishedStatuses[row.Status]; ok {
		return nil, ErrJobNotPaused
	}
	if err := m.supabase.UpdateJob(ctx, row.ID, patchWithTimestamp(map[string]any{
		"pause_requested": false,
		"paused_at":       nil,
	})); err != nil {
		return nil, err
	}
	row.PauseRequested = false
	row.PausedAt = nil

	if err := m.resumeJob(ctx, row); err != nil {
		return nil, err
	}

	return supabase.NormalizeSummary(row), nil
}

func (m *Manager) GetStatus(ctx context.Context, userID string) (*supabase.SendJobSummary, error) {
	if job := m.getActiveJob(userID); job != nil {
		return job.snapshot(), nil
	}
	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, nil
	}
	return supabase.NormalizeSummary(row), nil
}

func (m *Manager) Finalize(ctx context.Context, userID string, force bool) error {
	if m.hasActiveJob(userID) {
		return ErrJobStillRunning
	}
	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return err
	}
	if row == nil {
		return nil
	}
	if _, ok := finishedStatuses[row.Status]; ok {
		return m.supabase.DeleteJobData(ctx, row.ID)
	}
	if !force {
		return ErrJobNotFinished
	}

	targetStatus := "failed"
	reason := "limpeza forçada de disparo"
	if row.RequestedStop {
		targetStatus = "stopped"
		reason = "limpeza forçada após solicitação de parada"
	}

	if err := m.forceCloseJob(ctx, row, targetStatus, reason); err != nil {
		return err
	}
	return m.supabase.DeleteJobData(ctx, row.ID)
}

func (m *Manager) hasActiveJob(userID string) bool {
	m.activeMu.RLock()
	defer m.activeMu.RUnlock()
	_, ok := m.active[userID]
	return ok
}

func (m *Manager) getActiveJob(userID string) *ActiveJob {
	m.activeMu.RLock()
	defer m.activeMu.RUnlock()
	return m.active[userID]
}

func (a *ActiveJob) snapshot() *supabase.SendJobSummary {
	a.mu.RLock()
	defer a.mu.RUnlock()
	copy := *a.runtime
	return &copy
}

func (a *ActiveJob) update(fn func(runtime *supabase.SendJobSummary)) {
	a.mu.Lock()
	defer a.mu.Unlock()
	fn(a.runtime)
}

func (a *ActiveJob) requestedStop() bool {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.runtime.RequestedStop
}

func (a *ActiveJob) pausedState() bool {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return a.paused || a.runtime.PauseRequested
}

func (m *Manager) cleanupFinishedJob(ctx context.Context, userID string) error {
	row, err := m.supabase.FetchLatestJob(ctx, userID)
	if err != nil {
		return err
	}
	if row == nil {
		return nil
	}
	if _, ok := finishedStatuses[row.Status]; !ok {
		return nil
	}
	return m.supabase.DeleteJobData(ctx, row.ID)
}

func (m *Manager) loadJobInputs(ctx context.Context, userID string) (*supabase.MessageRow, []supabase.ContactRow, *supabase.ConfigRow, error) {
	message, err := m.supabase.LoadMessage(ctx, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	contacts, err := m.supabase.LoadContacts(ctx, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	config, err := m.supabase.LoadConfig(ctx, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	return message, contacts, config, nil
}

func (m *Manager) runJob(ctx context.Context, active *ActiveJob) {
	startSnapshot := active.snapshot()
	jobID := startSnapshot.ID
	userID := active.userID
	if !active.resumed {
		startedAt := time.Now().UTC()
		active.update(func(runtime *supabase.SendJobSummary) {
			runtime.Status = "processing"
			runtime.StartedAt = &startedAt
			runtime.Processed = 0
			runtime.Success = 0
			runtime.Failed = 0
		})
		if err := m.supabase.UpdateJob(ctx, jobID, patchWithTimestamp(map[string]any{
			"status":             "processing",
			"started_at":         startedAt,
			"processed_contacts": 0,
			"success_contacts":   0,
			"failed_contacts":    0,
		})); err != nil {
			m.logger.Printf("[worker] failed to update job start: %v", err)
		}

		m.logger.Printf("[worker] job started user_id=%s job_id=%s total=%d", userID, jobID, startSnapshot.TotalContacts)
	} else {
		if err := m.supabase.UpdateJob(ctx, jobID, patchWithTimestamp(map[string]any{
			"status":             "processing",
			"processed_contacts": startSnapshot.Processed,
			"success_contacts":   startSnapshot.Success,
			"failed_contacts":    startSnapshot.Failed,
			"requested_stop":     startSnapshot.RequestedStop,
			"last_error":         startSnapshot.LastError,
			"last_contact_name":  startSnapshot.LastContactName,
		})); err != nil {
			m.logger.Printf("[worker] failed to update resumed job state: %v", err)
		}
		m.logger.Printf("[worker] job resumed user_id=%s job_id=%s processed=%d remaining=%d", userID, jobID, startSnapshot.Processed, len(active.contacts))
	}

	for _, contact := range active.contacts {
		if active.requestedStop() {
			break
		}
		for active.pausedState() {
			time.Sleep(500 * time.Millisecond)
			if active.requestedStop() {
				break
			}
		}
		if active.requestedStop() {
			break
		}

		contactName := firstNonEmpty(ptrValue(contact.Name), contact.Whatsapp)
		active.update(func(runtime *supabase.SendJobSummary) {
			runtime.LastContactName = &contactName
		})

		messagePreview, err := m.handleContactSend(ctx, active, contact)
		now := time.Now().UTC()
		if err != nil {
			errMsg := err.Error()
			active.update(func(runtime *supabase.SendJobSummary) {
				runtime.Failed++
				runtime.LastError = &errMsg
			})
			if uErr := m.supabase.UpdateContactLog(ctx, jobID, contact, map[string]any{
				"status":          "failed",
				"message_preview": messagePreviewOrNil(messagePreview),
				"attachments":     active.descriptors,
				"error":           errMsg,
				"processed_at":    now,
				"updated_at":      now,
			}); uErr != nil {
				m.logger.Printf("[worker] update contact log failed: %v", uErr)
			}
		} else {
			active.update(func(runtime *supabase.SendJobSummary) {
				runtime.Success++
			})
			if uErr := m.supabase.UpdateContactLog(ctx, jobID, contact, map[string]any{
				"status":          "success",
				"message_preview": messagePreviewOrNil(messagePreview),
				"attachments":     active.descriptors,
				"error":           nil,
				"processed_at":    now,
				"updated_at":      now,
			}); uErr != nil {
				m.logger.Printf("[worker] update contact log failed: %v", uErr)
			}
		}

		active.update(func(runtime *supabase.SendJobSummary) {
			runtime.Processed++
		})

		current := active.snapshot()
		if err := m.supabase.UpdateJob(ctx, jobID, patchWithTimestamp(map[string]any{
			"processed_contacts": current.Processed,
			"success_contacts":   current.Success,
			"failed_contacts":    current.Failed,
			"requested_stop":     current.RequestedStop,
			"last_error":         current.LastError,
			"last_contact_name":  current.LastContactName,
		})); err != nil {
			m.logger.Printf("[worker] update job stats error: %v", err)
		}

		if active.requestedStop() {
			break
		}
		current = active.snapshot()
		if active.delay > 0 && current.Processed < current.TotalContacts {
			// Intervalo aleatório entre -20% e +20% do delay base
			baseDelay := float64(active.delay)
			variation := baseDelay * 0.2
			minDelay := baseDelay - variation
			// random increment between 0 and 2*variation
			randomInc := rand.Float64() * (2 * variation)
			finalDelay := time.Duration(minDelay + randomInc)

			time.Sleep(finalDelay)
		}
	}

	finalStatus := "completed"
	if active.requestedStop() {
		finalStatus = "stopped"
	}
	current := active.snapshot()
	if current.Failed > 0 && current.Success == 0 && !active.requestedStop() {
		finalStatus = "failed"
		if current.LastError == nil {
			msg := "falha inesperada no disparo"
			active.update(func(runtime *supabase.SendJobSummary) {
				runtime.LastError = &msg
			})
		}
	}

	finishedAt := time.Now().UTC()
	active.update(func(runtime *supabase.SendJobSummary) {
		runtime.Status = finalStatus
		runtime.FinishedAt = &finishedAt
	})
	current = active.snapshot()

	if err := m.supabase.UpdateJob(ctx, jobID, patchWithTimestamp(map[string]any{
		"status":            finalStatus,
		"finished_at":       finishedAt,
		"requested_stop":    current.RequestedStop,
		"last_error":        current.LastError,
		"last_contact_name": current.LastContactName,
	})); err != nil {
		m.logger.Printf("[worker] finalize job update error: %v", err)
	}

	if finalStatus == "stopped" {
		if err := m.supabase.DeleteJobData(ctx, jobID); err != nil {
			m.logger.Printf("[worker] failed to delete stopped job data: %v", err)
		}
	}

	m.activeMu.Lock()
	delete(m.active, userID)
	m.activeMu.Unlock()
}

func (m *Manager) handleContactSend(ctx context.Context, active *ActiveJob, contact supabase.ContactRow) (string, error) {
	number := sanitizePhoneNumber(contact.Whatsapp)
	if number == "" {
		return "", fmt.Errorf("número de WhatsApp inválido")
	}
	userAPIKey := active.userID
	messagePreview := ""

	if strings.TrimSpace(active.messageBody) != "" {
		messagePreview = renderMessage(active.messageBody, contact)
		if messagePreview != "" {
			if err := m.evolution.SendText(ctx, userAPIKey, number, messagePreview); err != nil {
				return messagePreview, err
			}
		}
	}

	for _, attachment := range active.attachments {
		if strings.TrimSpace(attachment.PublicURL) == "" {
			continue
		}
		mediaType := deriveMediaType(attachment.MimeType)
		payload := evolution.MediaPayload{
			Number: number,
			Type:   mediaType,
			URL:    attachment.PublicURL,
		}
		if mediaType != "audio" {
			caption := valueOrEmpty(attachment.Caption)
			if strings.TrimSpace(caption) != "" {
				renderedCaption := renderMessage(caption, contact)
				payload.Caption = &renderedCaption
			}
		}
		if err := m.evolution.SendMedia(ctx, userAPIKey, payload); err != nil {
			return messagePreview, err
		}
	}

	return messagePreview, nil
}

func buildConfigSnapshot(cfg *supabase.ConfigRow) map[string]any {
	if cfg == nil {
		return nil
	}
	snapshot := make(map[string]any)
	if cfg.IntervaloSegundos != nil {
		snapshot["intervalo_segundos"] = *cfg.IntervaloSegundos
	}
	return snapshot
}

func filterAttachments(rows []supabase.AttachmentRow) []supabase.AttachmentRow {
	result := make([]supabase.AttachmentRow, 0, len(rows))
	for _, row := range rows {
		if strings.TrimSpace(row.PublicURL) == "" {
			continue
		}
		result = append(result, row)
	}
	return result
}

func buildAttachmentDescriptors(rows []supabase.AttachmentRow) []supabase.AttachmentDescriptor {
	result := make([]supabase.AttachmentDescriptor, 0, len(rows))
	for _, row := range rows {
		result = append(result, supabase.AttachmentDescriptor{
			Type:    deriveMediaType(row.MimeType),
			Name:    row.FileName,
			Caption: row.Caption,
		})
	}
	return result
}

func deriveMediaType(mime string) string {
	if strings.HasPrefix(mime, "image/") {
		return "image"
	}
	if strings.HasPrefix(mime, "video/") {
		return "video"
	}
	if strings.HasPrefix(mime, "audio/") {
		return "audio"
	}
	return "document"
}

func sanitizePhoneNumber(value string) string {
	builder := strings.Builder{}
	for _, r := range value {
		if r >= '0' && r <= '9' {
			builder.WriteRune(r)
		}
	}
	return builder.String()
}

func resolveSpintax(text string) string {
	result := text
	spintax := spintaxPattern{}
	return spintax.replace(result)
}

type spintaxPattern struct{}

func (sp spintaxPattern) replace(text string) string {
	start := strings.Index(text, "{")
	if start == -1 {
		return text
	}
	end := strings.Index(text[start:], "}")
	if end == -1 {
		return text
	}
	end += start
	token := text[start+1 : end]
	lower := strings.ToLower(token)
	if lower == "nome" || lower == "nome_completo" || lower == "var1" || lower == "var2" || lower == "var3" {
		return text[:start] + "{" + token + "}" + sp.replace(text[end+1:])
	}
	if !strings.Contains(token, "|") {
		return text[:start] + "{" + token + "}" + sp.replace(text[end+1:])
	}
	options := strings.Split(token, "|")
	trimmed := make([]string, 0, len(options))
	for _, opt := range options {
		opt = strings.TrimSpace(opt)
		if opt != "" {
			trimmed = append(trimmed, opt)
		}
	}
	if len(trimmed) == 0 {
		return text[:start] + "{" + token + "}" + sp.replace(text[end+1:])
	}
	idx := time.Now().UnixNano() % int64(len(trimmed))
	replacement := trimmed[idx]
	newText := text[:start] + replacement + text[end+1:]
	return sp.replace(newText)
}

func renderMessage(body string, contact supabase.ContactRow) string {
	if strings.TrimSpace(body) == "" {
		return ""
	}
	rendered := resolveSpintax(body)
	result := placeholderPattern(rendered, contact)
	return strings.TrimSpace(result)
}

func placeholderPattern(text string, contact supabase.ContactRow) string {
	var builder strings.Builder
	for i := 0; i < len(text); i++ {
		if text[i] == '{' {
			j := strings.IndexByte(text[i:], '}')
			if j == -1 {
				builder.WriteByte(text[i])
				continue
			}
			j += i
			key := strings.TrimSpace(text[i+1 : j])
			builder.WriteString(resolvePlaceholder(key, contact))
			i = j
			continue
		}
		builder.WriteByte(text[i])
	}
	return builder.String()
}

func resolvePlaceholder(key string, contact supabase.ContactRow) string {
	switch strings.ToLower(key) {
	case "nome":
		return extractFirstName(ptrValue(contact.Name))
	case "nome_completo":
		return strings.TrimSpace(ptrValue(contact.Name))
	case "var1":
		return strings.TrimSpace(ptrValue(contact.Var1))
	case "var2":
		return strings.TrimSpace(ptrValue(contact.Var2))
	case "var3":
		return strings.TrimSpace(ptrValue(contact.Var3))
	default:
		return "{" + key + "}"
	}
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func ptrValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func extractFirstName(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	parts := strings.Fields(trimmed)
	if len(parts) == 0 {
		return ""
	}
	return parts[0]
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func messagePreviewOrNil(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func patchWithTimestamp(patch map[string]any) map[string]any {
	if patch == nil {
		patch = make(map[string]any)
	}
	patch["updated_at"] = time.Now().UTC()
	return patch
}

func (m *Manager) stopOrphanJob(ctx context.Context, row *supabase.JobRow) (*supabase.SendJobSummary, error) {
	if err := m.forceCloseJob(ctx, row, "stopped", ""); err != nil {
		return nil, err
	}
	return supabase.NormalizeSummary(row), nil
}

func (m *Manager) forceCloseJob(ctx context.Context, row *supabase.JobRow, status, reason string) error {
	now := time.Now().UTC()
	patch := patchWithTimestamp(map[string]any{
		"status":          status,
		"requested_stop":  true,
		"pause_requested": false,
		"paused_at":       nil,
		"finished_at":     now,
	})
	if strings.TrimSpace(reason) != "" {
		patch["last_error"] = reason
	}
	if err := m.supabase.UpdateJob(ctx, row.ID, patch); err != nil {
		return err
	}
	row.Status = status
	row.RequestedStop = true
	row.UpdatedAt = now
	finishedAt := now
	row.FinishedAt = &finishedAt
	if strings.TrimSpace(reason) != "" {
		reasonCopy := reason
		row.LastError = &reasonCopy
	}
	return nil
}
