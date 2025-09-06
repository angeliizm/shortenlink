package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	
	"github.com/yourusername/shortenlink/internal/services"
)

func GetStats(analyticsService *services.AnalyticsService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		// Parse query parameters
		granularity := c.Query("granularity", "day")
		fromStr := c.Query("from")
		toStr := c.Query("to")

		// Default time range: last 30 days
		to := time.Now()
		from := to.AddDate(0, 0, -30)

		if fromStr != "" {
			if parsed, err := time.Parse(time.RFC3339, fromStr); err == nil {
				from = parsed
			}
		}
		if toStr != "" {
			if parsed, err := time.Parse(time.RFC3339, toStr); err == nil {
				to = parsed
			}
		}

		stats, err := analyticsService.GetStats(c.Context(), linkID, from, to, granularity)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "stats_error",
				"message": err.Error(),
			})
		}

		return c.JSON(stats)
	}
}

func GetTopStats(analyticsService *services.AnalyticsService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		dimension := c.Query("dimension")
		if dimension == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Dimension parameter is required",
			})
		}

		limit := c.QueryInt("limit", 10)
		if limit > 50 {
			limit = 50
		}

		topStats, err := analyticsService.GetTopStats(c.Context(), linkID, dimension, limit)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "stats_error",
				"message": err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"dimension": dimension,
			"data":      topStats,
		})
	}
}