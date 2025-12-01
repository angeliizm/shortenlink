-- Bahibom ve Palazzobet banner'larını tüm aktif sayfalara ekleme scripti
-- Diğer çalışan SQL dosyalarıyla aynı format kullanılmıştır

BEGIN;

-- Bahibom butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Bahibom Kampanyası',
  'https://cutt.ly/denizaksoyxbahibom',
  'outline',
  'bahibom-banner',
  '/images/bahibombanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
  );

-- Palazzobet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Palazzobet Avantajı',
  'https://cutt.ly/pzdenizaksoy',
  'outline',
  'palazzobet-banner',
  '/images/palazzobetbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/pzdenizaksoy'
  );

-- Sonuçları doğrula
SELECT 
  'Bahibom' AS banner_name,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.page_actions pa
WHERE pa.href = 'https://cutt.ly/denizaksoyxbahibom'

UNION ALL

SELECT 
  'Palazzobet' AS banner_name,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.page_actions pa
WHERE pa.href = 'https://cutt.ly/pzdenizaksoy'

ORDER BY banner_name;

COMMIT;