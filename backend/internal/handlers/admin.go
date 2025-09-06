package handlers

import (
	"github.com/gofiber/fiber/v2"
	
	"github.com/yourusername/shortenlink/internal/services"
)

func GetUsers(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Admin check is done by middleware
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 20)
		search := c.Query("search")

		// TODO: Implement user listing
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       0,
				"total_pages": 0,
			},
		})
	}
}

func GetAbuseReports(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		status := c.Query("status", "pending")

		// TODO: Implement abuse reports listing
		return c.JSON([]fiber.Map{})
	}
}

func AddToBlocklist(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Type   string `json:"type"`   // domain, keyword, ip
			Value  string `json:"value"`
			Reason string `json:"reason"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// TODO: Implement blocklist addition
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Added to blocklist",
			"type":    req.Type,
			"value":   req.Value,
		})
	}
}