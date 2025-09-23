-- Add owner_name field to pages table
-- This allows site owners to set a custom display name for their sites in reports

-- Add owner_name column to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.pages.owner_name IS 'Custom display name for the site owner in reports and admin panels';

-- Create index for better performance when filtering by owner name
CREATE INDEX IF NOT EXISTS idx_pages_owner_name ON public.pages(owner_name);

-- Update existing pages to have owner_name as empty string if null
UPDATE public.pages 
SET owner_name = '' 
WHERE owner_name IS NULL;

-- Make owner_name NOT NULL with default empty string
ALTER TABLE public.pages 
ALTER COLUMN owner_name SET NOT NULL,
ALTER COLUMN owner_name SET DEFAULT '';

-- Success message
SELECT 'Owner name field added to pages table!' as message;
