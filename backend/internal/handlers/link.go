package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	
	"github.com/yourusername/shortenlink/internal/services"
)

func CreateLink(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user ID from context (set by auth middleware)
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		var req services.CreateLinkRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		link, err := linkService.CreateLink(c.Context(), userID.(uuid.UUID), req)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "creation_failed",
				"message": err.Error(),
			})
		}

		return c.Status(fiber.StatusCreated).JSON(link)
	}
}

func GetLinks(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "unauthorized",
			})
		}

		// TODO: Implement pagination and filtering
		page := c.QueryInt("page", 1)
		limit := c.QueryInt("limit", 20)
		search := c.Query("search")
		tag := c.Query("tag")

		// Placeholder response
		return c.JSON(fiber.Map{
			"data": []interface{}{},
			"pagination": fiber.Map{
				"page":        page,
				"limit":       limit,
				"total":       0,
				"total_pages": 0,
			},
		})
	}
}

func GetLink(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		link, err := linkService.GetLink(c.Context(), linkID)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error":   "not_found",
				"message": "Link not found",
			})
		}

		return c.JSON(link)
	}
}

func UpdateLink(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		// TODO: Implement link update
		return c.JSON(fiber.Map{
			"message": "Link update not yet implemented",
			"id":      linkID,
		})
	}
}

func DeleteLink(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		// TODO: Implement link deletion
		return c.Status(fiber.StatusNoContent).JSON(fiber.Map{
			"message": "Link deleted",
			"id":      linkID,
		})
	}
}

func GenerateQR(linkService *services.LinkService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		linkID, err := uuid.Parse(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid link ID",
			})
		}

		format := c.Query("format", "svg")
		size := c.QueryInt("size", 300)

		// TODO: Implement QR code generation
		return c.JSON(fiber.Map{
			"message": "QR generation not yet implemented",
			"id":      linkID,
			"format":  format,
			"size":    size,
		})
	}
}

func RedirectLink(linkService *services.LinkService, analyticsService *services.AnalyticsService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		slug := c.Params("slug")
		if slug == "" {
			return c.Status(fiber.StatusNotFound).SendString("Not found")
		}

		// Get link by slug
		link, err := linkService.GetLinkBySlug(c.Context(), slug)
		if err != nil {
			return c.Status(fiber.StatusNotFound).SendString("Link not found")
		}

		// Check password if protected
		if link.PasswordHash != nil {
			password := c.Query("password")
			if password == "" {
				// Return password prompt page
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":             "password_required",
					"message":          "This link is password protected",
					"password_required": true,
				})
			}
			// TODO: Verify password
		}

		// Record click asynchronously
		go func() {
			analyticsService.RecordClick(c.Context(), services.ClickEvent{
				LinkID:         link.ID,
				IPAddress:      c.IP(),
				UserAgent:      c.Get("User-Agent"),
				Referrer:       c.Get("Referer"),
				AcceptLanguage: c.Get("Accept-Language"),
			})
		}()

		// Build target URL with UTM parameters
		targetURL := link.TargetURL
		// TODO: Append UTM parameters if configured

		// Set cache headers
		if link.RedirectType == 301 {
			c.Set("Cache-Control", "public, max-age=86400")
		} else {
			c.Set("Cache-Control", "no-cache")
		}

		return c.Redirect(targetURL, link.RedirectType)
	}
}