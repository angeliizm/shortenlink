-- Fix title_style_preferences and profile_style_preferences RLS policies to include admin/moderator permissions
-- This allows admin and moderator users to edit style preferences for any site

-- Update title_style_preferences policies
DROP POLICY IF EXISTS "Allow authenticated users to manage their title style preferences" ON title_style_preferences;

CREATE POLICY "Site owners and admins can manage title style preferences"
  ON title_style_preferences
  FOR ALL USING (
    -- Site owner can manage
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
    OR
    -- Admin and moderator can manage any site
    get_user_role() IN ('admin', 'moderator')
  );

-- Update profile_style_preferences policies  
DROP POLICY IF EXISTS "Allow authenticated users to manage their profile style preferences" ON profile_style_preferences;

CREATE POLICY "Site owners and admins can manage profile style preferences"
  ON profile_style_preferences
  FOR ALL USING (
    -- Site owner can manage
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
    OR
    -- Admin and moderator can manage any site
    get_user_role() IN ('admin', 'moderator')
  );

-- Success message
SELECT 'Style preferences admin/moderator permissions updated successfully!' as message;
