-- Create background_preferences table
CREATE TABLE IF NOT EXISTS public.background_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  preset_id VARCHAR(50) NOT NULL,
  control_values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_background_preferences_site_id ON public.background_preferences(site_id);

-- Enable RLS
ALTER TABLE public.background_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view background preferences for any site
CREATE POLICY "Anyone can view background preferences"
  ON public.background_preferences
  FOR SELECT
  USING (true);

-- Only site owners can update background preferences
CREATE POLICY "Site owners can update background preferences"
  ON public.background_preferences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = background_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Allow inserts only by site owners
CREATE POLICY "Site owners can insert background preferences"
  ON public.background_preferences
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = background_preferences.site_id
      AND pages.owner_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_background_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_background_preferences_updated_at_trigger
  BEFORE UPDATE ON public.background_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_background_preferences_updated_at();