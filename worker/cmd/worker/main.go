package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	evolutionClient := evolution.NewClient(cfg.EvolutionAPIURL)
	manager := jobs.NewManager(
		supabaseClient,
		evolutionClient,
		cfg.DefaultDelaySeconds,
		logger,
	)
	manager.RecoverActiveJobs(context.Background())
	httpServer := server.New(manager, cfg.WorkerToken, logger)

	go func() {
		if err := httpServer.ListenAndServe(cfg.WorkerAddr); err != nil {
			logger.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Println("shutting down worker...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	manager.Shutdown(ctx)
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Printf("http server shutdown error: %v", err)
	}
	logger.Println("worker stopped")
}
