-- Drop the URL validation constraint from pages table
ALTER TABLE public.pages 
DROP CONSTRAINT IF EXISTS valid_target_url;

-- Optional: Rename the column to better reflect its new purpose
-- ALTER TABLE public.pages RENAME COLUMN target_url TO content_text;

-- Update the column comment to reflect new usage
COMMENT ON COLUMN public.pages.target_url IS 'Content text or title to display on the page';