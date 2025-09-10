-- Add style preference columns to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS profile_preset_id TEXT,
ADD COLUMN IF NOT EXISTS title_font_preset_id TEXT,
ADD COLUMN IF NOT EXISTS title_color TEXT;

-- Add check constraint for title color format (optional)
ALTER TABLE public.pages 
ADD CONSTRAINT valid_title_color CHECK (
  title_color IS NULL OR 
  title_color = '' OR 
  title_color ~ '^#[0-9a-fA-F]{6}$'
);