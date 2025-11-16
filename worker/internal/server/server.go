package server

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/jpcb2/disparos-definitivo/worker/internal/jobs"
	"github.com/jpcb2/disparos-definitivo/worker/internal/supabase"
)

type Server struct {
	manager *jobs.Manager
	token   string
	mux     *http.ServeMux
	logger  *log.Logger
}

func New(manager *jobs.Manager, token string, logger *log.Logger) *Server {
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
	s.mux.Handle("/jobs/start", s.withAuth(http.HandlerFunc(s.handleStart)))
	s.mux.Handle("/jobs/stop", s.withAuth(http.HandlerFunc(s.handleStop)))
	s.mux.Handle("/jobs/status", s.withAuth(http.HandlerFunc(s.handleStatus)))
	s.mux.Handle("/jobs/finish", s.withAuth(http.HandlerFunc(s.handleFinish)))
}

func (s *Server) ListenAndServe(addr string) error {
	s.logger.Printf("[server] listening on %s", addr)
	return http.ListenAndServe(addr, s.mux)
}

func (s *Server) withAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if token := r.Header.Get("X-Worker-Token"); token == "" || token != s.token {
			writeError(w, http.StatusUnauthorized, "token inválido")
			return
		}
		next.ServeHTTP(w, r)
	})
}

type startRequest struct {
	UserID   string            `json:"user_id"`
	Metadata map[string]string `json:"metadata"`
}

type userRequest struct {
	UserID string `json:"user_id"`
}

type finishRequest struct {
	UserID string `json:"user_id"`
	Force  bool   `json:"force"`
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
	payload.UserID = strings.TrimSpace(payload.UserID)
	if payload.UserID == "" {
		writeError(w, http.StatusBadRequest, "user_id obrigatório")
		return
	}
	job, err := s.manager.StartJob(r.Context(), payload.UserID)
	if err != nil {
		s.handleJobError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]*supabase.SendJobSummary{"job": job})
}

func (s *Server) handleStop(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}
	var payload userRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "payload inválido")
		return
	}
	payload.UserID = strings.TrimSpace(payload.UserID)
	if payload.UserID == "" {
		writeError(w, http.StatusBadRequest, "user_id obrigatório")
		return
	}
	job, err := s.manager.RequestStop(r.Context(), payload.UserID)
	if err != nil {
		s.handleJobError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]*supabase.SendJobSummary{"job": job})
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}
	userID := strings.TrimSpace(r.URL.Query().Get("user_id"))
	if userID == "" {
		writeError(w, http.StatusBadRequest, "user_id obrigatório")
		return
	}
	job, err := s.manager.GetStatus(r.Context(), userID)
	if err != nil {
		s.handleJobError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]*supabase.SendJobSummary{"job": job})
}

func (s *Server) handleFinish(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "método não suportado")
		return
	}
	var payload finishRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "payload inválido")
		return
	}
	payload.UserID = strings.TrimSpace(payload.UserID)
	if payload.UserID == "" {
		writeError(w, http.StatusBadRequest, "user_id obrigatório")
		return
	}
	if err := s.manager.Finalize(r.Context(), payload.UserID, payload.Force); err != nil {
		s.handleJobError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (s *Server) handleJobError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, jobs.ErrJobInProgress):
		writeError(w, http.StatusConflict, "já existe um disparo em andamento")
	case errors.Is(err, jobs.ErrNoActiveJob):
		writeError(w, http.StatusNotFound, "nenhum disparo em andamento")
	case errors.Is(err, jobs.ErrJobStillRunning):
		writeError(w, http.StatusConflict, "o disparo ainda está em andamento")
	case errors.Is(err, jobs.ErrJobNotFinished):
		writeError(w, http.StatusBadRequest, "finalize o disparo antes de limpar o histórico")
	case errors.Is(err, jobs.ErrNoMessageConfigured):
		writeError(w, http.StatusBadRequest, "nenhuma mensagem configurada para envio")
	case errors.Is(err, jobs.ErrNoContentConfigured):
		writeError(w, http.StatusBadRequest, "configure uma mensagem ou mídias antes de iniciar o disparo")
	case errors.Is(err, jobs.ErrNoContacts):
		writeError(w, http.StatusBadRequest, "nenhum contato disponível para disparo")
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
