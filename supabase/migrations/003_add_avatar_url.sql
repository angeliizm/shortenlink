-- Add avatar_url column to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add check constraint for avatar URL format (optional, basic validation)
ALTER TABLE public.pages 
ADD CONSTRAINT valid_avatar_url CHECK (
  avatar_url IS NULL OR 
  avatar_url = '' OR 
  avatar_url ~ '^https?://'
);