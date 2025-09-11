-- Fix site_permissions table constraints
-- Add unique constraint for user_id, site_slug, permission_type combination

-- First, remove any duplicate entries (keep only one record per combination)
DELETE FROM public.site_permissions 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY user_id, site_slug, permission_type ORDER BY id) as rn
        FROM public.site_permissions
    ) t WHERE rn > 1
);

-- Add unique constraint
ALTER TABLE public.site_permissions 
ADD CONSTRAINT unique_user_site_permission 
UNIQUE (user_id, site_slug, permission_type);

-- Update the upsert operations to use the correct onConflict
-- This will allow proper upsert operations in the API
