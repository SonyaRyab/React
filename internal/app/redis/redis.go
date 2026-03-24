package redis

import (
	"context"
	"fmt"
	"strconv"

	"lab4/internal/app/config"

	goredis "github.com/go-redis/redis/v8"
)

const servicePrefix = "lab4_service."

type Client struct {
	cfg    config.RedisConfig
	client *goredis.Client
}

func New(ctx context.Context, cfg config.RedisConfig) (*Client, error) {
	client := &Client{cfg: cfg}

	redisClient := goredis.NewClient(&goredis.Options{
		Password:    cfg.Password,
		Username:    cfg.User,
		Addr:        cfg.Host + ":" + strconv.Itoa(cfg.Port),
		DB:          0,
		DialTimeout: cfg.DialTimeout,
		ReadTimeout: cfg.ReadTimeout,
	})

	client.client = redisClient

	if _, err := redisClient.Ping(ctx).Result(); err != nil {
		return nil, fmt.Errorf("cant ping redis: %w", err)
	}

	return client, nil
}

func (c *Client) Close() error {
	return c.client.Close()
}
