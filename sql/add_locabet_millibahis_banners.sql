-- Tüm sayfa banner'larını demo2 sayfasına ekleme scripti
-- Bu script, demo2 sayfasına mevcut tüm banner'ları ekler

BEGIN;

-- Tüm banner'ları demo2 sayfasına ekle
-- Her banner için önce mevcut olup olmadığını kontrol et, yoksa ekle

-- Betçi banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'BETCI Fırsatı',
  'https://betcilink2.com/affiliates/?btag=2564486',
  'outline',
  'betci-banner',
  '/images/betcibanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://betcilink2.com/affiliates/?btag=2564486'
  );

-- Not: Merso ve AMG banner'ları href constraint'i nedeniyle atlanmıştır (geçerli URL gereklidir)
-- Bu banner'ların URL'leri hazır olduğunda ayrıca eklenebilir

-- Misty banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
  );

-- GrandPasha banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://shorttwelve.online/denizaksoy'
  );

-- Dodobet banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Dodobet Kampanyası',
  'https://cutt.ly/2r7JwG3d',
  'outline',
  'dodobet-banner',
  '/images/dodobetbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/2r7JwG3d'
  );

-- HizliCasino banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://dub.is/hizli-kirve'
  );

-- Padisah banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://p.t2m.io/EfQMjRJ'
  );

-- BetPuan banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
  );

-- Pusula banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
  );

-- Tipobet banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/JtaVyZ7y'
  );

-- Sahabet banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/ktaV1HC6'
  );

-- Onwin banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Onwin Kampanyası',
  'https://cutt.ly/NtaVWH22',
  'outline',
  'onwin-banner',
  '/images/onwin_site_tasarm_png.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/NtaVWH22'
  );

-- Locabet banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Locabet Kampanyası',
  'https://t2m.io/kirvegiris',
  'outline',
  'locabet-banner',
  '/images/locabet_site_tasarm_png.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://t2m.io/kirvegiris'
  );

-- Millibahis banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Millibahis Kampanyası',
  'https://t2m.io/kirvemilli',
  'outline',
  'millibahis-banner',
  '/images/millibahis_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://t2m.io/kirvemilli'
  );

-- Betgamon banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betgamon Kampanyası',
  'https://gamonaff.com/?ref=kirvehub',
  'outline',
  'betgamon-banner',
  '/images/betgamon_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://gamonaff.com/?ref=kirvehub'
  );

-- Betium banner'ı ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betium Kampanyası',
  'https://bit.ly/4s4gSqy',
  'outline',
  'betium-banner',
  '/images/betium_site_tasarm.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://bit.ly/4s4gSqy'
  );

-- Bahibom banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
  );

-- Palazzobet banner'ı ekle
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
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id AND pa.href = 'https://cutt.ly/pzdenizaksoy'
  );

-- Sonuçları doğrula - demo2 sayfasındaki tüm banner'ları göster
SELECT
  p.site_slug,
  pa.label,
  pa.preset,
  pa.href,
  pa.sort_order
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.site_slug = 'demo2'
  AND p.is_enabled = true
  AND pa.is_enabled = true
ORDER BY pa.sort_order;

COMMIT;

