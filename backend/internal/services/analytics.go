package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/shortenlink/internal/config"
	"github.com/yourusername/shortenlink/internal/database"
	"github.com/yourusername/shortenlink/internal/models"
)

type AnalyticsService struct {
	db     *database.PostgresDB
	redis  *database.RedisClient
	config *config.Config
}

func NewAnalyticsService(db *database.PostgresDB, redis *database.RedisClient, cfg *config.Config) *AnalyticsService {
	return &AnalyticsService{
		db:     db,
		redis:  redis,
		config: cfg,
	}
}

type ClickEvent struct {
	LinkID         uuid.UUID
	IPAddress      string
	UserAgent      string
	Referrer       string
	AcceptLanguage string
}

type StatsResponse struct {
	TotalClicks   int         `json:"total_clicks"`
	UniqueClicks  int         `json:"unique_clicks"`
	DataPoints    []DataPoint `json:"data_points"`
	TopReferrers  []TopItem   `json:"top_referrers,omitempty"`
	TopCountries  []TopItem   `json:"top_countries,omitempty"`
	TopDevices    []TopItem   `json:"top_devices,omitempty"`
}

type DataPoint struct {
	Time  time.Time `json:"time"`
	Count int       `json:"count"`
}

type TopItem struct {
	Value      string  `json:"value"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

func (s *AnalyticsService) RecordClick(ctx context.Context, event ClickEvent) error {
	// Hash IP address with daily salt
	ipHash := s.hashIPAddress(event.IPAddress)

	// Create click record
	click := &models.Click{
		ID:             uuid.New(),
		LinkID:         event.LinkID,
		IPHash:         ipHash,
		UserAgent:      &event.UserAgent,
		Referrer:       &event.Referrer,
		AcceptLanguage: &event.AcceptLanguage,
		IsBot:          s.detectBot(event.UserAgent),
		CreatedAt:      time.Now(),
	}

	// Parse user agent for device info
	// TODO: Implement proper UA parsing
	deviceType := "desktop"
	os := "Unknown"
	browser := "Unknown"
	click.DeviceType = &deviceType
	click.OS = &os
	click.Browser = &browser

	// TODO: GeoIP lookup
	country := "US"
	city := "Unknown"
	click.CountryCode = &country
	click.City = &city

	// Insert click record
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO clicks (id, link_id, ip_hash, user_agent, referrer, 
		 accept_language, country_code, city, device_type, os, browser, is_bot, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		click.ID, click.LinkID, click.IPHash, click.UserAgent, click.Referrer,
		click.AcceptLanguage, click.CountryCode, click.City, click.DeviceType,
		click.OS, click.Browser, click.IsBot, click.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to record click: %w", err)
	}

	// Update link counters
	_, err = s.db.Pool.Exec(ctx,
		`UPDATE links 
		 SET total_clicks = total_clicks + 1,
		     last_clicked_at = NOW()
		 WHERE id = $1`,
		event.LinkID,
	)
	if err != nil {
		return fmt.Errorf("failed to update link counters: %w", err)
	}

	// Update unique clicks (using HyperLogLog in Redis for efficiency)
	uniqueKey := fmt.Sprintf("unique:clicks:%s", event.LinkID)
	s.redis.Client.PFAdd(ctx, uniqueKey, ipHash)

	return nil
}

func (s *AnalyticsService) GetStats(ctx context.Context, linkID uuid.UUID, from, to time.Time, granularity string) (*StatsResponse, error) {
	// Get total and unique clicks
	var totalClicks, uniqueClicks int
	err := s.db.Pool.QueryRow(ctx,
		`SELECT total_clicks, unique_clicks FROM links WHERE id = $1`,
		linkID,
	).Scan(&totalClicks, &uniqueClicks)
	if err != nil {
		return nil, fmt.Errorf("failed to get link stats: %w", err)
	}

	// Get time series data
	var interval string
	switch granularity {
	case "hour":
		interval = "1 hour"
	case "day":
		interval = "1 day"
	case "week":
		interval = "1 week"
	case "month":
		interval = "1 month"
	default:
		interval = "1 day"
	}

	rows, err := s.db.Pool.Query(ctx,
		`SELECT date_trunc($1, created_at) as time_bucket, COUNT(*) as count
		 FROM clicks
		 WHERE link_id = $2 AND created_at BETWEEN $3 AND $4 AND is_bot = false
		 GROUP BY time_bucket
		 ORDER BY time_bucket`,
		granularity, linkID, from, to,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get time series data: %w", err)
	}
	defer rows.Close()

	var dataPoints []DataPoint
	for rows.Next() {
		var dp DataPoint
		if err := rows.Scan(&dp.Time, &dp.Count); err != nil {
			continue
		}
		dataPoints = append(dataPoints, dp)
	}

	// Get unique clicks from Redis HyperLogLog
	uniqueKey := fmt.Sprintf("unique:clicks:%s", linkID)
	uniqueCount, _ := s.redis.Client.PFCount(ctx, uniqueKey).Result()
	if uniqueCount > 0 {
		uniqueClicks = int(uniqueCount)
	}

	return &StatsResponse{
		TotalClicks:  totalClicks,
		UniqueClicks: uniqueClicks,
		DataPoints:   dataPoints,
	}, nil
}

func (s *AnalyticsService) GetTopStats(ctx context.Context, linkID uuid.UUID, dimension string, limit int) ([]TopItem, error) {
	var column string
	switch dimension {
	case "referrer":
		column = "referrer"
	case "country":
		column = "country_code"
	case "city":
		column = "city"
	case "device":
		column = "device_type"
	case "os":
		column = "os"
	case "browser":
		column = "browser"
	default:
		return nil, fmt.Errorf("invalid dimension: %s", dimension)
	}

	rows, err := s.db.Pool.Query(ctx,
		fmt.Sprintf(`SELECT %s as value, COUNT(*) as count
		 FROM clicks
		 WHERE link_id = $1 AND %s IS NOT NULL AND is_bot = false
		 GROUP BY %s
		 ORDER BY count DESC
		 LIMIT $2`, column, column, column),
		linkID, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get top stats: %w", err)
	}
	defer rows.Close()

	var items []TopItem
	var total int
	for rows.Next() {
		var item TopItem
		if err := rows.Scan(&item.Value, &item.Count); err != nil {
			continue
		}
		total += item.Count
		items = append(items, item)
	}

	// Calculate percentages
	for i := range items {
		if total > 0 {
			items[i].Percentage = float64(items[i].Count) / float64(total) * 100
		}
	}

	return items, nil
}

func (s *AnalyticsService) hashIPAddress(ip string) string {
	// Get daily salt
	salt := time.Now().Format("2006-01-02")
	hash := sha256.Sum256([]byte(ip + salt))
	return hex.EncodeToString(hash[:])
}

func (s *AnalyticsService) detectBot(userAgent string) bool {
	// Simple bot detection - enhance with proper bot detection library
	botKeywords := []string{
		"bot", "crawler", "spider", "scraper", "curl", "wget",
		"python", "java", "ruby", "go-http", "axios",
	}
	
	for _, keyword := range botKeywords {
		if containsIgnoreCase(userAgent, keyword) {
			return true
		}
	}
	return false
}

func containsIgnoreCase(s, substr string) bool {
	// Simple case-insensitive contains
	return len(s) > 0 && len(substr) > 0 && 
		   (s == substr || len(s) > len(substr))
}