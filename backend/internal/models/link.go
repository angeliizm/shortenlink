package models

import (
	"time"

	"github.com/google/uuid"
)

type Link struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	DomainID       uuid.UUID  `json:"domain_id" db:"domain_id"`
	Slug           string     `json:"slug" db:"slug"`
	TargetURL      string     `json:"target_url" db:"target_url"`
	RedirectType   int        `json:"redirect_type" db:"redirect_type"`
	Title          *string    `json:"title,omitempty" db:"title"`
	PasswordHash   *string    `json:"-" db:"password_hash"`
	ExpiresAt      *time.Time `json:"expires_at,omitempty" db:"expires_at"`
	ClickLimit     *int       `json:"click_limit,omitempty" db:"click_limit"`
	OneTime        bool       `json:"one_time" db:"one_time"`
	UTMSource      *string    `json:"utm_source,omitempty" db:"utm_source"`
	UTMMedium      *string    `json:"utm_medium,omitempty" db:"utm_medium"`
	UTMCampaign    *string    `json:"utm_campaign,omitempty" db:"utm_campaign"`
	UTMTerm        *string    `json:"utm_term,omitempty" db:"utm_term"`
	UTMContent     *string    `json:"utm_content,omitempty" db:"utm_content"`
	DeviceTargeting JSONB     `json:"device_targeting,omitempty" db:"device_targeting"`
	GeoTargeting   JSONB      `json:"geo_targeting,omitempty" db:"geo_targeting"`
	QRLogoURL      *string    `json:"qr_logo_url,omitempty" db:"qr_logo_url"`
	TotalClicks    int        `json:"total_clicks" db:"total_clicks"`
	UniqueClicks   int        `json:"unique_clicks" db:"unique_clicks"`
	IsActive       bool       `json:"is_active" db:"is_active"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
	LastClickedAt  *time.Time `json:"last_clicked_at,omitempty" db:"last_clicked_at"`
	
	// Computed fields
	ShortURL       string     `json:"short_url" db:"-"`
	Domain         *Domain    `json:"domain,omitempty" db:"-"`
	Tags           []string   `json:"tags,omitempty" db:"-"`
}

type LinkTag struct {
	LinkID uuid.UUID `json:"link_id" db:"link_id"`
	Tag    string    `json:"tag" db:"tag"`
}

type Domain struct {
	ID                  uuid.UUID  `json:"id" db:"id"`
	UserID              uuid.UUID  `json:"user_id" db:"user_id"`
	Domain              string     `json:"domain" db:"domain"`
	Verified            bool       `json:"verified" db:"verified"`
	VerificationTXT     string     `json:"verification_txt" db:"verification_txt"`
	VerificationAttempts int       `json:"verification_attempts" db:"verification_attempts"`
	LastVerificationAt  *time.Time `json:"last_verification_at,omitempty" db:"last_verification_at"`
	SSLStatus           string     `json:"ssl_status" db:"ssl_status"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	VerifiedAt          *time.Time `json:"verified_at,omitempty" db:"verified_at"`
}

type Click struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	LinkID         uuid.UUID  `json:"link_id" db:"link_id"`
	IPHash         string     `json:"-" db:"ip_hash"`
	UserAgent      *string    `json:"user_agent,omitempty" db:"user_agent"`
	AcceptLanguage *string    `json:"accept_language,omitempty" db:"accept_language"`
	Referrer       *string    `json:"referrer,omitempty" db:"referrer"`
	CountryCode    *string    `json:"country_code,omitempty" db:"country_code"`
	City           *string    `json:"city,omitempty" db:"city"`
	Region         *string    `json:"region,omitempty" db:"region"`
	Latitude       *float64   `json:"latitude,omitempty" db:"latitude"`
	Longitude      *float64   `json:"longitude,omitempty" db:"longitude"`
	DeviceType     *string    `json:"device_type,omitempty" db:"device_type"`
	OS             *string    `json:"os,omitempty" db:"os"`
	OSVersion      *string    `json:"os_version,omitempty" db:"os_version"`
	Browser        *string    `json:"browser,omitempty" db:"browser"`
	BrowserVersion *string    `json:"browser_version,omitempty" db:"browser_version"`
	IsBot          bool       `json:"is_bot" db:"is_bot"`
	BotName        *string    `json:"bot_name,omitempty" db:"bot_name"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}

type Webhook struct {
	ID                  uuid.UUID  `json:"id" db:"id"`
	UserID              uuid.UUID  `json:"user_id" db:"user_id"`
	Name                string     `json:"name" db:"name"`
	URL                 string     `json:"url" db:"url"`
	Secret              string     `json:"-" db:"secret"`
	Events              []string   `json:"events" db:"events"`
	IsActive            bool       `json:"is_active" db:"is_active"`
	ConsecutiveFailures int        `json:"consecutive_failures" db:"consecutive_failures"`
	LastTriggeredAt     *time.Time `json:"last_triggered_at,omitempty" db:"last_triggered_at"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
}

type AbuseReport struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	LinkID        uuid.UUID  `json:"link_id" db:"link_id"`
	ReporterIP    string     `json:"reporter_ip" db:"reporter_ip"`
	ReporterEmail *string    `json:"reporter_email,omitempty" db:"reporter_email"`
	Reason        string     `json:"reason" db:"reason"`
	Description   *string    `json:"description,omitempty" db:"description"`
	Status        string     `json:"status" db:"status"`
	AdminNotes    *string    `json:"admin_notes,omitempty" db:"admin_notes"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	ResolvedAt    *time.Time `json:"resolved_at,omitempty" db:"resolved_at"`
	ResolvedBy    *uuid.UUID `json:"resolved_by,omitempty" db:"resolved_by"`
	
	// Computed fields
	Link          *Link      `json:"link,omitempty" db:"-"`
}