-- Padisah, BetPuan ve Pusula banner butonlarını tüm aktif sayfalara ekleme scripti
-- Her buton yalnızca eksik sayfalara eklenir; tekrar çalıştırmak güvenlidir.
-- Not: href alanlarını gerçek kampanya linklerinizle güncelleyin.

BEGIN;

-- Padisah butonu
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id AS page_id,
  'Padisah Kampanyası' AS label,
  'https://p.t2m.io/EfQMjRJ' AS href,
  'outline' AS variant,
  'padisah-banner' AS preset,
  '/images/padisahbanner.png' AS image_url,
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
  true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://p.t2m.io/EfQMjRJ'
  );

-- BetPuan butonu
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id AS page_id,
  'BetPuan Fırsatı' AS label,
  'https://www.betpuanpartner.com/links/?btag=2098924' AS href,
  'outline' AS variant,
  'betpuan-banner' AS preset,
  '/images/betpuanbanner.png' AS image_url,
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
  true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
  );

-- Pusula butonu
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id AS page_id,
  'Pusula Avantajı' AS label,
  'https://t.ly/PusulaKumarlayasiyorum' AS href,
  'outline' AS variant,
  'pusula-banner' AS preset,
  '/images/pusulabanner.png' AS image_url,
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
  true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
  );

-- Sonuç kontrolü
SELECT
  p.site_slug,
  pa.label,
  pa.href,
  pa.preset,
  pa.sort_order
FROM public.pages p
JOIN public.page_actions pa ON p.id = pa.page_id
WHERE pa.href IN (
  'https://p.t2m.io/EfQMjRJ',
  'https://www.betpuanpartner.com/links/?btag=2098924',
  'https://t.ly/PusulaKumarlayasiyorum'
)
ORDER BY p.site_slug, pa.sort_order;

COMMIT;

