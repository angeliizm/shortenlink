-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE redirect_type AS ENUM ('301', '302');
CREATE TYPE abuse_reason AS ENUM ('phishing', 'malware', 'spam', 'inappropriate', 'other');
CREATE TYPE abuse_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create domains table
CREATE TABLE public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_txt VARCHAR(255) NOT NULL UNIQUE DEFAULT md5(random()::text),
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    last_verification_at TIMESTAMPTZ,
    ssl_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    CONSTRAINT domain_format CHECK (domain ~* '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$|^localhost(:[0-9]+)?$')
);

-- Enable RLS on domains
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create links table
CREATE TABLE public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES public.domains(id),
    slug VARCHAR(50) NOT NULL,
    target_url TEXT NOT NULL,
    redirect_type redirect_type NOT NULL DEFAULT '301',
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

-- Enable RLS on links
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create link_tags table
CREATE TABLE public.link_tags (
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (link_id, tag),
    CONSTRAINT tag_format CHECK (tag ~* '^[a-zA-Z0-9-_]{1,50}$')
);

-- Enable RLS on link_tags
ALTER TABLE public.link_tags ENABLE ROW LEVEL SECURITY;

-- Create clicks table
CREATE TABLE public.clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
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

-- Enable RLS on clicks
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Create api_keys table
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create webhooks table
CREATE TABLE public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS on webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create abuse_reports table
CREATE TABLE public.abuse_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id),
    reporter_ip INET NOT NULL,
    reporter_email VARCHAR(255),
    reason abuse_reason NOT NULL,
    description TEXT,
    status abuse_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on abuse_reports
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET NOT NULL,
    user_agent TEXT,
    correlation_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for optimal performance
CREATE UNIQUE INDEX idx_links_domain_slug ON public.links(domain_id, slug);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_expires_at ON public.links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_links_active ON public.links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_links_created_at ON public.links(created_at DESC);

CREATE INDEX idx_clicks_link_created ON public.clicks(link_id, created_at DESC);
CREATE INDEX idx_clicks_created_at ON public.clicks(created_at DESC);
CREATE INDEX idx_clicks_country ON public.clicks(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX idx_clicks_not_bot ON public.clicks(link_id, created_at) WHERE is_bot = FALSE;

CREATE INDEX idx_abuse_status ON public.abuse_reports(status) WHERE status = 'pending';
CREATE INDEX idx_audit_user_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_correlation ON public.audit_logs(correlation_id);

-- Partial indexes for hot data (removed dynamic time conditions)
CREATE INDEX idx_links_recent ON public.links(created_at DESC) 
    WHERE is_active = TRUE;

CREATE INDEX idx_clicks_recent ON public.clicks(link_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Domains policies
CREATE POLICY "Users can view own domains" ON public.domains
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create domains" ON public.domains
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains" ON public.domains
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains" ON public.domains
    FOR DELETE USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Users can view own links" ON public.links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links" ON public.links
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can create links" ON public.links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON public.links
    FOR DELETE USING (auth.uid() = user_id);

-- Link tags policies
CREATE POLICY "Users can view tags of own links" ON public.link_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE links.id = link_tags.link_id 
            AND links.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage tags of own links" ON public.link_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE links.id = link_tags.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- Clicks policies (anyone can create clicks, users can view own link clicks)
CREATE POLICY "Anyone can create clicks" ON public.clicks
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view clicks for own links" ON public.clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE links.id = clicks.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- API keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Webhooks policies
CREATE POLICY "Users can view own webhooks" ON public.webhooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create webhooks" ON public.webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks" ON public.webhooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks" ON public.webhooks
    FOR DELETE USING (auth.uid() = user_id);

-- Abuse reports policies
CREATE POLICY "Anyone can create abuse reports" ON public.abuse_reports
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all abuse reports" ON public.abuse_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update abuse reports" ON public.abuse_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- Create Supabase Edge Functions for link redirection
-- This will be created as a separate edge function file