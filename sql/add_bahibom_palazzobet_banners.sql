-- Bahibom ve Palazzobet banner butonlarını tüm aktif sayfalara ekleme/güncelleme scripti
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
        AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
    )
    OR NOT EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://cutt.ly/pzdenizaksoy'
    )
    OR EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
        AND pa.sort_order <> 3
    )
    OR EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://cutt.ly/pzdenizaksoy'
        AND pa.sort_order <> 4
    )
  );

-- 3. sıradan itibaren mevcut butonları aşağı kaydır (hedef linkler hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.sort_order >= 3
  AND pa.href NOT IN ('https://cutt.ly/denizaksoyxbahibom', 'https://cutt.ly/pzdenizaksoy');

-- Bahibom butonu zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Bahibom Kampanyası',
    variant = 'outline',
    preset = 'bahibom-banner',
    image_url = '/images/bahibombanner.png',
    sort_order = 3,
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.href = 'https://cutt.ly/denizaksoyxbahibom';

-- Bahibom butonunu ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  ptu.id,
  'Bahibom Kampanyası',
  'https://cutt.ly/denizaksoyxbahibom',
  'outline',
  'bahibom-banner',
  '/images/bahibombanner.png',
  3,
  true
FROM pages_to_update ptu
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = ptu.id
    AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
);

-- Palazzobet butonu zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Palazzobet Avantajı',
    variant = 'outline',
    preset = 'palazzobet-banner',
    image_url = '/images/palazzobetbanner.png',
    sort_order = 4,
    is_enabled = true,
    updated_at = NOW()
WHERE pa.page_id IN (SELECT id FROM pages_to_update)
  AND pa.href = 'https://cutt.ly/pzdenizaksoy';

-- Palazzobet butonunu ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  ptu.id,
  'Palazzobet Avantajı',
  'https://cutt.ly/pzdenizaksoy',
  'outline',
  'palazzobet-banner',
  '/images/palazzobetbanner.png',
  4,
  true
FROM pages_to_update ptu
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = ptu.id
    AND pa.href = 'https://cutt.ly/pzdenizaksoy'
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

