package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	PostgresDSN        string
	RedisAddr          string
	RedisDB            int
	JWTSigningKey      string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	CookieDomain       string
	HTTPAddr           string
	PanelOrigin        string
	SecureCookies      bool
}

func Load() *Config {
	// Load .env file if it exists
	_ = godotenv.Load()

	cfg := &Config{
		PostgresDSN:     getEnv("POSTGRES_DSN", "postgres://postgres:postgres@localhost:5432/authdb?sslmode=disable"),
		RedisAddr:       getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSigningKey:   getEnvRequired("JWT_SIGNING_KEY"),
		CookieDomain:    getEnv("COOKIE_DOMAIN", "localhost"),
		HTTPAddr:        getEnv("HTTP_ADDR", ":8080"),
		PanelOrigin:     getEnv("PANEL_ORIGIN", "http://localhost:3000"),
		SecureCookies:   getEnvBool("SECURE_COOKIES", false),
	}

	// Parse Redis DB
	redisDB, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
	if err != nil {
		log.Fatalf("Invalid REDIS_DB: %v", err)
	}
	cfg.RedisDB = redisDB

	// Parse Access Token TTL
	accessTTLMin, err := strconv.Atoi(getEnv("ACCESS_TOKEN_TTL_MIN", "15"))
	if err != nil {
		log.Fatalf("Invalid ACCESS_TOKEN_TTL_MIN: %v", err)
	}
	cfg.AccessTokenTTL = time.Duration(accessTTLMin) * time.Minute

	// Parse Refresh Token TTL
	refreshTTLDays, err := strconv.Atoi(getEnv("REFRESH_TOKEN_TTL_DAYS", "14"))
	if err != nil {
		log.Fatalf("Invalid REFRESH_TOKEN_TTL_DAYS: %v", err)
	}
	cfg.RefreshTokenTTL = time.Duration(refreshTTLDays) * 24 * time.Hour

	// Validate JWT signing key
	if len(cfg.JWTSigningKey) < 32 {
		log.Fatal("JWT_SIGNING_KEY must be at least 32 bytes")
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvRequired(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Required environment variable %s is not set", key)
	}
	return value
}

func getEnvBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	b, err := strconv.ParseBool(value)
	if err != nil {
		log.Fatalf("Invalid boolean value for %s: %v", key, err)
	}
	return b
}