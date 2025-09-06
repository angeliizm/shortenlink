package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"auth-system/internal/redis"
	"auth-system/internal/security"
)

type AuthMiddleware struct {
	jwtManager  *security.JWTManager
	redisClient *redis.Client
}

type contextKey string

const UserContextKey contextKey = "user"

type AuthenticatedUser struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
}

func NewAuthMiddleware(jwtManager *security.JWTManager, redisClient *redis.Client) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager:  jwtManager,
		redisClient: redisClient,
	}
}

func (am *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			am.writeErrorResponse(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Check if header starts with "Bearer "
		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			am.writeErrorResponse(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		// Extract token
		token := authHeader[len(bearerPrefix):]
		if token == "" {
			am.writeErrorResponse(w, "Token required", http.StatusUnauthorized)
			return
		}

		// Validate token
		claims, err := am.jwtManager.ValidateToken(token)
		if err != nil {
			switch err {
			case security.ErrExpiredToken:
				am.writeErrorResponse(w, "Token has expired", http.StatusUnauthorized)
			case security.ErrInvalidToken, security.ErrInvalidClaims:
				am.writeErrorResponse(w, "Invalid token", http.StatusUnauthorized)
			default:
				am.writeErrorResponse(w, "Token validation failed", http.StatusUnauthorized)
			}
			return
		}

		// Check if token is blacklisted
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		isBlacklisted, err := am.redisClient.IsTokenBlacklisted(ctx, claims.TokenID)
		if err != nil {
			am.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if isBlacklisted {
			am.writeErrorResponse(w, "Token has been revoked", http.StatusUnauthorized)
			return
		}

		// Add user to context
		user := &AuthenticatedUser{
			ID:    claims.UserID,
			Email: claims.Email,
		}

		ctx = context.WithValue(r.Context(), UserContextKey, user)
		r = r.WithContext(ctx)

		next(w, r)
	}
}

func (am *AuthMiddleware) OptionalAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			next(w, r)
			return
		}

		// Check if header starts with "Bearer "
		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			next(w, r)
			return
		}

		// Extract token
		token := authHeader[len(bearerPrefix):]
		if token == "" {
			next(w, r)
			return
		}

		// Validate token
		claims, err := am.jwtManager.ValidateToken(token)
		if err != nil {
			// For optional auth, we don't return errors
			next(w, r)
			return
		}

		// Check if token is blacklisted
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		isBlacklisted, err := am.redisClient.IsTokenBlacklisted(ctx, claims.TokenID)
		if err != nil || isBlacklisted {
			// For optional auth, we don't return errors
			next(w, r)
			return
		}

		// Add user to context
		user := &AuthenticatedUser{
			ID:    claims.UserID,
			Email: claims.Email,
		}

		ctx = context.WithValue(r.Context(), UserContextKey, user)
		r = r.WithContext(ctx)

		next(w, r)
	}
}

func (am *AuthMiddleware) writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := map[string]interface{}{
		"error":   true,
		"message": message,
	}

	json.NewEncoder(w).Encode(response)
}

func GetAuthenticatedUser(r *http.Request) *AuthenticatedUser {
	user, ok := r.Context().Value(UserContextKey).(*AuthenticatedUser)
	if !ok {
		return nil
	}
	return user
}