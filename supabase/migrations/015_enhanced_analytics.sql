-- Enhanced analytics for revenue and conversion tracking
-- This migration adds revenue tracking and enhanced metrics

-- Add revenue tracking to analytics_events
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS revenue DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add conversion tracking table
CREATE TABLE IF NOT EXISTS analytics_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_slug VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    event_id BIGINT REFERENCES analytics_events(id),
    conversion_type VARCHAR(50) NOT NULL, -- 'action_click', 'page_goal', 'time_goal'
    conversion_value DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    action_index INTEGER,
    goal_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add enhanced metrics to hourly rollups
ALTER TABLE analytics_metrics_hourly
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_revenue_per_visitor DECIMAL(10,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_site_slug ON analytics_conversions(site_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_created_at ON analytics_conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversions_visitor_id ON analytics_conversions(visitor_id);

-- Enhanced analytics summary view
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    site_slug,
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) FILTER (WHERE event_type = 'action_click') as clicks,
    COALESCE(SUM(revenue), 0) as total_revenue,
    COUNT(*) FILTER (WHERE conversion_value > 0) as conversions,
    CASE 
        WHEN COUNT(DISTINCT visitor_id) > 0 
        THEN (COUNT(*) FILTER (WHERE conversion_value > 0) * 100.0 / COUNT(DISTINCT visitor_id))
        ELSE 0 
    END as conversion_rate,
    CASE 
        WHEN COUNT(DISTINCT visitor_id) > 0 
        THEN COALESCE(SUM(revenue), 0) / COUNT(DISTINCT visitor_id)
        ELSE 0 
    END as avg_revenue_per_visitor,
    AVG(CASE 
        WHEN event_type = 'session_end' AND session_duration IS NOT NULL 
        THEN session_duration 
        ELSE NULL 
    END) as avg_session_duration
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY site_slug, DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Function to calculate CTR (Click Through Rate)
CREATE OR REPLACE FUNCTION calculate_ctr(
    p_site_slug VARCHAR(255),
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    action_index INTEGER,
    impressions BIGINT,
    clicks BIGINT,
    ctr DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(e.action_index, 0) as action_index,
        COUNT(*) FILTER (WHERE e.event_type = 'page_view') as impressions,
        COUNT(*) FILTER (WHERE e.event_type = 'action_click') as clicks,
        CASE 
            WHEN COUNT(*) FILTER (WHERE e.event_type = 'page_view') > 0
            THEN (COUNT(*) FILTER (WHERE e.event_type = 'action_click') * 100.0 / COUNT(*) FILTER (WHERE e.event_type = 'page_view'))
            ELSE 0
        END as ctr
    FROM analytics_events e
    WHERE e.site_slug = p_site_slug
        AND e.timestamp >= p_start_date
        AND e.timestamp <= p_end_date
    GROUP BY COALESCE(e.action_index, 0)
    ORDER BY action_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get real-time analytics
CREATE OR REPLACE FUNCTION get_realtime_analytics(p_site_slug VARCHAR(255))
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_visitors', COUNT(DISTINCT visitor_id),
        'page_views_last_hour', (
            SELECT COUNT(*) 
            FROM analytics_events 
            WHERE site_slug = p_site_slug 
                AND event_type = 'page_view'
                AND timestamp >= NOW() - INTERVAL '1 hour'
        ),
        'clicks_last_hour', (
            SELECT COUNT(*) 
            FROM analytics_events 
            WHERE site_slug = p_site_slug 
                AND event_type = 'action_click'
                AND timestamp >= NOW() - INTERVAL '1 hour'
        ),
        'conversions_today', (
            SELECT COUNT(*) 
            FROM analytics_conversions 
            WHERE site_slug = p_site_slug 
                AND created_at >= DATE_TRUNC('day', NOW())
        ),
        'revenue_today', (
            SELECT COALESCE(SUM(revenue), 0)
            FROM analytics_conversions 
            WHERE site_slug = p_site_slug 
                AND created_at >= DATE_TRUNC('day', NOW())
        ),
        'top_pages', (
            SELECT json_agg(json_build_object('path', path, 'views', views))
            FROM (
                SELECT path, COUNT(*) as views
                FROM analytics_events
                WHERE site_slug = p_site_slug
                    AND event_type = 'page_view'
                    AND timestamp >= NOW() - INTERVAL '1 hour'
                    AND path IS NOT NULL
                GROUP BY path
                ORDER BY views DESC
                LIMIT 5
            ) t
        )
    ) INTO result
    FROM analytics_realtime
    WHERE site_slug = p_site_slug
        AND last_seen >= NOW() - INTERVAL '5 minutes';

    RETURN COALESCE(result, '{"active_visitors": 0, "page_views_last_hour": 0, "clicks_last_hour": 0, "conversions_today": 0, "revenue_today": 0, "top_pages": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for new tables
ALTER TABLE analytics_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site owners can view conversions" ON analytics_conversions
    FOR SELECT USING (
        site_slug IN (
            SELECT site_slug FROM pages WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage conversions" ON analytics_conversions
    FOR ALL USING (true);

-- Grant permissions
GRANT SELECT ON analytics_conversions TO authenticated;
GRANT SELECT ON analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_ctr TO authenticated;
GRANT EXECUTE ON FUNCTION get_realtime_analytics TO authenticated;
