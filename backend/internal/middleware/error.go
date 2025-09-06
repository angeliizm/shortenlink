package middleware

import (
	"errors"
	
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func ErrorHandler(c *fiber.Ctx, err error) error {
	// Default to 500
	code := fiber.StatusInternalServerError
	errorType := "server_error"
	message := "An unexpected error occurred"

	// Check if it's a Fiber error
	var fiberErr *fiber.Error
	if errors.As(err, &fiberErr) {
		code = fiberErr.Code
		message = fiberErr.Message
		
		switch code {
		case fiber.StatusBadRequest:
			errorType = "validation_error"
		case fiber.StatusUnauthorized:
			errorType = "authentication_error"
		case fiber.StatusForbidden:
			errorType = "authorization_error"
		case fiber.StatusNotFound:
			errorType = "not_found"
		case fiber.StatusTooManyRequests:
			errorType = "rate_limit"
		}
	}

	// Generate correlation ID
	correlationID := uuid.New()

	// Log the error
	// TODO: Implement proper logging
	
	// Return error response
	return c.Status(code).JSON(fiber.Map{
		"error":          errorType,
		"message":        message,
		"correlation_id": correlationID,
	})
}