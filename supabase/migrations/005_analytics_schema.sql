-- Analytics tables for tracking site events and metrics

-- Main analytics events table (partitioned by month for performance)
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
    
    -- Dimensions
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
    
    -- Event-specific data
    action_index INTEGER, -- For action_click events
    action_type VARCHAR(50), -- For action_click events
    dashboard_action VARCHAR(100), -- For dashboard_action events
    
    -- Performance and privacy
    ip_hash VARCHAR(64), -- Anonymized IP hash
    is_bot BOOLEAN DEFAULT FALSE,
    is_new_visitor BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_analytics_events_site_slug ON analytics_events(site_slug);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX idx_analytics_events_composite ON analytics_events(site_slug, timestamp DESC, event_type);

-- Sessions table for tracking user sessions
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
    
    -- Session dimensions
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(2),
    region VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_sessions_site_slug ON analytics_sessions(site_slug);
CREATE INDEX idx_analytics_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);

-- Aggregated metrics table (hourly rollups for performance)
CREATE TABLE IF NOT EXISTS analytics_metrics_hourly (
    id BIGSERIAL PRIMARY KEY,
    site_slug VARCHAR(255) NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    
    -- Core metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    total_session_duration INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    
    -- Action metrics (JSONB for flexibility with dynamic buttons)
    action_clicks JSONB DEFAULT '{}', -- {action_index: count}
    
    -- Dimension breakdowns
    referrers JSONB DEFAULT '{}', -- {referrer: count}
    devices JSONB DEFAULT '{}', -- {device_type: count}
    browsers JSONB DEFAULT '{}', -- {browser: count}
    countries JSONB DEFAULT '{}', -- {country: count}
    
    -- UTM tracking
    utm_sources JSONB DEFAULT '{}', -- {source: count}
    utm_mediums JSONB DEFAULT '{}', -- {medium: count}
    utm_campaigns JSONB DEFAULT '{}', -- {campaign: count}
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_slug, hour)
);

CREATE INDEX idx_analytics_metrics_hourly_site_hour ON analytics_metrics_hourly(site_slug, hour DESC);

-- Realtime analytics table (last 5 minutes, auto-cleaned)
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

CREATE INDEX idx_analytics_realtime_site_slug ON analytics_realtime(site_slug);
CREATE INDEX idx_analytics_realtime_last_seen ON analytics_realtime(last_seen DESC);

-- Event queue for reliability (retry failed events)
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

CREATE INDEX idx_analytics_event_queue_status ON analytics_event_queue(status);
CREATE INDEX idx_analytics_event_queue_created_at ON analytics_event_queue(created_at);

-- Function to process analytics events
CREATE OR REPLACE FUNCTION process_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session information
    IF NEW.event_type IN ('page_view', 'action_click') THEN
        UPDATE analytics_sessions 
        SET 
            page_views = CASE WHEN NEW.event_type = 'page_view' THEN page_views + 1 ELSE page_views END,
            actions_clicked = CASE WHEN NEW.event_type = 'action_click' THEN actions_clicked + 1 ELSE actions_clicked END,
            exit_path = NEW.path,
            updated_at = NOW()
        WHERE id = NEW.session_id;
    END IF;
    
    -- Handle session end
    IF NEW.event_type = 'session_end' THEN
        UPDATE analytics_sessions 
        SET 
            ended_at = NEW.timestamp,
            duration_seconds = EXTRACT(EPOCH FROM (NEW.timestamp - started_at))::INTEGER,
            bounce = CASE WHEN page_views <= 1 THEN TRUE ELSE FALSE END,
            updated_at = NOW()
        WHERE id = NEW.session_id;
    END IF;
    
    -- Update realtime analytics
    IF NEW.event_type = 'page_view' THEN
        INSERT INTO analytics_realtime (site_slug, visitor_id, last_seen, path, device_type, country)
        VALUES (NEW.site_slug, NEW.visitor_id, NEW.timestamp, NEW.path, NEW.device_type, NEW.country)
        ON CONFLICT (site_slug, visitor_id) 
        DO UPDATE SET 
            last_seen = EXCLUDED.last_seen,
            path = EXCLUDED.path;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_event_processor
AFTER INSERT ON analytics_events
FOR EACH ROW EXECUTE FUNCTION process_analytics_event();

-- Function to clean old realtime data (call periodically)
CREATE OR REPLACE FUNCTION clean_realtime_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics_realtime 
    WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate hourly metrics (call periodically)
CREATE OR REPLACE FUNCTION aggregate_hourly_metrics(p_hour TIMESTAMPTZ)
RETURNS void AS $$
DECLARE
    v_site_slug VARCHAR(255);
BEGIN
    -- Get all sites with events in this hour
    FOR v_site_slug IN 
        SELECT DISTINCT site_slug 
        FROM analytics_events 
        WHERE timestamp >= p_hour 
        AND timestamp < p_hour + INTERVAL '1 hour'
    LOOP
        INSERT INTO analytics_metrics_hourly (
            site_slug, hour, page_views, unique_visitors, sessions,
            total_session_duration, bounces, action_clicks, referrers,
            devices, browsers, countries, utm_sources, utm_mediums, utm_campaigns
        )
        SELECT 
            v_site_slug,
            p_hour,
            COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(DISTINCT session_id) as sessions,
            COALESCE(SUM(
                CASE WHEN event_type = 'session_end' THEN 
                    EXTRACT(EPOCH FROM (timestamp - (
                        SELECT started_at FROM analytics_sessions WHERE id = session_id
                    )))::INTEGER 
                END
            ), 0) as total_session_duration,
            COUNT(CASE WHEN event_type = 'session_end' THEN 
                (SELECT 1 FROM analytics_sessions WHERE id = session_id AND bounce = true)
            END) as bounces,
            jsonb_object_agg(
                COALESCE(action_index::text, 'null'), 
                action_count
            ) FILTER (WHERE action_index IS NOT NULL) as action_clicks,
            jsonb_object_agg(
                COALESCE(referrer, 'direct'), 
                referrer_count
            ) FILTER (WHERE referrer IS NOT NULL) as referrers,
            jsonb_object_agg(
                COALESCE(device_type, 'unknown'), 
                device_count
            ) FILTER (WHERE device_type IS NOT NULL) as devices,
            jsonb_object_agg(
                COALESCE(browser, 'unknown'), 
                browser_count
            ) FILTER (WHERE browser IS NOT NULL) as browsers,
            jsonb_object_agg(
                COALESCE(country, 'unknown'), 
                country_count
            ) FILTER (WHERE country IS NOT NULL) as countries,
            jsonb_object_agg(
                COALESCE(utm_source, 'none'), 
                utm_source_count
            ) FILTER (WHERE utm_source IS NOT NULL) as utm_sources,
            jsonb_object_agg(
                COALESCE(utm_medium, 'none'), 
                utm_medium_count
            ) FILTER (WHERE utm_medium IS NOT NULL) as utm_mediums,
            jsonb_object_agg(
                COALESCE(utm_campaign, 'none'), 
                utm_campaign_count
            ) FILTER (WHERE utm_campaign IS NOT NULL) as utm_campaigns
        FROM (
            SELECT 
                visitor_id,
                session_id,
                event_type,
                timestamp,
                action_index,
                COUNT(*) FILTER (WHERE event_type = 'action_click') OVER (PARTITION BY action_index) as action_count,
                referrer,
                COUNT(*) OVER (PARTITION BY referrer) as referrer_count,
                device_type,
                COUNT(*) OVER (PARTITION BY device_type) as device_count,
                browser,
                COUNT(*) OVER (PARTITION BY browser) as browser_count,
                country,
                COUNT(*) OVER (PARTITION BY country) as country_count,
                utm_source,
                COUNT(*) OVER (PARTITION BY utm_source) as utm_source_count,
                utm_medium,
                COUNT(*) OVER (PARTITION BY utm_medium) as utm_medium_count,
                utm_campaign,
                COUNT(*) OVER (PARTITION BY utm_campaign) as utm_campaign_count
            FROM analytics_events
            WHERE site_slug = v_site_slug
            AND timestamp >= p_hour 
            AND timestamp < p_hour + INTERVAL '1 hour'
        ) subquery
        ON CONFLICT (site_slug, hour) 
        DO UPDATE SET
            page_views = EXCLUDED.page_views,
            unique_visitors = EXCLUDED.unique_visitors,
            sessions = EXCLUDED.sessions,
            total_session_duration = EXCLUDED.total_session_duration,
            bounces = EXCLUDED.bounces,
            action_clicks = EXCLUDED.action_clicks,
            referrers = EXCLUDED.referrers,
            devices = EXCLUDED.devices,
            browsers = EXCLUDED.browsers,
            countries = EXCLUDED.countries,
            utm_sources = EXCLUDED.utm_sources,
            utm_mediums = EXCLUDED.utm_mediums,
            utm_campaigns = EXCLUDED.utm_campaigns;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_realtime ENABLE ROW LEVEL SECURITY;

-- Policy: Site owners can view their analytics
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

-- Service role can insert events (for backend processing)
CREATE POLICY "Service role can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage sessions" ON analytics_sessions
    FOR ALL USING (true);

CREATE POLICY "Service role can manage metrics" ON analytics_metrics_hourly
    FOR ALL USING (true);

CREATE POLICY "Service role can manage realtime" ON analytics_realtime
    FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON analytics_events TO authenticated;
GRANT SELECT ON analytics_sessions TO authenticated;
GRANT SELECT ON analytics_metrics_hourly TO authenticated;
GRANT SELECT ON analytics_realtime TO authenticated;
GRANT ALL ON analytics_event_queue TO service_role;