-- Add image_url field to actions in RPC functions
-- This migration adds image_url field to action buttons in get_page_by_slug and get_page_by_domain functions

-- Update get_page_by_slug function to include image_url
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
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled,
          'image_url', a.image_url,
          'styles', CASE 
            WHEN s.action_id IS NOT NULL THEN
              json_build_object(
                'bg_color', s.bg_color,
                'text_color', s.text_color,
                'border_color', s.border_color,
                'hover_bg_color', s.hover_bg_color,
                'hover_text_color', s.hover_text_color
              )
            ELSE NULL
          END
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.pages p
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  LEFT JOIN public.page_action_styles s ON a.id = s.action_id
  WHERE p.site_slug = get_page_by_slug.site_slug
    AND p.is_enabled = true
  GROUP BY p.id;
  
  RETURN result;
END;
$$;

-- Update get_page_by_domain function to include image_url
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
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled,
          'image_url', a.image_url,
          'styles', CASE 
            WHEN s.action_id IS NOT NULL THEN
              json_build_object(
                'bg_color', s.bg_color,
                'text_color', s.text_color,
                'border_color', s.border_color,
                'hover_bg_color', s.hover_bg_color,
                'hover_text_color', s.hover_text_color
              )
            ELSE NULL
          END
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.custom_domains cd
  JOIN public.pages p ON cd.page_id = p.id
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  LEFT JOIN public.page_action_styles s ON a.id = s.action_id
  WHERE cd.domain = get_page_by_domain.hostname
    AND cd.is_verified = true
    AND p.is_enabled = true
  GROUP BY p.id, cd.domain;
  
  RETURN result;
END;
$$;
