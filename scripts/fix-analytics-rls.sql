-- Fix RLS policies for analytics tables
-- Run this in Supabase SQL editor after creating the analytics tables

-- Drop existing policies first
DROP POLICY IF EXISTS "Site owners can view analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Site owners can view analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Site owners can view analytics metrics" ON analytics_metrics_hourly;
DROP POLICY IF EXISTS "Site owners can view realtime analytics" ON analytics_realtime;
DROP POLICY IF EXISTS "Anyone can track events" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can manage sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Anyone can update realtime" ON analytics_realtime;
DROP POLICY IF EXISTS "Service role can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Service role can manage sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Service role can manage metrics" ON analytics_metrics_hourly;
DROP POLICY IF EXISTS "Service role can manage realtime" ON analytics_realtime;
DROP POLICY IF EXISTS "Service role can manage queue" ON analytics_event_queue;

-- Enable RLS on all tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_event_queue ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own site analytics
CREATE POLICY "Owners can view their analytics events"
ON analytics_events FOR SELECT
TO authenticated
USING (
    site_slug IN (
        SELECT site_slug 
        FROM public.pages 
        WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Owners can view their analytics sessions"
ON analytics_sessions FOR SELECT
TO authenticated
USING (
    site_slug IN (
        SELECT site_slug 
        FROM public.pages 
        WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Owners can view their analytics metrics"
ON analytics_metrics_hourly FOR SELECT
TO authenticated
USING (
    site_slug IN (
        SELECT site_slug 
        FROM public.pages 
        WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Owners can view their realtime analytics"
ON analytics_realtime FOR SELECT
TO authenticated
USING (
    site_slug IN (
        SELECT site_slug 
        FROM public.pages 
        WHERE owner_id = auth.uid()
    )
);

-- Policy for anonymous users to insert events (for tracking)
CREATE POLICY "Public can insert analytics events"
ON analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy for managing sessions (public needs to create/update)
CREATE POLICY "Public can insert sessions"
ON analytics_sessions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update sessions"
ON analytics_sessions FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy for realtime updates
CREATE POLICY "Public can insert realtime"
ON analytics_realtime FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update realtime"
ON analytics_realtime FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete old realtime"
ON analytics_realtime FOR DELETE
TO anon, authenticated
USING (last_seen < NOW() - INTERVAL '5 minutes');

-- Policy for event queue (service role only)
CREATE POLICY "Service can manage event queue"
ON analytics_event_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON analytics_events TO authenticated;
GRANT INSERT ON analytics_events TO anon, authenticated;
GRANT SELECT ON analytics_sessions TO authenticated;
GRANT INSERT, UPDATE ON analytics_sessions TO anon, authenticated;
GRANT SELECT ON analytics_metrics_hourly TO authenticated;
GRANT SELECT ON analytics_realtime TO authenticated;
GRANT INSERT, UPDATE, DELETE ON analytics_realtime TO anon, authenticated;

-- Grant sequence permissions for inserts
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename LIKE 'analytics_%'
ORDER BY tablename, policyname;

-- Test query to verify data access
-- This should return data for sites you own when logged in
SELECT 
    'analytics_events' as table_name,
    COUNT(*) as row_count,
    MIN(timestamp) as oldest_record,
    MAX(timestamp) as newest_record
FROM analytics_events
WHERE site_slug IN (
    SELECT site_slug FROM pages WHERE owner_id = auth.uid()
)
UNION ALL
SELECT 
    'analytics_sessions' as table_name,
    COUNT(*) as row_count,
    MIN(started_at) as oldest_record,
    MAX(started_at) as newest_record
FROM analytics_sessions
WHERE site_slug IN (
    SELECT site_slug FROM pages WHERE owner_id = auth.uid()
);