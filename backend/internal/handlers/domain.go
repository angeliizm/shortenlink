package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	
	"github.com/yourusername/shortenlink/internal/services"
)

func GetDomains(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		// TODO: Implement get user's domains
		return c.JSON([]fiber.Map{
			{
				"id":               "00000000-0000-0000-0000-000000000000",
				"domain":          "localhost:8080",
				"verified":        true,
				"ssl_status":      "active",
				"created_at":      "2024-01-01T00:00:00Z",
			},
		})
	}
}

func AddDomain(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		var req struct {
			Domain string `json:"domain"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// TODO: Implement domain addition
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"id":                uuid.New(),
			"domain":           req.Domain,
			"verified":         false,
			"verification_txt": "verify-" + uuid.New().String()[:8],
			"message":          "Domain added. Please add the TXT record to verify ownership.",
		})
	}
}

func VerifyDomain(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		domainID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid domain ID",
			})
		}

		// TODO: Implement domain verification
		return c.JSON(fiber.Map{
			"verified": false,
			"message":  "Domain verification not yet implemented",
			"dns_records": []fiber.Map{
				{
					"type":  "TXT",
					"name":  "_shortenlink",
					"value": "verify-xxxxx",
				},
				{
					"type":  "CNAME",
					"name":  "@",
					"value": "proxy.shortn.link",
				},
			},
		})
	}
}