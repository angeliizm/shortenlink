-- Tipobet banner'ı ekleme
-- Görsel: public/images/tipobet_site_tasarm.png
-- Referans link: https://t.me/c/3349925245/26855

BEGIN;

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Tipobet Kampanyası',
  'https://t.me/c/3349925245/26855',
  'outline',
  'tipobet-banner',
  '/images/tipobet_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://t.me/c/3349925245/26855'
  );

COMMIT;
