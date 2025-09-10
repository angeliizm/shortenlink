-- Add avatar_url column to pages table
ALTER TABLE public.pages 
ADD COLUMN avatar_url TEXT;

-- Add constraint to validate URL format (optional)
ALTER TABLE public.pages 
ADD CONSTRAINT valid_avatar_url 
CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://');

-- Update the RPC functions to include avatar_url
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
    'avatar_url', p.avatar_url,
    'meta', p.meta,
    'is_enabled', p.is_enabled,
    'custom_domain', d.hostname,
    'actions', COALESCE(
      json_agg(
        json_build_object(
          'id', a.id,
          'label', a.label,
          'href', a.href,
          'variant', a.variant,
          'sortOrder', a.sort_order,
          'isEnabled', a.is_enabled
        ) ORDER BY a.sort_order
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO result
  FROM public.custom_domains d
  INNER JOIN public.pages p ON d.page_id = p.id
  LEFT JOIN public.page_actions a ON p.id = a.page_id AND a.is_enabled = true
  WHERE d.hostname = get_page_by_domain.hostname
    AND d.status = 'verified'
    AND p.is_enabled = true
  GROUP BY p.id, d.hostname;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_page(
  p_id UUID DEFAULT NULL,
  p_site_slug TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_brand_color TEXT DEFAULT NULL,
  p_accent_color TEXT DEFAULT NULL,
  p_target_url TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT NULL,
  p_is_enabled BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_id UUID;
BEGIN
  IF p_id IS NULL THEN
    -- Insert new page
    INSERT INTO public.pages (
      site_slug, title, brand_color, accent_color, 
      target_url, avatar_url, meta, is_enabled, owner_id
    )
    VALUES (
      p_site_slug, p_title, p_brand_color, p_accent_color,
      p_target_url, p_avatar_url, COALESCE(p_meta, '{}'::jsonb), COALESCE(p_is_enabled, true), auth.uid()
    )
    RETURNING id INTO page_id;
  ELSE
    -- Update existing page (only if owner)
    UPDATE public.pages
    SET
      site_slug = COALESCE(p_site_slug, site_slug),
      title = COALESCE(p_title, title),
      brand_color = COALESCE(p_brand_color, brand_color),
      accent_color = COALESCE(p_accent_color, accent_color),
      target_url = COALESCE(p_target_url, target_url),
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      meta = COALESCE(p_meta, meta),
      is_enabled = COALESCE(p_is_enabled, is_enabled),
      updated_at = NOW()
    WHERE id = p_id AND owner_id = auth.uid()
    RETURNING id INTO page_id;
  END IF;
  
  RETURN page_id;
END;
$$;

-- Update the view to include avatar_url
CREATE OR REPLACE VIEW public.pages_with_actions AS
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
rirsen