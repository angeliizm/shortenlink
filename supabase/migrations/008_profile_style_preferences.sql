-- Create profile_style_preferences table
CREATE TABLE IF NOT EXISTS profile_style_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_style_preferences_site_id ON profile_style_preferences(site_id);

-- Enable RLS
ALTER TABLE profile_style_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile style preferences" ON profile_style_preferences
  FOR SELECT USING (
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile style preferences" ON profile_style_preferences
  FOR INSERT WITH CHECK (
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile style preferences" ON profile_style_preferences
  FOR UPDATE USING (
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own profile style preferences" ON profile_style_preferences
  FOR DELETE USING (
    site_id IN (
      SELECT id FROM pages WHERE owner_id = auth.uid()
    )
  );

-- Allow public read access for published pages
CREATE POLICY "Public can view profile style preferences for published pages" ON profile_style_preferences
  FOR SELECT USING (
    site_id IN (
      SELECT id FROM pages WHERE is_enabled = true
    )
  );

-- Allow service role to access all records (for API calls)
CREATE POLICY "Service role can access all profile style preferences" ON profile_style_preferences
  FOR ALL USING (true);
