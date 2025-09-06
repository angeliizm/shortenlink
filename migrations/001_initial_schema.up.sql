-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Create domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_txt VARCHAR(255) NOT NULL UNIQUE,
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    last_verification_at TIMESTAMPTZ,
    ssl_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    CONSTRAINT domain_format CHECK (domain ~* '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$')
);

-- Create links table
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id),
    slug VARCHAR(50) NOT NULL,
    target_url TEXT NOT NULL,
    redirect_type INTEGER NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
    title VARCHAR(255),
    password_hash VARCHAR(255),
    expires_at TIMESTAMPTZ,
    click_limit INTEGER CHECK (click_limit > 0),
    one_time BOOLEAN NOT NULL DEFAULT FALSE,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    device_targeting JSONB,
    geo_targeting JSONB,
    qr_logo_url TEXT,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_clicked_at TIMESTAMPTZ,
    CONSTRAINT slug_format CHECK (slug ~* '^[a-zA-Z0-9-]{3,50}$'),
    CONSTRAINT target_url_format CHECK (target_url ~* '^https?://'),
    UNIQUE(domain_id, slug)
);

-- Create link_tags table
CREATE TABLE link_tags (
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (link_id, tag),
    CONSTRAINT tag_format CHECK (tag ~* '^[a-zA-Z0-9-_]{1,50}$')
);

-- Create clicks table
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    accept_language VARCHAR(100),
    referrer TEXT,
    country_code CHAR(2),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    device_type VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    bot_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(8) NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    rate_limit INTEGER NOT NULL DEFAULT 1000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Create webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events TEXT[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT url_format CHECK (url ~* '^https://')
);

-- Create abuse_reports table
CREATE TABLE abuse_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES links(id),
    reporter_ip INET NOT NULL,
    reporter_email VARCHAR(255),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('phishing', 'malware', 'spam', 'inappropriate', 'other')),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET NOT NULL,
    user_agent TEXT,
    correlation_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE UNIQUE INDEX idx_links_domain_slug ON links(domain_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_expires_at ON links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_links_active ON links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_links_created_at ON links(created_at DESC);

CREATE INDEX idx_clicks_link_created ON clicks(link_id, created_at DESC);
CREATE INDEX idx_clicks_created_at ON clicks(created_at DESC);
CREATE INDEX idx_clicks_country ON clicks(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX idx_clicks_not_bot ON clicks(link_id, created_at) WHERE is_bot = FALSE;

CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_user ON sessions(user_id) WHERE revoked_at IS NULL;

CREATE INDEX idx_abuse_status ON abuse_reports(status) WHERE status = 'pending';
CREATE INDEX idx_audit_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_correlation ON audit_logs(correlation_id);

-- Partial indexes for hot data
CREATE INDEX idx_links_recent ON links(created_at DESC) 
    WHERE created_at > NOW() - INTERVAL '30 days' AND is_active = TRUE;

CREATE INDEX idx_clicks_today ON clicks(link_id, created_at) 
    WHERE created_at > NOW() - INTERVAL '24 hours';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default domain for localhost development
INSERT INTO domains (id, user_id, domain, verified, verification_txt, ssl_status)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'localhost:8080',
    true,
    'dev-verification',
    'active'
);