-- Fix pages table RLS policies to include moderator permissions
-- This allows admin and moderator users to edit any site including name and URL

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view pages based on permissions" ON pages;
DROP POLICY IF EXISTS "Users can create pages based on role" ON pages;
DROP POLICY IF EXISTS "Users can update pages based on permissions" ON pages;
DROP POLICY IF EXISTS "Only admins and owners can delete pages" ON pages;

-- Create updated policies that include moderator permissions
CREATE POLICY "Users can view pages based on permissions" ON pages
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        owner_id = auth.uid() OR
        has_site_permission(auth.uid(), site_slug, 'view')
    );

CREATE POLICY "Users can create pages based on role" ON pages
    FOR INSERT WITH CHECK (
        can_create_sites() AND owner_id = auth.uid()
    );

CREATE POLICY "Users can update pages based on permissions" ON pages
    FOR UPDATE USING (
        get_user_role() IN ('admin', 'moderator') OR
        owner_id = auth.uid() OR
        has_site_permission(auth.uid(), site_slug, 'edit')
    );

CREATE POLICY "Admins, moderators and owners can delete pages" ON pages
    FOR DELETE USING (
        get_user_role() IN ('admin', 'moderator') OR
        owner_id = auth.uid()
    );

-- Update page_actions policies to include moderator permissions
DROP POLICY IF EXISTS "Users can view page actions based on permissions" ON page_actions;
DROP POLICY IF EXISTS "Users can manage page actions based on permissions" ON page_actions;

CREATE POLICY "Users can view page actions based on permissions" ON page_actions
    FOR SELECT USING (
        get_user_role() IN ('admin', 'moderator') OR
        page_id IN (
            SELECT id FROM pages 
            WHERE owner_id = auth.uid() OR 
            has_site_permission(auth.uid(), site_slug, 'view')
        )
    );

CREATE POLICY "Users can manage page actions based on permissions" ON page_actions
    FOR ALL USING (
        get_user_role() IN ('admin', 'moderator') OR
        page_id IN (
            SELECT id FROM pages 
            WHERE owner_id = auth.uid() OR 
            has_site_permission(auth.uid(), site_slug, 'edit')
        )
    );

-- Success message
SELECT 'Pages and page_actions admin/moderator permissions updated successfully!' as message;
