-- Create title_style_preferences table
CREATE TABLE IF NOT EXISTS public.title_style_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  preset_id VARCHAR(50) NOT NULL,
  custom_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_title_style_preferences_site_id ON public.title_style_preferences(site_id);

-- Enable RLS
ALTER TABLE public.title_style_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view title style preferences for any site
CREATE POLICY "Anyone can view title style preferences"
  ON public.title_style_preferences
  FOR SELECT
  USING (true);

-- Only site owners can update title style preferences
CREATE POLICY "Site owners can update title style preferences"
  ON public.title_style_preferences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = title_style_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Allow inserts only by site owners
CREATE POLICY "Site owners can insert title style preferences"
  ON public.title_style_preferences
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = title_style_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Allow deletes only by site owners
CREATE POLICY "Site owners can delete title style preferences"
  ON public.title_style_preferences
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = title_style_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_title_style_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_title_style_preferences_updated_at_trigger
  BEFORE UPDATE ON public.title_style_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_title_style_preferences_updated_at();