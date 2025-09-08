-- Run this script in your Supabase SQL editor to set up analytics
-- Go to: Your Supabase Dashboard > SQL Editor > New Query

-- Drop existing tables if needed (uncomment if you want to reset)
-- DROP TABLE IF EXISTS analytics_events CASCADE;
-- DROP TABLE IF EXISTS analytics_sessions CASCADE;
-- DROP TABLE IF EXISTS analytics_metrics_hourly CASCADE;
-- DROP TABLE IF EXISTS analytics_realtime CASCADE;
-- DROP TABLE IF EXISTS analytics_event_queue CASCADE;

-- Create analytics tables
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'page_view', 'unique_visitor', 'session_start', 'session_end',
        'action_click', 'auth_login', 'auth_logout', 'dashboard_view', 
        'dashboard_action'
    )),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id UUID,
    visitor_id UUID,
    path VARCHAR(500),
    referrer VARCHAR(1000),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(2),
    region VARCHAR(100),
    action_index INTEGER,
    action_type VARCHAR(50),
    dashboard_action VARCHAR(100),
    ip_hash VARCHAR(64),
    is_bot BOOLEAN DEFAULT FALSE,
    is_new_visitor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_slug VARCHAR(255) NOT NULL,
    visitor_id UUID NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    actions_clicked INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    entry_path VARCHAR(500),
    exit_path VARCHAR(500),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(2),
    region VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_metrics_hourly (
    id BIGSERIAL PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    total_session_duration INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    action_clicks JSONB DEFAULT '{}',
    referrers JSONB DEFAULT '{}',
    devices JSONB DEFAULT '{}',
    browsers JSONB DEFAULT '{}',
    countries JSONB DEFAULT '{}',
    utm_sources JSONB DEFAULT '{}',
    utm_mediums JSONB DEFAULT '{}',
    utm_campaigns JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_slug, hour)
);

CREATE TABLE IF NOT EXISTS analytics_realtime (
    id BIGSERIAL PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    visitor_id UUID NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    path VARCHAR(500),
    device_type VARCHAR(50),
    country VARCHAR(2),
    UNIQUE(site_slug, visitor_id)
);

CREATE TABLE IF NOT EXISTS analytics_event_queue (
    id BIGSERIAL PRIMARY KEY,
    event_data JSONB NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'failed', 'completed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_site_slug ON analytics_events(site_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_composite ON analytics_events(site_slug, timestamp DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_site_slug ON analytics_sessions(site_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_metrics_hourly_site_hour ON analytics_metrics_hourly(site_slug, hour DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_realtime_site_slug ON analytics_realtime(site_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_realtime_last_seen ON analytics_realtime(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_queue_status ON analytics_event_queue(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_queue_created_at ON analytics_event_queue(created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_realtime ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Site owners can view their analytics
CREATE POLICY "Site owners can view analytics events" ON analytics_events
    FOR SELECT USING (
        site_slug IN (
            SELECT site_slug FROM public.pages 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Site owners can view analytics sessions" ON analytics_sessions
    FOR SELECT USING (
        site_slug IN (
            SELECT site_slug FROM public.pages 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Site owners can view analytics metrics" ON analytics_metrics_hourly
    FOR SELECT USING (
        site_slug IN (
            SELECT site_slug FROM public.pages 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Site owners can view realtime analytics" ON analytics_realtime
    FOR SELECT USING (
        site_slug IN (
            SELECT site_slug FROM public.pages 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow anonymous users to insert events (for tracking)
CREATE POLICY "Anyone can track events" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can manage sessions" ON analytics_sessions
    FOR ALL USING (true);

CREATE POLICY "Anyone can update realtime" ON analytics_realtime
    FOR ALL USING (true);

-- Service role policies for queue
CREATE POLICY "Service role can manage queue" ON analytics_event_queue
    FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON analytics_events TO authenticated;
GRANT SELECT ON analytics_sessions TO authenticated;
GRANT SELECT ON analytics_metrics_hourly TO authenticated;
GRANT SELECT ON analytics_realtime TO authenticated;
GRANT INSERT ON analytics_events TO anon;
GRANT ALL ON analytics_sessions TO anon;
GRANT ALL ON analytics_realtime TO anon;

-- Test that tables were created
SELECT 'Analytics setup complete!' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'analytics_%'
ORDER BY table_name;