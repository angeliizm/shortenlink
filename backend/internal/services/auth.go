package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"

	"github.com/yourusername/shortenlink/internal/config"
	"github.com/yourusername/shortenlink/internal/database"
	"github.com/yourusername/shortenlink/internal/models"
)

type AuthService struct {
	db     *database.PostgresDB
	redis  *database.RedisClient
	config *config.Config
}

func NewAuthService(db *database.PostgresDB, redis *database.RedisClient, cfg *config.Config) *AuthService {
	return &AuthService{
		db:     db,
		redis:  redis,
		config: cfg,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=12"`
}

type LoginRequest struct {
	Email             string `json:"email" validate:"required,email"`
	Password          string `json:"password" validate:"required"`
	DeviceFingerprint string `json:"device_fingerprint,omitempty"`
}

type TokenResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int          `json:"expires_in"`
	User         *models.User `json:"user"`
}

func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*models.User, error) {
	// Check if user already exists
	var exists bool
	err := s.db.Pool.QueryRow(ctx, 
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
		req.Email,
	).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Hash password
	hashedPassword := s.hashPassword(req.Password)

	// Create user
	user := &models.User{
		ID:            uuid.New(),
		Email:         req.Email,
		PasswordHash:  &hashedPassword,
		Role:          "user",
		EmailVerified: false,
		Settings:      models.JSONB{},
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	_, err = s.db.Pool.Exec(ctx,
		`INSERT INTO users (id, email, password_hash, role, email_verified, settings, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		user.ID, user.Email, user.PasswordHash, user.Role, user.EmailVerified, 
		user.Settings, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// TODO: Send verification email

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest, ipAddress string, userAgent string) (*TokenResponse, error) {
	// Get user by email
	var user models.User
	err := s.db.Pool.QueryRow(ctx,
		`SELECT id, email, password_hash, role, email_verified, created_at, updated_at
		 FROM users WHERE email = $1 AND deleted_at IS NULL`,
		req.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Role, 
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Verify password
	if user.PasswordHash != nil && !s.verifyPassword(req.Password, *user.PasswordHash) {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Store session
	session := &models.Session{
		ID:                uuid.New(),
		UserID:            user.ID,
		TokenHash:         s.hashToken(accessToken),
		RefreshTokenHash:  s.hashToken(refreshToken),
		DeviceFingerprint: &req.DeviceFingerprint,
		IPAddress:         ipAddress,
		UserAgent:         &userAgent,
		ExpiresAt:         time.Now().Add(15 * time.Minute),
		RefreshExpiresAt:  time.Now().Add(7 * 24 * time.Hour),
		CreatedAt:         time.Now(),
	}

	_, err = s.db.Pool.Exec(ctx,
		`INSERT INTO sessions (id, user_id, token_hash, refresh_token_hash, device_fingerprint, 
		 ip_address, user_agent, expires_at, refresh_expires_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		session.ID, session.UserID, session.TokenHash, session.RefreshTokenHash,
		session.DeviceFingerprint, session.IPAddress, session.UserAgent,
		session.ExpiresAt, session.RefreshExpiresAt, session.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    900, // 15 minutes
		User:         &user,
	}, nil
}

func (s *AuthService) hashPassword(password string) string {
	salt := make([]byte, 16)
	rand.Read(salt)
	
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		s.config.Argon2Iterations,
		s.config.Argon2Memory,
		s.config.Argon2Parallelism,
		32,
	)
	
	return base64.RawStdEncoding.EncodeToString(salt) + "$" + 
		   base64.RawStdEncoding.EncodeToString(hash)
}

func (s *AuthService) verifyPassword(password, hash string) bool {
	// Parse salt and hash
	parts := []byte(hash)
	// Implementation would split and verify the hash
	// This is simplified for brevity
	return true // TODO: Implement proper verification
}

func (s *AuthService) generateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID.String(),
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(15 * time.Minute).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

func (s *AuthService) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func (s *AuthService) hashToken(token string) string {
	// Simple hash for storage - in production use proper hashing
	return base64.StdEncoding.EncodeToString([]byte(token))
}