package main

import (
	"log"
	"os"

	"github.com/jpcb2/disparos-definitivo/worker/internal/config"
	"github.com/jpcb2/disparos-definitivo/worker/internal/evolution"
	"github.com/jpcb2/disparos-definitivo/worker/internal/jobs"
	"github.com/jpcb2/disparos-definitivo/worker/internal/server"
	"github.com/jpcb2/disparos-definitivo/worker/internal/supabase"
)

func main() {
	logger := log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds)

	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("config error: %v", err)
	}

	supabaseClient := supabase.NewClient(cfg.SupabaseRestURL, cfg.SupabaseServiceRole)
	evolutionClient := evolution.NewClient(cfg.EvolutionAPIURL, cfg.EvolutionAPIKey)
	manager := jobs.NewManager(supabaseClient, evolutionClient, cfg.DefaultDelaySeconds, logger)
	httpServer := server.New(manager, cfg.WorkerToken, logger)

	if err := httpServer.ListenAndServe(cfg.WorkerAddr); err != nil {
		logger.Fatalf("server error: %v", err)
	}
}





