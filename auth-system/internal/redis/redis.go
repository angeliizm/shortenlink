package redis

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

type Client struct {
	client *redis.Client
}

func New(addr, password string, db int) (*Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  10 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		PoolSize:     10,
		PoolTimeout:  30 * time.Second,
	})

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("unable to connect to Redis: %w", err)
	}

	log.Println("Redis connection established")
	return &Client{client: rdb}, nil
}

func (c *Client) Close() error {
	return c.client.Close()
}

// SetRefreshToken stores a refresh token with expiration
func (c *Client) SetRefreshToken(ctx context.Context, userID int, tokenID, token string, expiration time.Duration) error {
	key := fmt.Sprintf("refresh_token:%d:%s", userID, tokenID)
	err := c.client.Set(ctx, key, token, expiration).Err()
	if err != nil {
		return fmt.Errorf("failed to set refresh token: %w", err)
	}
	return nil
}

// GetRefreshToken retrieves a refresh token
func (c *Client) GetRefreshToken(ctx context.Context, userID int, tokenID string) (string, error) {
	key := fmt.Sprintf("refresh_token:%d:%s", userID, tokenID)
	token, err := c.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil // Token not found
		}
		return "", fmt.Errorf("failed to get refresh token: %w", err)
	}
	return token, nil
}

// DeleteRefreshToken removes a refresh token
func (c *Client) DeleteRefreshToken(ctx context.Context, userID int, tokenID string) error {
	key := fmt.Sprintf("refresh_token:%d:%s", userID, tokenID)
	err := c.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete refresh token: %w", err)
	}
	return nil
}

// DeleteAllUserRefreshTokens removes all refresh tokens for a user
func (c *Client) DeleteAllUserRefreshTokens(ctx context.Context, userID int) error {
	pattern := fmt.Sprintf("refresh_token:%d:*", userID)
	keys, err := c.client.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get user refresh token keys: %w", err)
	}

	if len(keys) > 0 {
		err = c.client.Del(ctx, keys...).Err()
		if err != nil {
			return fmt.Errorf("failed to delete user refresh tokens: %w", err)
		}
	}

	return nil
}

// SetBlacklistToken adds a token to the blacklist
func (c *Client) SetBlacklistToken(ctx context.Context, tokenID string, expiration time.Duration) error {
	key := fmt.Sprintf("blacklist:%s", tokenID)
	err := c.client.Set(ctx, key, "1", expiration).Err()
	if err != nil {
		return fmt.Errorf("failed to blacklist token: %w", err)
	}
	return nil
}

// IsTokenBlacklisted checks if a token is blacklisted
func (c *Client) IsTokenBlacklisted(ctx context.Context, tokenID string) (bool, error) {
	key := fmt.Sprintf("blacklist:%s", tokenID)
	exists, err := c.client.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check token blacklist: %w", err)
	}
	return exists > 0, nil
}