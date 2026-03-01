-- Onwin, Sahabet ve Tipobet banner'larını tüm aktif sayfalara ekleme
-- Onwin:   https://cutt.ly/ItsqXrNL
-- Sahabet: https://cutt.ly/ktaV1HC6
-- Tipobet: https://cutt.ly/JtaVyZ7y

BEGIN;

-- Onwin butonu - eksik olan tüm sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Onwin Kampanyası',
  'https://cutt.ly/ItsqXrNL',
  'outline',
  'onwin-banner',
  '/images/onwin_site_tasarm_png.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/ItsqXrNL'
  );

-- Sahabet butonu - eksik olan tüm sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Sahabet Kampanyası',
  'https://cutt.ly/ktaV1HC6',
  'outline',
  'sahabet-banner',
  '/images/sahabet_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/ktaV1HC6'
  );

-- Tipobet butonu - eksik olan tüm sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Tipobet Kampanyası',
  'https://cutt.ly/JtaVyZ7y',
  'outline',
  'tipobet-banner',
  '/images/tipobet_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/JtaVyZ7y'
  );

-- Doğrulama: her banner için kaç sayfada olduğunu göster
SELECT
  'Onwin' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id
  AND pa.href = 'https://cutt.ly/ItsqXrNL'
WHERE p.is_enabled = true

UNION ALL

SELECT
  'Sahabet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id
  AND pa.href = 'https://cutt.ly/ktaV1HC6'
WHERE p.is_enabled = true

UNION ALL

SELECT
  'Tipobet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id
  AND pa.href = 'https://cutt.ly/JtaVyZ7y'
WHERE p.is_enabled = true

ORDER BY banner_name;

COMMIT;
