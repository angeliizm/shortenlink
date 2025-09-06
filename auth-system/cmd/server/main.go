package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"auth-system/internal/db"
	"auth-system/internal/http/handlers"
	"auth-system/internal/http/middleware"
	"auth-system/internal/redis"
	"auth-system/internal/security"
)

func main() {
	// Load environment variables
	config := loadConfig()

	// Initialize database
	database, err := db.New(config.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize Redis
	redisClient, err := redis.New(config.RedisAddr, config.RedisPassword, config.RedisDB)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	// Initialize JWT manager
	jwtManager := security.NewJWTManager(
		config.JWTSecret,
		config.AccessTokenDuration,
		config.RefreshTokenDuration,
	)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtManager, redisClient)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(
		database,
		redisClient,
		jwtManager,
		config.CookieDomain,
		config.SecureCookies,
	)

	// Setup routes
	mux := http.NewServeMux()

	// CORS middleware
	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			origin := r.Header.Get("Origin")
			if isAllowedOrigin(origin, config.AllowedOrigins) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", strings.Join(config.AllowedMethods, ", "))
			w.Header().Set("Access-Control-Allow-Headers", strings.Join(config.AllowedHeaders, ", "))
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400")

			// Handle preflight requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next(w, r)
		}
	}

	// Auth routes
	mux.HandleFunc("/api/auth/register", corsHandler(authHandler.Register))
	mux.HandleFunc("/api/auth/login", corsHandler(authHandler.Login))
	mux.HandleFunc("/api/auth/refresh", corsHandler(authHandler.Refresh))
	mux.HandleFunc("/api/auth/logout", corsHandler(authHandler.Logout))
	mux.HandleFunc("/api/auth/me", corsHandler(authMiddleware.RequireAuth(authHandler.Me)))

	// Health check endpoint
	mux.HandleFunc("/health", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
	}))

	// Setup server
	server := &http.Server{
		Addr:         config.ServerHost + ":" + strconv.Itoa(config.ServerPort),
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

type Config struct {
	DatabaseURL          string
	RedisAddr            string
	RedisPassword        string
	RedisDB              int
	JWTSecret            string
	AccessTokenDuration  time.Duration
	RefreshTokenDuration time.Duration
	ServerPort           int
	ServerHost           string
	AllowedOrigins       []string
	AllowedHeaders       []string
	AllowedMethods       []string
	CookieDomain         string
	SecureCookies        bool
	Environment          string
}

func loadConfig() *Config {
	config := &Config{
		DatabaseURL:          getEnv("DATABASE_URL", "postgres://postgres:password@localhost:5432/auth_system?sslmode=disable"),
		RedisAddr:            getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		RedisDB:              getEnvInt("REDIS_DB", 0),
		JWTSecret:            getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
		AccessTokenDuration:  getEnvDuration("ACCESS_TOKEN_DURATION", 15*time.Minute),
		RefreshTokenDuration: getEnvDuration("REFRESH_TOKEN_DURATION", 168*time.Hour),
		ServerPort:           getEnvInt("SERVER_PORT", 8080),
		ServerHost:           getEnv("SERVER_HOST", "localhost"),
		AllowedOrigins:       getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		AllowedHeaders:       getEnvSlice("ALLOWED_HEADERS", []string{"Content-Type", "Authorization", "X-Requested-With"}),
		AllowedMethods:       getEnvSlice("ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		CookieDomain:         getEnv("COOKIE_DOMAIN", "localhost"),
		SecureCookies:        getEnvBool("SECURE_COOKIES", false),
		Environment:          getEnv("ENVIRONMENT", "development"),
	}

	// Validate required configuration
	if config.JWTSecret == "your-super-secret-jwt-key-change-this-in-production" {
		log.Println("WARNING: Using default JWT secret. Please change this in production!")
	}

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if parsed, err := time.ParseDuration(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}

func isAllowedOrigin(origin string, allowedOrigins []string) bool {
	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}
	}
	return false
}