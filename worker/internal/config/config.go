package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	WorkerAddr              string
	WorkerToken             string
	SupabaseURL             string
	SupabaseRestURL         string
	SupabaseServiceRole     string
	UazapiAPIURL            string
	UazapiAPIKey            string
	DefaultDelaySeconds     int
	RedisURL                string
	RedisLockTTLSeconds     int
	RedisLockRefreshSeconds int
}

func Load() (*Config, error) {
	var cfg Config
	cfg.WorkerAddr = getEnv("WORKER_HTTP_ADDR", ":8080")
	cfg.WorkerToken = os.Getenv("WORKER_TOKEN")
	cfg.SupabaseURL = strings.TrimSuffix(os.Getenv("SUPABASE_URL"), "/")
	cfg.SupabaseServiceRole = os.Getenv("SUPABASE_SERVICE_ROLE")
	cfg.UazapiAPIURL = strings.TrimSuffix(os.Getenv("UAZAPI_API_URL"), "/")
	cfg.UazapiAPIKey = os.Getenv("UAZAPI_API_KEY")
	cfg.RedisURL = os.Getenv("REDIS_URL")
	if v := os.Getenv("REDIS_LOCK_TTL_SECONDS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			cfg.RedisLockTTLSeconds = parsed
		}
	}
	if v := os.Getenv("REDIS_LOCK_REFRESH_SECONDS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			cfg.RedisLockRefreshSeconds = parsed
		}
	}
	if v := os.Getenv("DEFAULT_DELAY_SECONDS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			cfg.DefaultDelaySeconds = parsed
		}
	}
	if cfg.DefaultDelaySeconds <= 0 {
		cfg.DefaultDelaySeconds = 10
	}
	if cfg.RedisLockTTLSeconds <= 0 {
		cfg.RedisLockTTLSeconds = 300
	}
	if cfg.RedisLockRefreshSeconds <= 0 {
		cfg.RedisLockRefreshSeconds = 60
	}

	if cfg.SupabaseURL != "" {
		cfg.SupabaseRestURL = cfg.SupabaseURL + "/rest/v1"
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func (c *Config) Validate() error {
	missing := make([]string, 0)
	if c.WorkerToken == "" {
		missing = append(missing, "WORKER_TOKEN")
	}
	if c.SupabaseURL == "" {
		missing = append(missing, "SUPABASE_URL")
	}
	if c.SupabaseServiceRole == "" {
		missing = append(missing, "SUPABASE_SERVICE_ROLE")
	}
	if c.UazapiAPIURL == "" {
		missing = append(missing, "UAZAPI_API_URL")
	}
	if c.UazapiAPIKey == "" {
		missing = append(missing, "UAZAPI_API_KEY")
	}
	if c.RedisURL == "" {
		missing = append(missing, "REDIS_URL")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
