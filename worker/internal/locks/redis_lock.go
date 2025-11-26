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
	ErrLockLost        = errors.New("lock lost or expired")
)

type LockProvider interface {
	Acquire(ctx context.Context, key string) (string, error)
	Release(ctx context.Context, key, token string) error
	Refresh(ctx context.Context, key, token string, ttl time.Duration) error
	ForceRelease(ctx context.Context, key string) error
	ForceAcquire(ctx context.Context, key string) (string, error)
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
	result, err := refreshScript.Run(ctx, r.client, []string{key}, token, ms).Result()
	if err != nil {
		if err == redis.Nil {
			return ErrLockLost
		}
		return err
	}
	if val, ok := result.(int64); ok && val == 0 {
		return ErrLockLost
	}
	return nil
}

func (r *RedisLock) ForceRelease(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}
	return r.client.Del(ctx, key).Err()
}

func (r *RedisLock) ForceAcquire(ctx context.Context, key string) (string, error) {
	token, err := randomToken()
	if err != nil {
		return "", err
	}
	// Use Set (upsert) instead of SetNX
	err = r.client.Set(ctx, key, token, r.ttl).Err()
	if err != nil {
		return "", err
	}
	return token, nil
}

func randomToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
