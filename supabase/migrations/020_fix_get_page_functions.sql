-- Fix get_page_by_slug and get_page_by_domain functions to include missing fields
-- This migration adds profile_preset_id, title_font_preset_id, and title_color to the RPC functions

-- Update the get_page_by_slug function to include missing fields
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
    'profile_preset_id', p.profile_preset_id,
    'title_font_preset_id', p.title_font_preset_id,
    'title_color', p.title_color,
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

-- Update the get_page_by_domain function to include missing fields
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
    'profile_preset_id', p.profile_preset_id,
    'title_font_preset_id', p.title_font_preset_id,
    'title_color', p.title_color,
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
  WHERE p.custom_domain = get_page_by_domain.hostname
    AND p.is_enabled = true
  GROUP BY p.id;
  
  RETURN result;
END;
$$;

-- Grant execute permissions on the updated functions
GRANT EXECUTE ON FUNCTION public.get_page_by_slug TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_page_by_domain TO anon, authenticated;
