-- GrandPasha ve HizliCasino banner butonlarını tüm aktif sayfalara ekleme/güncelleme scripti
-- Bu script, butonları 3. ve 4. sıraya sabitler ve idempotent olacak şekilde tasarlanmıştır

BEGIN;

-- Hedef sayfaları belirle (butonlar eksik ya da yanlış sıradaysa)
CREATE TEMP TABLE pages_to_update ON COMMIT DROP AS
SELECT p.id
FROM public.pages p
WHERE p.is_enabled = true
  AND (
    NOT EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://shorttwelve.online/denizaksoy'
    )
    OR NOT EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://dub.is/hizli-kirve'
    )
    OR EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://shorttwelve.online/denizaksoy'
        AND pa.sort_order <> 3
    )
    OR EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://dub.is/hizli-kirve'
        AND pa.sort_order <> 4
    )
  );

-- 3. sıradan itibaren mevcut butonları aşağı kaydır (hedef linkler hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.sort_order >= 3
  AND pa.href NOT IN ('https://shorttwelve.online/denizaksoy', 'https://dub.is/hizli-kirve');

-- GrandPasha butonu zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'GrandPasha Promosyonu',
    variant = 'outline',
    preset = 'grandpasha-banner',
    image_url = '/images/grandpashabanner.png',
    sort_order = 3,
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.href = 'https://shorttwelve.online/denizaksoy';

-- GrandPasha butonunu ekle/güncelle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  ptu.id,
  'GrandPasha Promosyonu',
  'https://shorttwelve.online/denizaksoy',
  'outline',
  'grandpasha-banner',
  '/images/grandpashabanner.png',
  3,
  true
FROM pages_to_update ptu
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = ptu.id
    AND pa.href = 'https://shorttwelve.online/denizaksoy'
);

-- HizliCasino butonu zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'HizliCasino Avantajı',
    variant = 'outline',
    preset = 'hizlicasino-banner',
    image_url = '/images/hizlicasinobanner.png',
    sort_order = 4,
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.href = 'https://dub.is/hizli-kirve';

-- HizliCasino butonunu ekle/güncelle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  ptu.id,
  'HizliCasino Avantajı',
  'https://dub.is/hizli-kirve',
  'outline',
  'hizlicasino-banner',
  '/images/hizlicasinobanner.png',
  4,
  true
FROM pages_to_update ptu
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = ptu.id
    AND pa.href = 'https://dub.is/hizli-kirve'
);

-- Sonuçları doğrula
SELECT 
  p.site_slug,
  pa.label,
  pa.href,
  pa.preset,
  pa.sort_order,
  pa.image_url
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.id IN (SELECT id FROM pages_to_update)
  AND pa.sort_order BETWEEN 3 AND 4
ORDER BY p.site_slug, pa.sort_order;

COMMIT;

