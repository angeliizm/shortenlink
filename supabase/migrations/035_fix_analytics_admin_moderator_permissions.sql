-- Fix analytics tables RLS policies to include moderator permissions
-- This allows admin and moderator users to view analytics for any site

-- Update analytics_events policies
DROP POLICY IF EXISTS "Users can view analytics based on permissions" ON analytics_events;
CREATE POLICY "Users can view analytics based on permissions" ON analytics_events
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Update analytics_sessions policies
DROP POLICY IF EXISTS "Users can view sessions based on permissions" ON analytics_sessions;
CREATE POLICY "Users can view sessions based on permissions" ON analytics_sessions
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Update analytics_metrics_hourly policies
DROP POLICY IF EXISTS "Users can view metrics based on permissions" ON analytics_metrics_hourly;
CREATE POLICY "Users can view metrics based on permissions" ON analytics_metrics_hourly
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Update analytics_realtime policies
DROP POLICY IF EXISTS "Users can view realtime based on permissions" ON analytics_realtime;
CREATE POLICY "Users can view realtime based on permissions" ON analytics_realtime
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Success message
SELECT 'Analytics tables admin/moderator permissions updated successfully!' as message;
