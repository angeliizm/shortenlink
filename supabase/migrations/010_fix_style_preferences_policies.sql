-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own title style preferences" ON title_style_preferences;
DROP POLICY IF EXISTS "Users can view their own profile style preferences" ON profile_style_preferences;

-- Create more permissive policies for title_style_preferences
CREATE POLICY "Allow public read access to title style preferences" ON title_style_preferences
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage their title style preferences" ON title_style_preferences
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );

-- Create more permissive policies for profile_style_preferences  
CREATE POLICY "Allow public read access to profile style preferences" ON profile_style_preferences
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage their profile style preferences" ON profile_style_preferences
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );
