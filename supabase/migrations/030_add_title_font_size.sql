-- Add title_font_size column to pages table
ALTER TABLE public.pages 
ADD COLUMN title_font_size INTEGER DEFAULT 32;

-- Add comment to the column
COMMENT ON COLUMN public.pages.title_font_size IS 'Font size for the page title in pixels (12-72 range)';
