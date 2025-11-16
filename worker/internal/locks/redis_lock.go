package locks

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	ErrLockNotAcquired = errors.New("lock not acquired")
)

type LockProvider interface {
	Acquire(ctx context.Context, key string) (string, error)
	Release(ctx context.Context, key, token string) error
	Refresh(ctx context.Context, key, token string, ttl time.Duration) error
}

type RedisLock struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisLock(redisURL string, ttlSeconds int) (*RedisLock, error) {
	if redisURL == "" {
		return nil, fmt.Errorf("redis url is required")
	}
	if ttlSeconds <= 0 {
		ttlSeconds = 300
	}
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opts)
	return &RedisLock{
		client: client,
		ttl:    time.Duration(ttlSeconds) * time.Second,
	}, nil
}

func (r *RedisLock) Acquire(ctx context.Context, key string) (string, error) {
	token, err := randomToken()
	if err != nil {
		return "", err
	}
	ok, err := r.client.SetNX(ctx, key, token, r.ttl).Result()
	if err != nil {
		return "", err
	}
	if !ok {
		return "", ErrLockNotAcquired
	}
	return token, nil
}

var releaseScript = redis.NewScript(`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`)

func (r *RedisLock) Release(ctx context.Context, key, token string) error {
	if key == "" || token == "" {
		return nil
	}
	_, err := releaseScript.Run(ctx, r.client, []string{key}, token).Result()
	if err == redis.Nil {
		return nil
	}
	return err
}

var refreshScript = redis.NewScript(`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("pexpire", KEYS[1], ARGV[2])
else
  return 0
end
`)

func (r *RedisLock) Refresh(ctx context.Context, key, token string, ttl time.Duration) error {
	if key == "" || token == "" {
		return fmt.Errorf("invalid refresh parameters")
	}
	ms := ttl.Milliseconds()
	if ms <= 0 {
		ms = r.ttl.Milliseconds()
	}
	_, err := refreshScript.Run(ctx, r.client, []string{key}, token, ms).Result()
	if err == redis.Nil {
		return nil
	}
	return err
}

func randomToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
