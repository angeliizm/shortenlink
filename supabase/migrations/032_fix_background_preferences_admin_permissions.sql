-- Fix background_preferences RLS policies to include admin/moderator permissions
-- This allows admin and moderator users to edit background preferences for any site

-- Drop existing policies
DROP POLICY IF EXISTS "Site owners can update background preferences" ON public.background_preferences;
DROP POLICY IF EXISTS "Site owners can insert background preferences" ON public.background_preferences;

-- Create new policies that include admin/moderator permissions
-- Policy for UPDATE operations
CREATE POLICY "Site owners and admins can update background preferences"
  ON public.background_preferences
  FOR UPDATE
  USING (
    -- Site owner can update
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = background_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
    OR
    -- Admin and moderator can update any site
    get_user_role() IN ('admin', 'moderator')
  );

-- Policy for INSERT operations
CREATE POLICY "Site owners and admins can insert background preferences"
  ON public.background_preferences
  FOR INSERT
  WITH CHECK (
    -- Site owner can insert
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = background_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
    OR
    -- Admin and moderator can insert for any site
    get_user_role() IN ('admin', 'moderator')
  );

-- Policy for DELETE operations
CREATE POLICY "Site owners and admins can delete background preferences"
  ON public.background_preferences
  FOR DELETE
  USING (
    -- Site owner can delete
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = background_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
    OR
    -- Admin and moderator can delete any site's preferences
    get_user_role() IN ('admin', 'moderator')
  );

-- Success message
SELECT 'Background preferences admin/moderator permissions updated successfully!' as message;
