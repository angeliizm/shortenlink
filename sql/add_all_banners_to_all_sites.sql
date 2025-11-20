-- GrandPasha, HizliCasino, Padisah, BetPuan, Pusula ve Misty banner'larını 
-- eksik olan tüm aktif sayfalara ekleme scripti
-- Her banner için ayrı ayrı kontrol edilir ve sadece eksik olan sayfalara eklenir

BEGIN;

-- GrandPasha butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'GrandPasha Promosyonu',
  'https://shorttwelve.online/denizaksoy',
  'outline',
  'grandpasha-banner',
  '/images/grandpashabanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://shorttwelve.online/denizaksoy'
  );

-- HizliCasino butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'HizliCasino Avantajı',
  'https://dub.is/hizli-kirve',
  'outline',
  'hizlicasino-banner',
  '/images/hizlicasinobanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://dub.is/hizli-kirve'
  );

-- Padisah butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Padisah Kampanyası',
  'https://p.t2m.io/EfQMjRJ',
  'outline',
  'padisah-banner',
  '/images/padisahbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://p.t2m.io/EfQMjRJ'
  );

-- BetPuan butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'BetPuan Fırsatı',
  'https://www.betpuanpartner.com/links/?btag=2098924',
  'outline',
  'betpuan-banner',
  '/images/betpuanbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
  );

-- Pusula butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Pusula Avantajı',
  'https://t.ly/PusulaKumarlayasiyorum',
  'outline',
  'pusula-banner',
  '/images/pusulabanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
  );

-- Misty butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Misty Casino Kampanyası',
  'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1',
  'outline',
  'misty-banner',
  '/images/mistybanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
  );

-- Sonuçları doğrula - her banner için kaç sayfaya eklendiğini göster
SELECT 
  'GrandPasha' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://shorttwelve.online/denizaksoy'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'HizliCasino' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://dub.is/hizli-kirve'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Padisah' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://p.t2m.io/EfQMjRJ'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'BetPuan' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Pusula' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Misty' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
WHERE p.is_enabled = true

ORDER BY banner_name;

COMMIT;

