package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"auth-system/internal/db"
	"auth-system/internal/http/middleware"
	"auth-system/internal/http/validators"
	"auth-system/internal/redis"
	"auth-system/internal/security"
)

type AuthHandler struct {
	db          *db.DB
	redisClient *redis.Client
	jwtManager  *security.JWTManager
	cookieDomain string
	secureCookies bool
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type AuthResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type UserResponse struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewAuthHandler(db *db.DB, redisClient *redis.Client, jwtManager *security.JWTManager, cookieDomain string, secureCookies bool) *AuthHandler {
	return &AuthHandler{
		db:          db,
		redisClient: redisClient,
		jwtManager:  jwtManager,
		cookieDomain: cookieDomain,
		secureCookies: secureCookies,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if err := validators.ValidateStruct(&req); err != nil {
		h.writeErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Check if user already exists
	existingUser, err := h.db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if existingUser != nil {
		h.writeErrorResponse(w, "User already exists", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := security.HashPassword(req.Password, nil)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create user
	user, err := h.db.CreateUser(ctx, req.Email, hashedPassword)
	if err != nil {
		h.writeErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Generate tokens
	tokenPair, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		h.writeErrorResponse(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Store refresh token in Redis
	refreshClaims, err := h.jwtManager.GetTokenClaims(tokenPair.RefreshToken)
	if err != nil {
		h.writeErrorResponse(w, "Failed to process refresh token", http.StatusInternalServerError)
		return
	}

	err = h.redisClient.SetRefreshToken(ctx, user.ID, refreshClaims.TokenID, tokenPair.RefreshToken, 7*24*time.Hour)
	if err != nil {
		h.writeErrorResponse(w, "Failed to store refresh token", http.StatusInternalServerError)
		return
	}

	// Set cookies
	h.setTokenCookies(w, tokenPair.AccessToken, tokenPair.RefreshToken)

	response := AuthResponse{
		Success: true,
		Message: "User registered successfully",
		Data: map[string]interface{}{
			"user":         &UserResponse{ID: user.ID, Email: user.Email, CreatedAt: user.CreatedAt, UpdatedAt: user.UpdatedAt},
			"access_token": tokenPair.AccessToken,
			"expires_at":   tokenPair.ExpiresAt,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if err := validators.ValidateStruct(&req); err != nil {
		h.writeErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Get user by email
	user, err := h.db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if user == nil {
		h.writeErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Verify password
	isValid, err := security.VerifyPassword(req.Password, user.Password)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if !isValid {
		h.writeErrorResponse(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate tokens
	tokenPair, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		h.writeErrorResponse(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Store refresh token in Redis
	refreshClaims, err := h.jwtManager.GetTokenClaims(tokenPair.RefreshToken)
	if err != nil {
		h.writeErrorResponse(w, "Failed to process refresh token", http.StatusInternalServerError)
		return
	}

	err = h.redisClient.SetRefreshToken(ctx, user.ID, refreshClaims.TokenID, tokenPair.RefreshToken, 7*24*time.Hour)
	if err != nil {
		h.writeErrorResponse(w, "Failed to store refresh token", http.StatusInternalServerError)
		return
	}

	// Set cookies
	h.setTokenCookies(w, tokenPair.AccessToken, tokenPair.RefreshToken)

	response := AuthResponse{
		Success: true,
		Message: "Login successful",
		Data: map[string]interface{}{
			"user":         &UserResponse{ID: user.ID, Email: user.Email, CreatedAt: user.CreatedAt, UpdatedAt: user.UpdatedAt},
			"access_token": tokenPair.AccessToken,
			"expires_at":   tokenPair.ExpiresAt,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Try to get refresh token from cookie first
	refreshToken := ""
	if cookie, err := r.Cookie("refresh_token"); err == nil {
		refreshToken = cookie.Value
	}

	// If not in cookie, try request body
	if refreshToken == "" {
		var req RefreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			h.writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		refreshToken = req.RefreshToken
	}

	if refreshToken == "" {
		h.writeErrorResponse(w, "Refresh token required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Validate refresh token
	claims, err := h.jwtManager.ValidateToken(refreshToken)
	if err != nil {
		h.writeErrorResponse(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// Check if refresh token exists in Redis
	storedToken, err := h.redisClient.GetRefreshToken(ctx, claims.UserID, claims.TokenID)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if storedToken == "" || storedToken != refreshToken {
		h.writeErrorResponse(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// Get user from database
	user, err := h.db.GetUserByID(ctx, claims.UserID)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if user == nil {
		h.writeErrorResponse(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Generate new token pair
	newTokenPair, err := h.jwtManager.GenerateTokenPair(user.ID, user.Email)
	if err != nil {
		h.writeErrorResponse(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Delete old refresh token
	err = h.redisClient.DeleteRefreshToken(ctx, claims.UserID, claims.TokenID)
	if err != nil {
		h.writeErrorResponse(w, "Failed to rotate refresh token", http.StatusInternalServerError)
		return
	}

	// Store new refresh token
	newRefreshClaims, err := h.jwtManager.GetTokenClaims(newTokenPair.RefreshToken)
	if err != nil {
		h.writeErrorResponse(w, "Failed to process refresh token", http.StatusInternalServerError)
		return
	}

	err = h.redisClient.SetRefreshToken(ctx, user.ID, newRefreshClaims.TokenID, newTokenPair.RefreshToken, 7*24*time.Hour)
	if err != nil {
		h.writeErrorResponse(w, "Failed to store refresh token", http.StatusInternalServerError)
		return
	}

	// Set new cookies
	h.setTokenCookies(w, newTokenPair.AccessToken, newTokenPair.RefreshToken)

	response := AuthResponse{
		Success: true,
		Message: "Tokens refreshed successfully",
		Data: map[string]interface{}{
			"access_token": newTokenPair.AccessToken,
			"expires_at":   newTokenPair.ExpiresAt,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Get access token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		token := authHeader[len("Bearer "):]
		if claims, err := h.jwtManager.GetTokenClaims(token); err == nil {
			// Blacklist the access token
			expiry := claims.ExpiresAt.Sub(time.Now())
			if expiry > 0 {
				h.redisClient.SetBlacklistToken(ctx, claims.TokenID, expiry)
			}

			// Delete all refresh tokens for the user
			h.redisClient.DeleteAllUserRefreshTokens(ctx, claims.UserID)
		}
	}

	// Get refresh token from cookie and blacklist it
	if cookie, err := r.Cookie("refresh_token"); err == nil {
		if claims, err := h.jwtManager.GetTokenClaims(cookie.Value); err == nil {
			h.redisClient.DeleteRefreshToken(ctx, claims.UserID, claims.TokenID)
		}
	}

	// Clear cookies
	h.clearTokenCookies(w)

	response := AuthResponse{
		Success: true,
		Message: "Logged out successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.writeErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user := middleware.GetAuthenticatedUser(r)
	if user == nil {
		h.writeErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Get full user data from database
	dbUser, err := h.db.GetUserByID(ctx, user.ID)
	if err != nil {
		h.writeErrorResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if dbUser == nil {
		h.writeErrorResponse(w, "User not found", http.StatusNotFound)
		return
	}

	response := AuthResponse{
		Success: true,
		Data: &UserResponse{
			ID:        dbUser.ID,
			Email:     dbUser.Email,
			CreatedAt: dbUser.CreatedAt,
			UpdatedAt: dbUser.UpdatedAt,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandler) setTokenCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	// Access token cookie (15 minutes)
	accessCookie := &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		MaxAge:   15 * 60, // 15 minutes
		HttpOnly: true,
		Secure:   h.secureCookies,
		SameSite: http.SameSiteStrictMode,
		Domain:   h.cookieDomain,
		Path:     "/",
	}

	// Refresh token cookie (7 days)
	refreshCookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		MaxAge:   7 * 24 * 60 * 60, // 7 days
		HttpOnly: true,
		Secure:   h.secureCookies,
		SameSite: http.SameSiteStrictMode,
		Domain:   h.cookieDomain,
		Path:     "/",
	}

	http.SetCookie(w, accessCookie)
	http.SetCookie(w, refreshCookie)
}

func (h *AuthHandler) clearTokenCookies(w http.ResponseWriter) {
	// Clear access token cookie
	accessCookie := &http.Cookie{
		Name:     "access_token",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.secureCookies,
		SameSite: http.SameSiteStrictMode,
		Domain:   h.cookieDomain,
		Path:     "/",
	}

	// Clear refresh token cookie
	refreshCookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.secureCookies,
		SameSite: http.SameSiteStrictMode,
		Domain:   h.cookieDomain,
		Path:     "/",
	}

	http.SetCookie(w, accessCookie)
	http.SetCookie(w, refreshCookie)
}

func (h *AuthHandler) writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := AuthResponse{
		Success: false,
		Message: message,
	}

	json.NewEncoder(w).Encode(response)
}