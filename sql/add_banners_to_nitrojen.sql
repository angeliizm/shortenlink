-- Nitrojen sahibi sayfaya GrandPasha, HizliCasino, Padisah, BetPuan ve Pusula banner'larını ekleme scripti
-- Bu script, butonları sırayla ekler ve idempotent olacak şekilde tasarlanmıştır

BEGIN;

-- Nitrojen sahibi sayfayı bul
CREATE TEMP TABLE nitrojen_page ON COMMIT DROP AS
SELECT p.id, p.site_slug, p.owner_name
FROM public.pages p
WHERE LOWER(p.owner_name) LIKE '%nitrojen%'
   OR LOWER(p.site_slug) LIKE '%nitrojen%'
   OR LOWER(p.title) LIKE '%nitrojen%'
LIMIT 1;

-- Nitrojen sayfası bulunamadıysa uyarı ver
DO $$
DECLARE
  page_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO page_count FROM nitrojen_page;
  IF page_count = 0 THEN
    RAISE NOTICE 'Nitrojen sahibi sayfa bulunamadı! Lütfen owner_name, site_slug veya title alanlarını kontrol edin.';
  END IF;
END $$;

-- GrandPasha butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'GrandPasha Promosyonu',
    variant = 'outline',
    preset = 'grandpasha-banner',
    image_url = '/images/grandpashabanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM nitrojen_page)
  AND pa.href = 'https://shorttwelve.online/denizaksoy';

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  np.id,
  'GrandPasha Promosyonu',
  'https://shorttwelve.online/denizaksoy',
  'outline',
  'grandpasha-banner',
  '/images/grandpashabanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = np.id), 0) + 1,
  true
FROM nitrojen_page np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = np.id
    AND pa.href = 'https://shorttwelve.online/denizaksoy'
);

-- HizliCasino butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'HizliCasino Avantajı',
    variant = 'outline',
    preset = 'hizlicasino-banner',
    image_url = '/images/hizlicasinobanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM nitrojen_page)
  AND pa.href = 'https://dub.is/hizli-kirve';

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  np.id,
  'HizliCasino Avantajı',
  'https://dub.is/hizli-kirve',
  'outline',
  'hizlicasino-banner',
  '/images/hizlicasinobanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = np.id), 0) + 1,
  true
FROM nitrojen_page np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = np.id
    AND pa.href = 'https://dub.is/hizli-kirve'
);

-- Padisah butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'Padisah Kampanyası',
    variant = 'outline',
    preset = 'padisah-banner',
    image_url = '/images/padisahbanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM nitrojen_page)
  AND pa.href = 'https://p.t2m.io/EfQMjRJ';

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  np.id,
  'Padisah Kampanyası',
  'https://p.t2m.io/EfQMjRJ',
  'outline',
  'padisah-banner',
  '/images/padisahbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = np.id), 0) + 1,
  true
FROM nitrojen_page np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = np.id
    AND pa.href = 'https://p.t2m.io/EfQMjRJ'
);

-- BetPuan butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'BetPuan Fırsatı',
    variant = 'outline',
    preset = 'betpuan-banner',
    image_url = '/images/betpuanbanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM nitrojen_page)
  AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924';

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  np.id,
  'BetPuan Fırsatı',
  'https://www.betpuanpartner.com/links/?btag=2098924',
  'outline',
  'betpuan-banner',
  '/images/betpuanbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = np.id), 0) + 1,
  true
FROM nitrojen_page np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = np.id
    AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
);

-- Pusula butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'Pusula Avantajı',
    variant = 'outline',
    preset = 'pusula-banner',
    image_url = '/images/pusulabanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM nitrojen_page)
  AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum';

INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  np.id,
  'Pusula Avantajı',
  'https://t.ly/PusulaKumarlayasiyorum',
  'outline',
  'pusula-banner',
  '/images/pusulabanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = np.id), 0) + 1,
  true
FROM nitrojen_page np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = np.id
    AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
);

-- Sonuçları doğrula
SELECT 
  p.site_slug,
  p.owner_name,
  pa.label,
  pa.href,
  pa.preset,
  pa.sort_order,
  pa.image_url
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.id IN (SELECT id FROM nitrojen_page)
  AND pa.href IN (
    'https://shorttwelve.online/denizaksoy',
    'https://dub.is/hizli-kirve',
    'https://p.t2m.io/EfQMjRJ',
    'https://www.betpuanpartner.com/links/?btag=2098924',
    'https://t.ly/PusulaKumarlayasiyorum'
  )
ORDER BY p.site_slug, pa.sort_order;

COMMIT;

