-- Add preset column to page_actions table
ALTER TABLE public.page_actions 
ADD COLUMN preset TEXT DEFAULT 'outline-gray';

-- Drop the page_action_styles table as we're using presets now
DROP TABLE IF EXISTS public.page_action_styles CASCADE;

-- Update the RPC functions to include preset
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
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'custom_domain', cd.domain,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'preset', a.preset,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.custom_domains cd
  JOIN public.pages p ON cd.page_id = p.id
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  WHERE cd.domain = get_page_by_domain.hostname
    AND cd.is_verified = true
    AND p.is_enabled = true
  GROUP BY p.id, cd.domain;
  
  RETURN result;
END;
$$;