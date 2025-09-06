package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	
	"github.com/yourusername/shortenlink/internal/database"
)

type HealthStatus struct {
	Status    string                 `json:"status"`
	Timestamp time.Time              `json:"timestamp"`
	Version   string                 `json:"version"`
	Checks    map[string]CheckResult `json:"checks"`
}

type CheckResult struct {
	Status    string `json:"status"`
	LatencyMS int64  `json:"latency_ms"`
}

func HealthCheck(db *database.PostgresDB, redis *database.RedisClient) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		status := HealthStatus{
			Status:    "healthy",
			Timestamp: time.Now(),
			Version:   "1.0.0",
			Checks:    make(map[string]CheckResult),
		}

		// Check database
		dbStart := time.Now()
		if err := db.Health(ctx); err != nil {
			status.Status = "unhealthy"
			status.Checks["database"] = CheckResult{
				Status:    "unhealthy",
				LatencyMS: time.Since(dbStart).Milliseconds(),
			}
		} else {
			status.Checks["database"] = CheckResult{
				Status:    "healthy",
				LatencyMS: time.Since(dbStart).Milliseconds(),
			}
		}

		// Check Redis
		redisStart := time.Now()
		if err := redis.Health(ctx); err != nil {
			status.Status = "degraded"
			status.Checks["redis"] = CheckResult{
				Status:    "unhealthy",
				LatencyMS: time.Since(redisStart).Milliseconds(),
			}
		} else {
			status.Checks["redis"] = CheckResult{
				Status:    "healthy",
				LatencyMS: time.Since(redisStart).Milliseconds(),
			}
		}

		statusCode := fiber.StatusOK
		if status.Status == "unhealthy" {
			statusCode = fiber.StatusServiceUnavailable
		}

		return c.Status(statusCode).JSON(status)
	}
}

func ReadinessCheck(db *database.PostgresDB, redis *database.RedisClient) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		// Check if all services are ready
		if err := db.Health(ctx); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"ready": false,
				"reason": "database not ready",
			})
		}

		if err := redis.Health(ctx); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"ready": false,
				"reason": "redis not ready",
			})
		}

		return c.JSON(fiber.Map{
			"ready": true,
		})
	}
}