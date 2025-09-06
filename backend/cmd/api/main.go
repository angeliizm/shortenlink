package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
	
	"github.com/yourusername/shortenlink/internal/config"
	"github.com/yourusername/shortenlink/internal/database"
	"github.com/yourusername/shortenlink/internal/handlers"
	"github.com/yourusername/shortenlink/internal/middleware"
	"github.com/yourusername/shortenlink/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis
	redisClient, err := database.NewRedisClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	// Initialize services
	authService := services.NewAuthService(db, redisClient, cfg)
	linkService := services.NewLinkService(db, redisClient, cfg)
	analyticsService := services.NewAnalyticsService(db, redisClient, cfg)

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName:               "SHORTENLINK",
		ErrorHandler:          middleware.ErrorHandler,
		DisableStartupMessage: false,
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          10 * time.Second,
		IdleTimeout:           120 * time.Second,
	})

	// Global middleware
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${ip} | ${method} | ${path} | ${error}\n",
	}))
	app.Use(recover.New())
	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSOrigins,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-API-Key",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// Rate limiting
	if cfg.RateLimitEnabled {
		app.Use(limiter.New(limiter.Config{
			Max:               cfg.RateLimitRequests,
			Expiration:        1 * time.Minute,
			LimiterMiddleware: limiter.SlidingWindow{},
		}))
	}

	// Health check endpoints
	app.Get("/health", handlers.HealthCheck(db, redisClient))
	app.Get("/ready", handlers.ReadinessCheck(db, redisClient))

	// API routes
	api := app.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register(authService))
	auth.Post("/login", handlers.Login(authService))
	auth.Post("/refresh", handlers.RefreshToken(authService))
	auth.Post("/magic-link", handlers.MagicLink(authService))
	auth.Get("/verify-email", handlers.VerifyEmail(authService))

	// Protected routes
	api.Use(middleware.AuthMiddleware(cfg))
	auth.Post("/logout", handlers.Logout(authService))

	// Links routes
	links := api.Group("/links")
	links.Get("/", handlers.GetLinks(linkService))
	links.Post("/", handlers.CreateLink(linkService))
	links.Get("/:id", handlers.GetLink(linkService))
	links.Patch("/:id", handlers.UpdateLink(linkService))
	links.Delete("/:id", handlers.DeleteLink(linkService))
	links.Post("/:id/qr", handlers.GenerateQR(linkService))

	// Analytics routes
	analytics := api.Group("/links/:id/stats")
	analytics.Get("/", handlers.GetStats(analyticsService))
	analytics.Get("/top", handlers.GetTopStats(analyticsService))

	// Domains routes
	domains := api.Group("/domains")
	domains.Get("/", handlers.GetDomains(linkService))
	domains.Post("/", handlers.AddDomain(linkService))
	domains.Post("/:id/verify", handlers.VerifyDomain(linkService))

	// API Keys routes
	apiKeys := api.Group("/api-keys")
	apiKeys.Get("/", handlers.GetAPIKeys(authService))
	apiKeys.Post("/", handlers.CreateAPIKey(authService))
	apiKeys.Delete("/:id", handlers.RevokeAPIKey(authService))

	// Webhooks routes
	webhooks := api.Group("/webhooks")
	webhooks.Get("/", handlers.GetWebhooks(linkService))
	webhooks.Post("/", handlers.CreateWebhook(linkService))
	webhooks.Patch("/:id", handlers.UpdateWebhook(linkService))
	webhooks.Delete("/:id", handlers.DeleteWebhook(linkService))

	// Admin routes
	admin := api.Group("/admin", middleware.AdminMiddleware())
	admin.Get("/users", handlers.GetUsers(authService))
	admin.Get("/abuse", handlers.GetAbuseReports(linkService))
	admin.Post("/blocklist", handlers.AddToBlocklist(linkService))

	// Public redirect endpoint (no /api prefix)
	app.Get("/:slug", handlers.RedirectLink(linkService, analyticsService))

	// Start server with graceful shutdown
	go func() {
		port := cfg.Port
		if port == "" {
			port = "8080"
		}
		log.Printf("Server starting on port %s", port)
		if err := app.Listen(":" + port); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Gracefully shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}