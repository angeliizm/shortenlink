package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yourusername/shortenlink/internal/services"
)

func Register(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req services.RegisterRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		user, err := authService.Register(c.Context(), req)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "registration_failed",
				"message": err.Error(),
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"user":    user,
			"message": "Registration successful. Please check your email to verify your account.",
		})
	}
}

func Login(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req services.LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// Get IP address and user agent
		ipAddress := c.IP()
		userAgent := c.Get("User-Agent")

		tokenResponse, err := authService.Login(c.Context(), req, ipAddress, userAgent)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": err.Error(),
			})
		}

		return c.JSON(tokenResponse)
	}
}

func RefreshToken(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// TODO: Implement refresh token logic
		return c.JSON(fiber.Map{
			"message": "Token refresh not yet implemented",
		})
	}
}

func Logout(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// TODO: Implement logout (revoke session)
		return c.JSON(fiber.Map{
			"message": "Logout successful",
		})
	}
}

func MagicLink(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			Email string `json:"email"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Invalid request body",
			})
		}

		// TODO: Implement magic link generation and sending
		return c.JSON(fiber.Map{
			"message": "Magic link sent to your email",
		})
	}
}

func VerifyEmail(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Query("token")
		if token == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "validation_error",
				"message": "Verification token required",
			})
		}

		// TODO: Implement email verification
		return c.JSON(fiber.Map{
			"message": "Email verified successfully",
		})
	}
}