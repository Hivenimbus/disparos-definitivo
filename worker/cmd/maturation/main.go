package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/jpcb2/disparos-definitivo/worker/internal/evolution"
	"github.com/jpcb2/disparos-definitivo/worker/internal/maturation"
)

func main() {
	logger := log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds)

	// Carregar configuração
	workerAddr := getEnv("MATURATION_WORKER_ADDR", ":8081")
	workerToken := os.Getenv("WORKER_TOKEN")
	supabaseURL := strings.TrimSuffix(os.Getenv("SUPABASE_URL"), "/")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE")
	evolutionURL := strings.TrimSuffix(os.Getenv("EVOLUTION_API_URL"), "/")
	evolutionKey := os.Getenv("EVOLUTION_API_KEY")

	// Validar configuração
	if workerToken == "" {
		logger.Fatal("WORKER_TOKEN is required")
	}
	if supabaseURL == "" {
		logger.Fatal("SUPABASE_URL is required")
	}
	if supabaseKey == "" {
		logger.Fatal("SUPABASE_SERVICE_ROLE is required")
	}
	if evolutionURL == "" {
		logger.Fatal("EVOLUTION_API_URL is required")
	}
	if evolutionKey == "" {
		logger.Fatal("EVOLUTION_API_KEY is required")
	}

	// URL da REST API do Supabase
	supabaseRestURL := supabaseURL + "/rest/v1"

	// Criar clients
	evolutionClient := evolution.NewClient(evolutionURL)

	// Criar manager de maturação
	manager := maturation.NewManager(
		supabaseRestURL,
		supabaseKey,
		evolutionURL,
		evolutionKey,
		evolutionClient,
		logger,
	)

	// Criar servidor HTTP
	server := maturation.NewServer(manager, workerToken, logger)

	// Iniciar servidor em goroutine
	go func() {
		if err := server.ListenAndServe(workerAddr); err != nil {
			logger.Fatalf("server error: %v", err)
		}
	}()

	// Aguardar sinal de shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Println("shutting down maturation worker...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Parar todas as maturações ativas
	manager.Shutdown(ctx)

	// Parar servidor HTTP
	if err := server.Shutdown(ctx); err != nil {
		logger.Printf("http server shutdown error: %v", err)
	}

	logger.Println("maturation worker stopped")
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
