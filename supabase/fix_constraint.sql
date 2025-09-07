-- Quick fix: Drop the URL constraint immediately
-- Run this in Supabase SQL Editor to fix the issue

ALTER TABLE public.pages 
DROP CONSTRAINT IF EXISTS valid_target_url;

-- Verify the constraint was removed
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pages'
    AND nsp.nspname = 'public';