package maturation

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
)

// Server é o servidor HTTP para o worker de maturação
type Server struct {
	manager *Manager
	token   string
	mux     *http.ServeMux
	logger  *log.Logger
	srv     *http.Server
}

// NewServer cria um novo servidor de maturação
func NewServer(manager *Manager, token string, logger *log.Logger) *Server {
	s := &Server{
		manager: manager,
		token:   token,
		mux:     http.NewServeMux(),
		logger:  logger,
	}
	s.routes()
	return s
}

func (s *Server) routes() {
	s.mux.Handle("/maturation/start", s.withAuth(http.HandlerFunc(s.handleStart)))
	s.mux.Handle("/maturation/stop", s.withAuth(http.HandlerFunc(s.handleStop)))
	s.mux.Handle("/maturation/status", s.withAuth(http.HandlerFunc(s.handleStatus)))
	s.mux.Handle("/health", http.HandlerFunc(s.handleHealth))
}

// ListenAndServe inicia o servidor HTTP
func (s *Server) ListenAndServe(addr string) error {
	s.logger.Printf("[maturation-server] listening on %s", addr)
	s.srv = &http.Server{
		Addr:    addr,
		Handler: s.mux,
	}
	return s.srv.ListenAndServe()
}

// Shutdown para o servidor graciosamente
func (s *Server) Shutdown(ctx context.Context) error {
	if s.srv != nil {
		return s.srv.Shutdown(ctx)
	}
	return nil
}

func (s *Server) withAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("X-Worker-Token")
		if token == "" || token != s.token {
			writeError(w, http.StatusUnauthorized, "token inválido")
			return
		}
		next.ServeHTTP(w, r)
	})
}

type startRequest struct {
	MaturationID string `json:"maturation_id"`
}

type stopRequest struct {
	MaturationID string `json:"maturation_id"`
}

func (s *Server) handleStart(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}

	var payload startRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "payload inválido")
		return
	}

	payload.MaturationID = strings.TrimSpace(payload.MaturationID)
	if payload.MaturationID == "" {
		writeError(w, http.StatusBadRequest, "maturation_id obrigatório")
		return
	}

	status, err := s.manager.StartMaturation(r.Context(), payload.MaturationID)
	if err != nil {
		s.handleMaturationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]*MaturationStatus{"maturation": status})
}

func (s *Server) handleStop(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}

	var payload stopRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "payload inválido")
		return
	}

	payload.MaturationID = strings.TrimSpace(payload.MaturationID)
	if payload.MaturationID == "" {
		writeError(w, http.StatusBadRequest, "maturation_id obrigatório")
		return
	}

	status, err := s.manager.StopMaturation(r.Context(), payload.MaturationID)
	if err != nil {
		s.handleMaturationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]*MaturationStatus{"maturation": status})
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}

	maturationID := strings.TrimSpace(r.URL.Query().Get("maturation_id"))
	if maturationID == "" {
		writeError(w, http.StatusBadRequest, "maturation_id obrigatório")
		return
	}

	status, err := s.manager.GetStatus(r.Context(), maturationID)
	if err != nil {
		s.handleMaturationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]*MaturationStatus{"maturation": status})
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleMaturationError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrMaturationNotFound):
		writeError(w, http.StatusNotFound, "maturação não encontrada")
	case errors.Is(err, ErrMaturationInProgress):
		writeError(w, http.StatusConflict, "maturação já está em andamento")
	case errors.Is(err, ErrNoActiveMaturation):
		writeError(w, http.StatusNotFound, "nenhuma maturação ativa")
	case errors.Is(err, ErrNotConnected):
		writeError(w, http.StatusBadRequest, "instâncias não estão conectadas")
	default:
		writeError(w, http.StatusInternalServerError, err.Error())
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{
		"error": message,
	})
}
