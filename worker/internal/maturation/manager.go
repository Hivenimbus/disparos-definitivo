package maturation

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/jpcb2/disparos-definitivo/worker/internal/evolution"
)

var (
	ErrMaturationNotFound  = errors.New("maturation not found")
	ErrMaturationInProgress = errors.New("maturation already in progress")
	ErrNoActiveMaturation  = errors.New("no active maturation")
	ErrNotConnected        = errors.New("instances not connected")
)

// MaturationRow representa uma linha da tabela maturacoes
type MaturationRow struct {
	ID                 string     `json:"id"`
	UserID             string     `json:"user_id"`
	InstanceAID        string     `json:"instance_a_id"`
	InstanceBID        string     `json:"instance_b_id"`
	InstanceAConnected bool       `json:"instance_a_connected"`
	InstanceBConnected bool       `json:"instance_b_connected"`
	PhoneA             *string    `json:"phone_a"`
	PhoneB             *string    `json:"phone_b"`
	MaturationType     string     `json:"maturation_type"`
	IntervalType       string     `json:"interval_type"`
	TotalMessages      int        `json:"total_messages"`
	MessagesSent       int        `json:"messages_sent"`
	Status             string     `json:"status"`
	StartedAt          *time.Time `json:"started_at"`
	CompletedAt        *time.Time `json:"completed_at"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// MaturationStatus representa o status atual de uma maturação
type MaturationStatus struct {
	ID            string `json:"id"`
	Status        string `json:"status"`
	MessagesSent  int    `json:"messages_sent"`
	TotalMessages int    `json:"total_messages"`
	Progress      int    `json:"progress"` // Porcentagem 0-100
}

// ActiveMaturation representa uma maturação em execução
type ActiveMaturation struct {
	mu            sync.RWMutex
	row           *MaturationRow
	conversation  Conversation
	stopRequested bool
}

// Manager gerencia as maturações ativas
type Manager struct {
	supabaseURL    string
	supabaseKey    string
	evolutionURL   string
	evolutionKey   string
	evolution      *evolution.Client
	activeMu       sync.RWMutex
	active         map[string]*ActiveMaturation // maturation_id -> active
	logger         *log.Logger
}

// NewManager cria um novo manager de maturação
func NewManager(
	supabaseURL, supabaseKey string,
	evolutionURL, evolutionKey string,
	evolutionClient *evolution.Client,
	logger *log.Logger,
) *Manager {
	return &Manager{
		supabaseURL:  supabaseURL,
		supabaseKey:  supabaseKey,
		evolutionURL: evolutionURL,
		evolutionKey: evolutionKey,
		evolution:    evolutionClient,
		active:       make(map[string]*ActiveMaturation),
		logger:       logger,
	}
}

// StartMaturation inicia uma maturação
func (m *Manager) StartMaturation(ctx context.Context, maturationID string) (*MaturationStatus, error) {
	// Verificar se já está ativa
	if m.hasActiveMaturation(maturationID) {
		return nil, ErrMaturationInProgress
	}

	// Carregar maturação do banco
	row, err := m.loadMaturation(ctx, maturationID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, ErrMaturationNotFound
	}

	// Verificar se as instâncias estão conectadas
	if !row.InstanceAConnected || !row.InstanceBConnected {
		return nil, ErrNotConnected
	}

	// Verificar se tem telefones
	if row.PhoneA == nil || row.PhoneB == nil || *row.PhoneA == "" || *row.PhoneB == "" {
		return nil, fmt.Errorf("phone numbers not available")
	}

	// Selecionar conversa aleatória
	conversationIdx := rand.Intn(len(Conversations))
	conversation := Conversations[conversationIdx]

	// Criar maturação ativa
	active := &ActiveMaturation{
		row:          row,
		conversation: conversation,
	}

	// Registrar como ativa
	m.activeMu.Lock()
	m.active[maturationID] = active
	m.activeMu.Unlock()

	// Atualizar status para running
	now := time.Now().UTC()
	if err := m.updateMaturation(ctx, maturationID, map[string]any{
		"status":     "running",
		"started_at": now,
		"updated_at": now,
	}); err != nil {
		m.activeMu.Lock()
		delete(m.active, maturationID)
		m.activeMu.Unlock()
		return nil, err
	}

	// Iniciar goroutine de execução
	go m.runMaturation(context.Background(), active)

	m.logger.Printf("[maturation] started maturation_id=%s type=%s total=%d", maturationID, row.MaturationType, row.TotalMessages)

	return &MaturationStatus{
		ID:            row.ID,
		Status:        "running",
		MessagesSent:  row.MessagesSent,
		TotalMessages: row.TotalMessages,
		Progress:      calculateProgress(row.MessagesSent, row.TotalMessages),
	}, nil
}

// StopMaturation para uma maturação
func (m *Manager) StopMaturation(ctx context.Context, maturationID string) (*MaturationStatus, error) {
	active := m.getActiveMaturation(maturationID)
	if active == nil {
		// Tentar parar no banco mesmo sem estar em memória
		row, err := m.loadMaturation(ctx, maturationID)
		if err != nil {
			return nil, err
		}
		if row == nil {
			return nil, ErrMaturationNotFound
		}
		if row.Status == "completed" || row.Status == "stopped" {
			return &MaturationStatus{
				ID:            row.ID,
				Status:        row.Status,
				MessagesSent:  row.MessagesSent,
				TotalMessages: row.TotalMessages,
				Progress:      calculateProgress(row.MessagesSent, row.TotalMessages),
			}, nil
		}
		// Marcar como parado
		now := time.Now().UTC()
		if err := m.updateMaturation(ctx, maturationID, map[string]any{
			"status":       "stopped",
			"completed_at": now,
			"updated_at":   now,
		}); err != nil {
			return nil, err
		}
		return &MaturationStatus{
			ID:            row.ID,
			Status:        "stopped",
			MessagesSent:  row.MessagesSent,
			TotalMessages: row.TotalMessages,
			Progress:      calculateProgress(row.MessagesSent, row.TotalMessages),
		}, nil
	}

	// Sinalizar parada
	active.mu.Lock()
	active.stopRequested = true
	active.mu.Unlock()

	m.logger.Printf("[maturation] stop requested maturation_id=%s", maturationID)

	return &MaturationStatus{
		ID:            active.row.ID,
		Status:        "stopping",
		MessagesSent:  active.row.MessagesSent,
		TotalMessages: active.row.TotalMessages,
		Progress:      calculateProgress(active.row.MessagesSent, active.row.TotalMessages),
	}, nil
}

// GetStatus retorna o status de uma maturação
func (m *Manager) GetStatus(ctx context.Context, maturationID string) (*MaturationStatus, error) {
	// Verificar em memória primeiro
	if active := m.getActiveMaturation(maturationID); active != nil {
		active.mu.RLock()
		defer active.mu.RUnlock()
		return &MaturationStatus{
			ID:            active.row.ID,
			Status:        active.row.Status,
			MessagesSent:  active.row.MessagesSent,
			TotalMessages: active.row.TotalMessages,
			Progress:      calculateProgress(active.row.MessagesSent, active.row.TotalMessages),
		}, nil
	}

	// Buscar no banco
	row, err := m.loadMaturation(ctx, maturationID)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, ErrMaturationNotFound
	}

	return &MaturationStatus{
		ID:            row.ID,
		Status:        row.Status,
		MessagesSent:  row.MessagesSent,
		TotalMessages: row.TotalMessages,
		Progress:      calculateProgress(row.MessagesSent, row.TotalMessages),
	}, nil
}

// Shutdown para todas as maturações ativas
func (m *Manager) Shutdown(ctx context.Context) {
	m.activeMu.Lock()
	defer m.activeMu.Unlock()

	for id, active := range m.active {
		m.logger.Printf("[maturation] stopping maturation_id=%s...", id)
		active.mu.Lock()
		active.stopRequested = true
		active.mu.Unlock()
	}
	m.logger.Println("[maturation] shutdown signal sent to all maturations")
}

// runMaturation executa o loop de maturação
func (m *Manager) runMaturation(ctx context.Context, active *ActiveMaturation) {
	maturationID := active.row.ID
	phoneA := *active.row.PhoneA
	phoneB := *active.row.PhoneB
	instanceA := active.row.InstanceAID
	instanceB := active.row.InstanceBID

	// Calcular intervalo baseado no tipo
	minInterval, maxInterval := parseIntervalType(active.row.IntervalType)

	// Calcular mensagens por conversa e total de repetições
	messagesPerConversation := len(active.conversation)
	totalRepetitions := active.row.TotalMessages / 2 // Cada repetição = 2 mensagens (A->B e B->A contam como uma troca)
	
	// Ajuste: total_messages é o número total de mensagens individuais
	// Então repetições = total_messages / mensagens_por_conversa
	totalRepetitions = active.row.TotalMessages / messagesPerConversation
	if totalRepetitions < 1 {
		totalRepetitions = 1
	}

	m.logger.Printf("[maturation] running maturation_id=%s repetitions=%d messages_per_conv=%d",
		maturationID, totalRepetitions, messagesPerConversation)

	messagesSent := active.row.MessagesSent

	for rep := 0; rep < totalRepetitions; rep++ {
		// Verificar se deve parar
		if active.shouldStop() {
			break
		}

		// Executar todas as mensagens da conversa
		for msgIdx, message := range active.conversation {
			if active.shouldStop() {
				break
			}

			var fromInstance, toPhone string
			if msgIdx%2 == 0 {
				// A envia para B
				fromInstance = instanceA
				toPhone = phoneB
			} else {
				// B envia para A
				fromInstance = instanceB
				toPhone = phoneA
			}

			// Enviar mensagem
			if err := m.evolution.SendText(ctx, fromInstance, toPhone, message); err != nil {
				m.logger.Printf("[maturation] send error maturation_id=%s: %v", maturationID, err)
				// Continuar mesmo com erro
			}

			messagesSent++

			// Atualizar progresso no banco
			active.mu.Lock()
			active.row.MessagesSent = messagesSent
			active.mu.Unlock()

			if err := m.updateMaturation(ctx, maturationID, map[string]any{
				"messages_sent": messagesSent,
				"updated_at":    time.Now().UTC(),
			}); err != nil {
				m.logger.Printf("[maturation] update error maturation_id=%s: %v", maturationID, err)
			}

			// Aguardar intervalo (se não for a última mensagem)
			if !active.shouldStop() && (rep < totalRepetitions-1 || msgIdx < len(active.conversation)-1) {
				delay := randomDuration(minInterval, maxInterval)
				time.Sleep(delay)
			}
		}
	}

	// Finalizar maturação
	finalStatus := "completed"
	if active.shouldStop() {
		finalStatus = "stopped"
	}

	now := time.Now().UTC()
	if err := m.updateMaturation(ctx, maturationID, map[string]any{
		"status":        finalStatus,
		"messages_sent": messagesSent,
		"completed_at":  now,
		"updated_at":    now,
	}); err != nil {
		m.logger.Printf("[maturation] finalize error maturation_id=%s: %v", maturationID, err)
	}

	// Remover das ativas
	m.activeMu.Lock()
	delete(m.active, maturationID)
	m.activeMu.Unlock()

	m.logger.Printf("[maturation] finished maturation_id=%s status=%s sent=%d", maturationID, finalStatus, messagesSent)
}

func (active *ActiveMaturation) shouldStop() bool {
	active.mu.RLock()
	defer active.mu.RUnlock()
	return active.stopRequested
}

func (m *Manager) hasActiveMaturation(id string) bool {
	m.activeMu.RLock()
	defer m.activeMu.RUnlock()
	_, ok := m.active[id]
	return ok
}

func (m *Manager) getActiveMaturation(id string) *ActiveMaturation {
	m.activeMu.RLock()
	defer m.activeMu.RUnlock()
	return m.active[id]
}

func (m *Manager) loadMaturation(ctx context.Context, id string) (*MaturationRow, error) {
	url := fmt.Sprintf("%s/maturacoes?id=eq.%s&limit=1", m.supabaseURL, id)
	
	req, err := newRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", m.supabaseKey)
	req.Header.Set("Authorization", "Bearer "+m.supabaseKey)

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("supabase error: %s", resp.Status)
	}

	var rows []MaturationRow
	if err := json.NewDecoder(resp.Body).Decode(&rows); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return &rows[0], nil
}

func (m *Manager) updateMaturation(ctx context.Context, id string, patch map[string]any) error {
	url := fmt.Sprintf("%s/maturacoes?id=eq.%s", m.supabaseURL, id)
	
	body, err := json.Marshal(patch)
	if err != nil {
		return err
	}

	req, err := newRequest(ctx, "PATCH", url, body)
	if err != nil {
		return err
	}
	req.Header.Set("apikey", m.supabaseKey)
	req.Header.Set("Authorization", "Bearer "+m.supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("supabase error: %s", resp.Status)
	}
	return nil
}

func parseIntervalType(intervalType string) (min, max time.Duration) {
	switch intervalType {
	case "15-30":
		return 15 * time.Second, 30 * time.Second
	case "30-45":
		return 30 * time.Second, 45 * time.Second
	case "45-60":
		return 45 * time.Second, 60 * time.Second
	default:
		return 15 * time.Second, 30 * time.Second
	}
}

func randomDuration(min, max time.Duration) time.Duration {
	delta := max - min
	if delta <= 0 {
		return min
	}
	return min + time.Duration(rand.Int63n(int64(delta)))
}

func calculateProgress(sent, total int) int {
	if total <= 0 {
		return 0
	}
	progress := (sent * 100) / total
	if progress > 100 {
		return 100
	}
	return progress
}
