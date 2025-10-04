-- Update pages_with_actions view to include image_url
-- This migration updates the view to include image_url field for action buttons

-- Drop and recreate the pages_with_actions view to include image_url
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
  p.logo_url,
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
        'image_url', a.image_url,
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
