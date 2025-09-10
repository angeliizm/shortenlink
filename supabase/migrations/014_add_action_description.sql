-- Add description field to page_actions table
-- This migration adds a description field to action buttons

-- Add description column to page_actions table
ALTER TABLE public.page_actions 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Drop and recreate the pages_with_actions view to include description
DROP VIEW IF EXISTS public.pages_with_actions;

CREATE VIEW public.pages_with_actions AS
SELECT 
  p.id,
  p.site_slug,
  p.title,
  p.brand_color,
  p.accent_color,
  p.target_url,
  p.avatar_url,
  p.meta,
  p.is_enabled,
  p.created_at,
  p.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', a.id,
        'label', a.label,
        'href', a.href,
        'variant', a.variant,
        'preset', a.preset,
        'description', a.description,
        'sortOrder', a.sort_order,
        'isEnabled', a.is_enabled
      ) ORDER BY a.sort_order
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::json
  ) AS actions
FROM public.pages p
LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
WHERE p.is_enabled = true
GROUP BY p.id;

-- Drop all existing upsert_action function variants first
DROP FUNCTION IF EXISTS public.upsert_action(UUID, UUID, TEXT, TEXT, action_variant, TEXT, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS public.upsert_action(UUID, UUID, TEXT, TEXT, action_variant, INTEGER, BOOLEAN);

-- Create the updated upsert_action function to handle description
CREATE FUNCTION public.upsert_action(
  p_id UUID DEFAULT NULL,
  p_page_id UUID DEFAULT NULL,
  p_label TEXT DEFAULT NULL,
  p_href TEXT DEFAULT NULL,
  p_variant action_variant DEFAULT NULL,
  p_preset TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_sort_order INTEGER DEFAULT NULL,
  p_is_enabled BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
  page_owner UUID;
BEGIN
  -- Check ownership
  SELECT owner_id INTO page_owner
  FROM public.pages
  WHERE id = p_page_id;
  
  IF page_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  IF p_id IS NULL THEN
    -- Insert new action
    INSERT INTO public.page_actions (
      page_id, label, href, variant, preset, description, sort_order, is_enabled
    )
    VALUES (
      p_page_id, p_label, p_href, 
      COALESCE(p_variant, 'outline'::action_variant),
      COALESCE(p_preset, 'outline-gray'),
      p_description,
      COALESCE(p_sort_order, 0),
      COALESCE(p_is_enabled, true)
    )
    RETURNING id INTO action_id;
  ELSE
    -- Update existing action
    UPDATE public.page_actions
    SET
      label = COALESCE(p_label, label),
      href = COALESCE(p_href, href),
      variant = COALESCE(p_variant, variant),
      preset = COALESCE(p_preset, preset),
      description = COALESCE(p_description, description),
      sort_order = COALESCE(p_sort_order, sort_order),
      is_enabled = COALESCE(p_is_enabled, is_enabled),
      updated_at = NOW()
    WHERE id = p_id AND page_id = p_page_id
    RETURNING id INTO action_id;
  END IF;
  
  RETURN action_id;
END;
$$;

-- Update the get_page_by_slug function to include description
CREATE OR REPLACE FUNCTION public.get_page_by_slug(site_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'site_slug', p.site_slug,
    'title', p.title,
    'brand_color', p.brand_color,
    'accent_color', p.accent_color,
    'target_url', p.target_url,
    'avatar_url', p.avatar_url,
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'preset', a.preset,
          'description', a.description,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.pages p
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  WHERE p.site_slug = get_page_by_slug.site_slug
    AND p.is_enabled = true
  GROUP BY p.id;
  
  RETURN result;
END;
$$;

-- Update the get_page_by_domain function to include description
CREATE OR REPLACE FUNCTION public.get_page_by_domain(hostname TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'site_slug', p.site_slug,
    'title', p.title,
    'brand_color', p.brand_color,
    'accent_color', p.accent_color,
    'target_url', p.target_url,
    'avatar_url', p.avatar_url,
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'preset', a.preset,
          'description', a.description,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.pages p
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  LEFT JOIN public.custom_domains cd ON p.id = cd.page_id
  WHERE cd.domain = get_page_by_domain.hostname
    AND cd.status = 'verified'
    AND p.is_enabled = true
  GROUP BY p.id;
  
  RETURN result;
END;
$$;

-- Grant execute permissions on the updated functions
GRANT EXECUTE ON FUNCTION public.upsert_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_page_by_slug TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_page_by_domain TO anon, authenticated;