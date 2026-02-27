-- Yeni eklenen banner preset'lerini tüm aktif sayfalara ekleme scripti
-- Her banner için:
-- - preset: lib/button-presets.ts içindeki yeni banner id'si
-- - image_url: ilgili site tasarım görseli
-- - href: aşağıdaki listede verilen takip linkleri
-- Script idempotent olacak şekilde, her sayfaya her preset sadece 1 kez eklenir (preset bazlı kontrol).

BEGIN;

-- Arkın butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Arkın Kampanyası',
  'https://partner.arkincaffiliates.com/imp/arkincasino/3320',
  'outline',
  'arkin-banner',
  '/images/arkın site tasarım.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'arkin-banner'
  );

-- Bahibom tasarım butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Bahibom Kampanyası (Tasarım)',
  'https://cutt.ly/denizaksoyxbahibom',
  'outline',
  'bahibom-tasarim-banner',
  '/images/bahibom site tasarım (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'bahibom-tasarim-banner'
  );

-- Betplay tasarım butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betplay Kampanyası (Tasarım)',
  'https://t2m.io/kirvebetplay',
  'outline',
  'betplay-tasarim-banner',
  '/images/betplay site tasarım png (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'betplay-tasarim-banner'
  );

-- Dedebet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Dedebet Kampanyası',
  'https://cutt.ly/dededenizaksoy',
  'outline',
  'dedebet-banner',
  '/images/dedebet site tasarım (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'dedebet-banner'
  );

-- Egebet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Egebet Kampanyası',
  'https://t2m.io/egekirve',
  'outline',
  'egebet-banner',
  '/images/egebet site tasarımı.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'egebet-banner'
  );

-- Elit butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Elit Kampanyası',
  'https://dub.is/kirve',
  'outline',
  'elit-banner',
  '/images/elit site tasarım.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'elit-banner'
  );

-- GrandPasha tasarım butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'GrandPasha Kampanyası (Tasarım)',
  'https://shorttwelve.online/denizaksoy',
  'outline',
  'grandpasha-tasarim-banner',
  '/images/grandpasha site tasarım (3).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'grandpasha-tasarim-banner'
  );

-- Huqqabet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Huqqabet Kampanyası',
  'https://t2m.io/huqqakirve',
  'outline',
  'huqqabet-banner',
  '/images/huqqabet site tasarım.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'huqqabet-banner'
  );

-- Olimpos butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Olimpos Kampanyası',
  'https://olimpos.info/affiliates/?btag=2651055',
  'outline',
  'olimpos-banner',
  '/images/olimpos site tasarım.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'olimpos-banner'
  );

-- Pusulabet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Pusulabet Kampanyası',
  'https://t2m.io/pusulakirvehub',
  'outline',
  'pusulabet-banner',
  '/images/pusulabet site tasarım png.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'pusulabet-banner'
  );

-- Slotio butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Slotio Kampanyası',
  'https://dub.sh/slotiokirvehub',
  'outline',
  'slotio-banner',
  '/images/slotio site tasarım (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'slotio-banner'
  );

-- Tipobet tasarım butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Tipobet Kampanyası (Tasarım)',
  'https://cutt.ly/JtaVyZ7y',
  'outline',
  'tipobet-tasarim-banner',
  '/images/tipobet site tasarım.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'tipobet-tasarim-banner'
  );

-- Turbobahis butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Turbobahis Kampanyası',
  'https://turbokisalink.com/kirvehub',
  'outline',
  'turbobahis-banner',
  '/images/turbobahis site tasarım (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'turbobahis-banner'
  );

-- Stake butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Stake Kampanyası',
  'https://playstake.casino/landing?q=tr&c=kirve&offer=kirve',
  'outline',
  'stake-banner',
  '/images/stake site tasarım (2).png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.preset = 'stake-banner'
  );

-- Sonuçları doğrula - her yeni preset için kaç sitede olduğunu göster
SELECT 
  'Arkın' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'arkin-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Bahibom Tasarım' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'bahibom-tasarim-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Betplay Tasarım' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'betplay-tasarim-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Dedebet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'dedebet-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Egebet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'egebet-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Elit' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'elit-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'GrandPasha Tasarım' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'grandpasha-tasarim-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Huqqabet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'huqqabet-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Olimpos' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'olimpos-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Pusulabet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'pusulabet-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Slotio' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'slotio-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Tipobet Tasarım' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'tipobet-tasarim-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Turbobahis' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'turbobahis-banner'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Stake' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.preset = 'stake-banner'
WHERE p.is_enabled = true

ORDER BY banner_name;

COMMIT;

