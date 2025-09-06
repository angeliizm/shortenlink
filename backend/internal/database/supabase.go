package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SupabaseDB struct {
	Pool          *pgxpool.Pool
	URL           string
	AnonKey       string
	ServiceRoleKey string
}

func NewSupabaseDB(databaseURL, supabaseURL, anonKey, serviceRoleKey string) (*SupabaseDB, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Connection pool configuration optimized for Supabase
	config.MaxConns = 50
	config.MinConns = 5
	config.MaxConnLifetime = 1 * time.Hour
	config.MaxConnIdleTime = 30 * time.Minute
	config.HealthCheckPeriod = 1 * time.Minute
	config.ConnConfig.ConnectTimeout = 10 * time.Second

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test the connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping Supabase database: %w", err)
	}

	return &SupabaseDB{
		Pool:           pool,
		URL:            supabaseURL,
		AnonKey:        anonKey,
		ServiceRoleKey: serviceRoleKey,
	}, nil
}

func (db *SupabaseDB) Close() {
	if db.Pool != nil {
		db.Pool.Close()
	}
}

func (db *SupabaseDB) Health(ctx context.Context) error {
	return db.Pool.Ping(ctx)
}

// GetServiceHeaders returns headers for Supabase service role operations
func (db *SupabaseDB) GetServiceHeaders() map[string]string {
	return map[string]string{
		"apikey":        db.ServiceRoleKey,
		"Authorization": fmt.Sprintf("Bearer %s", db.ServiceRoleKey),
		"Content-Type":  "application/json",
	}
}

// GetAnonHeaders returns headers for Supabase anon operations
func (db *SupabaseDB) GetAnonHeaders() map[string]string {
	return map[string]string{
		"apikey":        db.AnonKey,
		"Authorization": fmt.Sprintf("Bearer %s", db.AnonKey),
		"Content-Type":  "application/json",
	}
}