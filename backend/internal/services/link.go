package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"github.com/yourusername/shortenlink/internal/config"
	"github.com/yourusername/shortenlink/internal/database"
	"github.com/yourusername/shortenlink/internal/models"
)

type LinkService struct {
	db     *database.PostgresDB
	redis  *database.RedisClient
	config *config.Config
}

func NewLinkService(db *database.PostgresDB, redis *database.RedisClient, cfg *config.Config) *LinkService {
	return &LinkService{
		db:     db,
		redis:  redis,
		config: cfg,
	}
}

type CreateLinkRequest struct {
	TargetURL       string            `json:"target_url" validate:"required,url"`
	Slug            string            `json:"slug,omitempty" validate:"omitempty,min=3,max=50"`
	DomainID        string            `json:"domain_id,omitempty"`
	RedirectType    int               `json:"redirect_type,omitempty"`
	Title           string            `json:"title,omitempty"`
	Tags            []string          `json:"tags,omitempty"`
	Password        string            `json:"password,omitempty"`
	ExpiresAt       *time.Time        `json:"expires_at,omitempty"`
	ClickLimit      *int              `json:"click_limit,omitempty"`
	OneTime         bool              `json:"one_time,omitempty"`
	UTMParams       map[string]string `json:"utm_params,omitempty"`
	DeviceTargeting map[string]string `json:"device_targeting,omitempty"`
	GeoTargeting    []GeoTarget       `json:"geo_targeting,omitempty"`
}

type GeoTarget struct {
	CountryCode string `json:"country_code"`
	TargetURL   string `json:"target_url"`
}

func (s *LinkService) CreateLink(ctx context.Context, userID uuid.UUID, req CreateLinkRequest) (*models.Link, error) {
	// Generate slug if not provided
	if req.Slug == "" {
		req.Slug = s.generateSlug()
	}

	// Validate slug format
	if !s.isValidSlug(req.Slug) {
		return nil, fmt.Errorf("invalid slug format")
	}

	// Get domain ID (use default if not provided)
	domainID := uuid.MustParse("00000000-0000-0000-0000-000000000000") // Default domain
	if req.DomainID != "" {
		domainID = uuid.MustParse(req.DomainID)
	}

	// Check slug availability
	var exists bool
	err := s.db.Pool.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM links WHERE domain_id = $1 AND slug = $2)",
		domainID, req.Slug,
	).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check slug availability: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("slug already exists for this domain")
	}

	// Create link
	link := &models.Link{
		ID:           uuid.New(),
		UserID:       userID,
		DomainID:     domainID,
		Slug:         req.Slug,
		TargetURL:    req.TargetURL,
		RedirectType: 301,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if req.RedirectType == 302 {
		link.RedirectType = 302
	}

	if req.Title != "" {
		link.Title = &req.Title
	}

	if req.Password != "" {
		hashedPassword := s.hashPassword(req.Password)
		link.PasswordHash = &hashedPassword
	}

	link.ExpiresAt = req.ExpiresAt
	link.ClickLimit = req.ClickLimit
	link.OneTime = req.OneTime

	// Set UTM parameters
	if utm, ok := req.UTMParams["source"]; ok {
		link.UTMSource = &utm
	}
	if utm, ok := req.UTMParams["medium"]; ok {
		link.UTMMedium = &utm
	}
	if utm, ok := req.UTMParams["campaign"]; ok {
		link.UTMCampaign = &utm
	}

	// Insert link
	_, err = s.db.Pool.Exec(ctx,
		`INSERT INTO links (id, user_id, domain_id, slug, target_url, redirect_type, 
		 title, password_hash, expires_at, click_limit, one_time, 
		 utm_source, utm_medium, utm_campaign, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
		link.ID, link.UserID, link.DomainID, link.Slug, link.TargetURL, link.RedirectType,
		link.Title, link.PasswordHash, link.ExpiresAt, link.ClickLimit, link.OneTime,
		link.UTMSource, link.UTMMedium, link.UTMCampaign, link.IsActive, link.CreatedAt, link.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create link: %w", err)
	}

	// Insert tags
	for _, tag := range req.Tags {
		_, err = s.db.Pool.Exec(ctx,
			"INSERT INTO link_tags (link_id, tag) VALUES ($1, $2)",
			link.ID, tag,
		)
		if err != nil {
			// Log error but don't fail the entire operation
			fmt.Printf("Failed to insert tag %s: %v\n", tag, err)
		}
	}

	// Cache the link for quick access
	s.cacheLink(ctx, link)

	// Set short URL
	link.ShortURL = fmt.Sprintf("http://localhost:8080/%s", link.Slug)
	link.Tags = req.Tags

	return link, nil
}

func (s *LinkService) GetLink(ctx context.Context, linkID uuid.UUID) (*models.Link, error) {
	var link models.Link
	
	err := s.db.Pool.QueryRow(ctx,
		`SELECT id, user_id, domain_id, slug, target_url, redirect_type, 
		 title, expires_at, click_limit, one_time, total_clicks, unique_clicks,
		 is_active, created_at, updated_at, last_clicked_at
		 FROM links WHERE id = $1 AND is_active = true`,
		linkID,
	).Scan(
		&link.ID, &link.UserID, &link.DomainID, &link.Slug, &link.TargetURL, &link.RedirectType,
		&link.Title, &link.ExpiresAt, &link.ClickLimit, &link.OneTime, &link.TotalClicks, &link.UniqueClicks,
		&link.IsActive, &link.CreatedAt, &link.UpdatedAt, &link.LastClickedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("link not found: %w", err)
	}

	// Get tags
	rows, err := s.db.Pool.Query(ctx,
		"SELECT tag FROM link_tags WHERE link_id = $1",
		linkID,
	)
	if err == nil {
		defer rows.Close()
		var tags []string
		for rows.Next() {
			var tag string
			if err := rows.Scan(&tag); err == nil {
				tags = append(tags, tag)
			}
		}
		link.Tags = tags
	}

	link.ShortURL = fmt.Sprintf("http://localhost:8080/%s", link.Slug)
	
	return &link, nil
}

func (s *LinkService) GetLinkBySlug(ctx context.Context, slug string) (*models.Link, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("link:slug:%s", slug)
	cached, err := s.redis.Client.Get(ctx, cacheKey).Result()
	if err == nil && cached != "" {
		// Parse cached link
		// For simplicity, we'll skip cache in this implementation
	}

	var link models.Link
	err = s.db.Pool.QueryRow(ctx,
		`SELECT id, user_id, domain_id, slug, target_url, redirect_type, 
		 password_hash, expires_at, click_limit, one_time, total_clicks,
		 is_active, created_at
		 FROM links 
		 WHERE slug = $1 AND is_active = true`,
		slug,
	).Scan(
		&link.ID, &link.UserID, &link.DomainID, &link.Slug, &link.TargetURL, &link.RedirectType,
		&link.PasswordHash, &link.ExpiresAt, &link.ClickLimit, &link.OneTime, &link.TotalClicks,
		&link.IsActive, &link.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("link not found: %w", err)
	}

	// Check expiration
	if link.ExpiresAt != nil && link.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("link has expired")
	}

	// Check click limit
	if link.ClickLimit != nil && link.TotalClicks >= *link.ClickLimit {
		return nil, fmt.Errorf("click limit reached")
	}

	// Check one-time link
	if link.OneTime && link.TotalClicks > 0 {
		return nil, fmt.Errorf("one-time link already used")
	}

	return &link, nil
}

func (s *LinkService) generateSlug() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 7)
	rand.Read(b)
	for i := range b {
		b[i] = charset[int(b[i])%len(charset)]
	}
	return string(b)
}

func (s *LinkService) isValidSlug(slug string) bool {
	if len(slug) < 3 || len(slug) > 50 {
		return false
	}
	for _, ch := range slug {
		if !((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || 
			 (ch >= '0' && ch <= '9') || ch == '-') {
			return false
		}
	}
	return true
}

func (s *LinkService) hashPassword(password string) string {
	// Simple hash for demo - use proper hashing in production
	return base64.StdEncoding.EncodeToString([]byte(password))
}

func (s *LinkService) cacheLink(ctx context.Context, link *models.Link) {
	cacheKey := fmt.Sprintf("link:slug:%s", link.Slug)
	// Cache for 24 hours
	s.redis.Client.Set(ctx, cacheKey, link.TargetURL, 24*time.Hour)
}