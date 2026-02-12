-- Spinco ve Anubis banner'larını tüm aktif sayfalara ekleme
-- Görseller: spinco_site_tasarm.png, anubis_site_tasarm.png
-- Anubis: https://cutt.ly/DenizaksoyxAnubis
-- Spinco: https://cutt.ly/dnzaksoyspc

BEGIN;

-- Spinco butonu - eksik olan tüm sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Spinco Kampanyası',
  'https://cutt.ly/dnzaksoyspc',
  'outline',
  'spinco-banner',
  '/images/spinco_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/dnzaksoyspc'
  );

-- Anubis butonu - eksik olan tüm sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Anubis Kampanyası',
  'https://cutt.ly/DenizaksoyxAnubis',
  'outline',
  'anubis-banner',
  '/images/anubis_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/DenizaksoyxAnubis'
  );

-- Doğrulama: her banner için kaç sayfada olduğunu göster
SELECT
  'Spinco' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id
  AND pa.href = 'https://cutt.ly/dnzaksoyspc'
WHERE p.is_enabled = true

UNION ALL

SELECT
  'Anubis' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id
  AND pa.href = 'https://cutt.ly/DenizaksoyxAnubis'
WHERE p.is_enabled = true

ORDER BY banner_name;

COMMIT;
