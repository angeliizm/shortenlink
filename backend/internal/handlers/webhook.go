package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	
	"github.com/yourusername/shortenlink/internal/services"
)

func GetWebhooks(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		// TODO: Implement get user's webhooks
		return c.JSON([]fiber.Map{})
	}
}

func CreateWebhook(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		var req struct {
			Name   string   `json:"name"`
			URL    string   `json:"url"`
			Events []string `json:"events"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// TODO: Implement webhook creation
		secret := uuid.New().String()
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"webhook": fiber.Map{
				"id":         uuid.New(),
				"name":       req.Name,
				"url":        req.URL,
				"events":     req.Events,
				"is_active":  true,
				"created_at": "2024-01-01T00:00:00Z",
			},
			"secret": secret,
			"message": "Webhook created. Store the secret securely as it won't be shown again.",
		})
	}
}

func UpdateWebhook(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		webhookID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid webhook ID",
			})
		}

		// TODO: Implement webhook update
		return c.JSON(fiber.Map{
			"message": "Webhook updated",
			"id":      webhookID,
		})
	}
}

func DeleteWebhook(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		webhookID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid webhook ID",
			})
		}

		// TODO: Implement webhook deletion
		return c.Status(fiber.StatusNoContent).JSON(fiber.Map{
			"message": "Webhook deleted",
			"id":      webhookID,
		})
	}
}