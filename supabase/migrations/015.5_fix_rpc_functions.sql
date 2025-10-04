-- Fix RPC functions to handle missing columns safely
-- This migration safely updates the RPC functions with only existing columns

-- Update get_page_by_slug function safely
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
          'description', a.description,
          'image_url', a.image_url,
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

-- Update get_page_by_domain function safely
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
          'description', a.description,
          'image_url', a.image_url,
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
