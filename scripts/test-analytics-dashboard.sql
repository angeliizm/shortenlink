-- Test script to validate analytics dashboard data
-- Run this in Supabase SQL editor to check if data exists and is accessible

-- 1. Check what data exists in analytics tables
SELECT 'Total Events' as metric, COUNT(*) as count FROM analytics_events
UNION ALL
SELECT 'Total Sessions' as metric, COUNT(*) as count FROM analytics_sessions
UNION ALL
SELECT 'Total Hourly Metrics' as metric, COUNT(*) as count FROM analytics_metrics_hourly
UNION ALL
SELECT 'Active Realtime' as metric, COUNT(*) as count FROM analytics_realtime
WHERE last_seen > NOW() - INTERVAL '5 minutes';

-- 2. Check events by site_slug
SELECT 
    site_slug,
    COUNT(*) as event_count,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    MIN(timestamp) as first_event,
    MAX(timestamp) as last_event
FROM analytics_events
GROUP BY site_slug
ORDER BY event_count DESC;

-- 3. Check event types distribution
SELECT 
    site_slug,
    event_type,
    COUNT(*) as count
FROM analytics_events
GROUP BY site_slug, event_type
ORDER BY site_slug, count DESC;

-- 4. Insert test data for a test site (if needed)
-- Uncomment and run this section to add test data

/*
-- Insert test events for testing the dashboard
DO $$
DECLARE
    test_visitor_id UUID := gen_random_uuid();
    test_session_id UUID := gen_random_uuid();
    test_site VARCHAR := 'test-dashboard-site';
    i INTEGER;
BEGIN
    -- Insert page view events
    FOR i IN 1..10 LOOP
        INSERT INTO analytics_events (
            site_slug, event_type, visitor_id, session_id,
            timestamp, path, device_type, browser, os,
            is_new_visitor
        ) VALUES (
            test_site, 'page_view', test_visitor_id, test_session_id,
            NOW() - INTERVAL '1 hour' * i,
            '/test-page-' || i,
            CASE WHEN i % 3 = 0 THEN 'mobile' ELSE 'desktop' END,
            CASE WHEN i % 2 = 0 THEN 'Chrome' ELSE 'Firefox' END,
            'Windows',
            i = 1
        );
    END LOOP;
    
    -- Insert action click events
    FOR i IN 1..5 LOOP
        INSERT INTO analytics_events (
            site_slug, event_type, visitor_id, session_id,
            timestamp, action_index, action_type
        ) VALUES (
            test_site, 'action_click', test_visitor_id, test_session_id,
            NOW() - INTERVAL '30 minutes' * i,
            (i - 1) % 3, -- Button index 0, 1, 2
            'button'
        );
    END LOOP;
    
    -- Insert a session
    INSERT INTO analytics_sessions (
        id, site_slug, visitor_id, started_at,
        page_views, actions_clicked, device_type, browser, os
    ) VALUES (
        test_session_id, test_site, test_visitor_id,
        NOW() - INTERVAL '2 hours',
        10, 5, 'desktop', 'Chrome', 'Windows'
    );
    
    -- Insert realtime entry
    INSERT INTO analytics_realtime (
        site_slug, visitor_id, last_seen, path, device_type
    ) VALUES (
        test_site, test_visitor_id, NOW(), '/current-page', 'desktop'
    )
    ON CONFLICT (site_slug, visitor_id) 
    DO UPDATE SET last_seen = NOW(), path = '/current-page';
    
    RAISE NOTICE 'Test data inserted for site: %', test_site;
END $$;
*/

-- 5. Query to simulate what the dashboard API would fetch
-- Replace 'your-site-slug' with an actual site slug
WITH site_analytics AS (
    SELECT 
        'your-site-slug' as target_site -- Change this to your actual site slug
)
SELECT 
    'Overview' as metric_type,
    json_build_object(
        'total_page_views', (
            SELECT COUNT(*) 
            FROM analytics_events 
            WHERE site_slug = (SELECT target_site FROM site_analytics)
            AND event_type = 'page_view'
            AND timestamp >= NOW() - INTERVAL '30 days'
        ),
        'unique_visitors', (
            SELECT COUNT(DISTINCT visitor_id) 
            FROM analytics_events 
            WHERE site_slug = (SELECT target_site FROM site_analytics)
            AND timestamp >= NOW() - INTERVAL '30 days'
        ),
        'total_sessions', (
            SELECT COUNT(DISTINCT session_id) 
            FROM analytics_events 
            WHERE site_slug = (SELECT target_site FROM site_analytics)
            AND timestamp >= NOW() - INTERVAL '30 days'
        ),
        'action_clicks', (
            SELECT COUNT(*) 
            FROM analytics_events 
            WHERE site_slug = (SELECT target_site FROM site_analytics)
            AND event_type = 'action_click'
            AND timestamp >= NOW() - INTERVAL '30 days'
        )
    ) as data;

-- 6. Check if RLS is working correctly
-- This should show which tables you can access
SELECT 
    schemaname,
    tablename,
    has_table_privilege(tablename, 'SELECT') as can_select,
    has_table_privilege(tablename, 'INSERT') as can_insert,
    has_table_privilege(tablename, 'UPDATE') as can_update,
    has_table_privilege(tablename, 'DELETE') as can_delete
FROM pg_tables
WHERE tablename LIKE 'analytics_%'
ORDER BY tablename;