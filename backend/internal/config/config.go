package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	// Application
	AppEnv   string
	AppURL   string
	Port     string
	LogLevel string

	// Database
	DatabaseURL        string
	DBMaxConnections   int
	DBMaxIdleConns     int

	// Redis
	RedisURL      string
	RedisPoolSize int

	// Security
	JWTSecret       string
	SessionSecret   string
	Argon2Memory    uint32
	Argon2Iterations uint32
	Argon2Parallelism uint8

	// Cloudflare
	CFAPIToken        string
	CFZoneID          string
	CFTurnstileSecret string
	CFTurnstileSiteKey string

	// Email
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string

	// Rate Limiting
	RateLimitEnabled  bool
	RateLimitRequests int

	// CORS
	CORSOrigins string

	// External Services
	GeoDBPath        string
	SentryDSN        string
	VirusTotalAPIKey string
	SafeBrowsingKey  string
}

func Load() *Config {
	return &Config{
		// Application
		AppEnv:   getEnv("APP_ENV", "development"),
		AppURL:   getEnv("APP_URL", "http://localhost:3000"),
		Port:     getEnv("PORT", "8080"),
		LogLevel: getEnv("LOG_LEVEL", "debug"),

		// Database
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/shortenlink?sslmode=disable"),
		DBMaxConnections: getEnvAsInt("DB_MAX_CONNECTIONS", 100),
		DBMaxIdleConns:   getEnvAsInt("DB_MAX_IDLE_CONNECTIONS", 10),

		// Redis
		RedisURL:      getEnv("REDIS_URL", "redis://localhost:6379/0"),
		RedisPoolSize: getEnvAsInt("REDIS_POOL_SIZE", 10),

		// Security
		JWTSecret:         getEnv("JWT_SECRET", "change-this-in-production-minimum-64-characters-required-for-security"),
		SessionSecret:     getEnv("SESSION_SECRET", "another-secret-for-sessions-minimum-32-characters"),
		Argon2Memory:      uint32(getEnvAsInt("ARGON2_MEMORY", 65536)),
		Argon2Iterations:  uint32(getEnvAsInt("ARGON2_ITERATIONS", 3)),
		Argon2Parallelism: uint8(getEnvAsInt("ARGON2_PARALLELISM", 4)),

		// Cloudflare
		CFAPIToken:         getEnv("CF_API_TOKEN", ""),
		CFZoneID:           getEnv("CF_ZONE_ID", ""),
		CFTurnstileSecret:  getEnv("CF_TURNSTILE_SECRET", ""),
		CFTurnstileSiteKey: getEnv("CF_TURNSTILE_SITE_KEY", ""),

		// Email
		SMTPHost:     getEnv("SMTP_HOST", "smtp.mailtrap.io"),
		SMTPPort:     getEnvAsInt("SMTP_PORT", 2525),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@localhost"),

		// Rate Limiting
		RateLimitEnabled:  getEnvAsBool("RATE_LIMIT_ENABLED", true),
		RateLimitRequests: getEnvAsInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 60),

		// CORS
		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000"),

		// External Services
		GeoDBPath:        getEnv("GEO_DB_PATH", "/data/GeoLite2-City.mmdb"),
		SentryDSN:        getEnv("SENTRY_DSN", ""),
		VirusTotalAPIKey: getEnv("VIRUSTOTAL_API_KEY", ""),
		SafeBrowsingKey:  getEnv("SAFE_BROWSING_KEY", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := strings.ToLower(getEnv(key, ""))
	if valueStr == "true" || valueStr == "1" || valueStr == "yes" {
		return true
	}
	if valueStr == "false" || valueStr == "0" || valueStr == "no" {
		return false
	}
	return defaultValue
}