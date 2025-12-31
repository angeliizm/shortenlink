-- Hojabet banner'ını tüm aktif sayfalara ekleme scripti
-- Bu banner Hizlicasino'nun kaldırılmasından sonra ekleniyor

BEGIN;

-- Hojabet butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Hojabet Kampanyası',
    variant = 'outline',
    preset = 'hojabet-banner',
    image_url = '/images/hojabet_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://kslt.cc/kirve';

-- Hojabet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Hojabet Kampanyası',
  'https://kslt.cc/kirve',
  'outline',
  'hojabet-banner',
  '/images/hojabet_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://kslt.cc/kirve'
  );

-- Sonuçları doğrula
SELECT
  p.site_slug,
  pa.label,
  pa.preset,
  pa.href,
  pa.sort_order,
  pa.image_url
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.is_enabled = true
  AND pa.is_enabled = true
  AND pa.href = 'https://kslt.cc/kirve'
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

