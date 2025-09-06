package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	
	"github.com/yourusername/shortenlink/internal/config"
)

func AuthMiddleware(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get token from header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// Check for API key
			apiKey := c.Get("X-API-Key")
			if apiKey != "" {
				// TODO: Validate API key
				return c.Next()
			}
			
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": "Authorization header missing",
			})
		}

		// Extract token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Check signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": "Invalid or expired token",
			})
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID, err := uuid.Parse(claims["sub"].(string))
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   "authentication_error",
					"message": "Invalid user ID in token",
				})
			}

			// Set user info in context
			c.Locals("userID", userID)
			c.Locals("userEmail", claims["email"])
			c.Locals("userRole", claims["role"])
		}

		return c.Next()
	}
}

func AdminMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("userRole")
		if role == nil || role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "authorization_error",
				"message": "Admin access required",
			})
		}
		return c.Next()
	}
}

func APIKeyMiddleware(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": "API key required",
			})
		}

		// TODO: Validate API key and check scopes
		// For now, just check if it starts with expected prefix
		if !strings.HasPrefix(apiKey, "sk_") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "authentication_error",
				"message": "Invalid API key",
			})
		}

		return c.Next()
	}
}