package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	Email          string     `json:"email" db:"email"`
	PasswordHash   *string    `json:"-" db:"password_hash"`
	Role           string     `json:"role" db:"role"`
	EmailVerified  bool       `json:"email_verified" db:"email_verified"`
	OAuthProvider  *string    `json:"oauth_provider,omitempty" db:"oauth_provider"`
	OAuthID        *string    `json:"-" db:"oauth_id"`
	Settings       JSONB      `json:"settings" db:"settings"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt      *time.Time `json:"-" db:"deleted_at"`
}

type Session struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	UserID            uuid.UUID  `json:"user_id" db:"user_id"`
	TokenHash         string     `json:"-" db:"token_hash"`
	RefreshTokenHash  string     `json:"-" db:"refresh_token_hash"`
	DeviceFingerprint *string    `json:"device_fingerprint,omitempty" db:"device_fingerprint"`
	IPAddress         string     `json:"ip_address" db:"ip_address"`
	UserAgent         *string    `json:"user_agent,omitempty" db:"user_agent"`
	ExpiresAt         time.Time  `json:"expires_at" db:"expires_at"`
	RefreshExpiresAt  time.Time  `json:"refresh_expires_at" db:"refresh_expires_at"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	RevokedAt         *time.Time `json:"revoked_at,omitempty" db:"revoked_at"`
}

type APIKey struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	UserID       uuid.UUID  `json:"user_id" db:"user_id"`
	Name         string     `json:"name" db:"name"`
	KeyHash      string     `json:"-" db:"key_hash"`
	KeyPrefix    string     `json:"key_prefix" db:"key_prefix"`
	Scopes       []string   `json:"scopes" db:"scopes"`
	RateLimit    int        `json:"rate_limit" db:"rate_limit"`
	LastUsedAt   *time.Time `json:"last_used_at,omitempty" db:"last_used_at"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty" db:"expires_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	RevokedAt    *time.Time `json:"revoked_at,omitempty" db:"revoked_at"`
}

type AuditLog struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	UserID        *uuid.UUID `json:"user_id,omitempty" db:"user_id"`
	Action        string     `json:"action" db:"action"`
	ResourceType  string     `json:"resource_type" db:"resource_type"`
	ResourceID    *uuid.UUID `json:"resource_id,omitempty" db:"resource_id"`
	Changes       JSONB      `json:"changes,omitempty" db:"changes"`
	IPAddress     string     `json:"ip_address" db:"ip_address"`
	UserAgent     *string    `json:"user_agent,omitempty" db:"user_agent"`
	CorrelationID uuid.UUID  `json:"correlation_id" db:"correlation_id"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
}

// JSONB is a custom type for PostgreSQL JSONB columns
type JSONB map[string]interface{}