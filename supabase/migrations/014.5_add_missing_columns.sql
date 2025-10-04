-- Add missing columns for logo and image support
-- This migration adds logo_url to pages table and image_url to page_actions table

-- Add logo_url column to pages table if it doesn't exist
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add image_url column to page_actions table if it doesn't exist
ALTER TABLE public.page_actions ADD COLUMN IF NOT EXISTS image_url TEXT;
