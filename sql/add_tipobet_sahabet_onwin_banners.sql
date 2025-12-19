-- Tipobet, Sahabet ve Onwin banner'larını tüm aktif sayfalara ekleme scripti
-- Bu banner'lar GrandPasha butonunun hemen altına (ard arda) yerleştirilecek
-- Sıralama: GrandPasha'dan sonra Tipobet, Sahabet, Onwin

BEGIN;

-- Önce GrandPasha'dan sonraki tüm banner'ları 3 aşağı kaydır (yeni banner'lar hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 3,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true
AND pa.href NOT IN (
  'https://cutt.ly/JtaVyZ7y', -- Tipobet
  'https://cutt.ly/ktaV1HC6', -- Sahabet
  'https://cutt.ly/NtaVWH22'  -- Onwin
)
AND EXISTS (
  SELECT 1 FROM public.page_actions grandpasha
  WHERE grandpasha.page_id = pa.page_id
    AND grandpasha.href = 'https://shorttwelve.online/denizaksoy'
    AND grandpasha.is_enabled = true
    AND pa.sort_order > grandpasha.sort_order
);

-- Tipobet butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Tipobet Kampanyası',
    variant = 'outline',
    preset = 'tipobet-banner',
    image_url = '/images/tipobet_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/JtaVyZ7y';

-- Tipobet butonu - eksik olan sayfalara ekle (GrandPasha'dan sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Tipobet Kampanyası',
  'https://cutt.ly/JtaVyZ7y',
  'outline',
  'tipobet-banner',
  '/images/tipobet_site_tasarm.png',
  COALESCE((
    SELECT grandpasha.sort_order + 1
    FROM public.page_actions grandpasha
    WHERE grandpasha.page_id = p.id
      AND grandpasha.href = 'https://shorttwelve.online/denizaksoy'
      AND grandpasha.is_enabled = true
    LIMIT 1
  ), (SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id) + 1),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/JtaVyZ7y'
  );

-- Sahabet butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Sahabet Kampanyası',
    variant = 'outline',
    preset = 'sahabet-banner',
    image_url = '/images/sahabet_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/ktaV1HC6';

-- Sahabet butonu - eksik olan sayfalara ekle (Tipobet'ten sonra veya GrandPasha'dan 2 sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Sahabet Kampanyası',
  'https://cutt.ly/ktaV1HC6',
  'outline',
  'sahabet-banner',
  '/images/sahabet_site_tasarm.png',
  COALESCE((
    SELECT tipobet.sort_order + 1
    FROM public.page_actions tipobet
    WHERE tipobet.page_id = p.id
      AND tipobet.href = 'https://cutt.ly/JtaVyZ7y'
      AND tipobet.is_enabled = true
    LIMIT 1
  ), COALESCE((
    SELECT grandpasha.sort_order + 2
    FROM public.page_actions grandpasha
    WHERE grandpasha.page_id = p.id
      AND grandpasha.href = 'https://shorttwelve.online/denizaksoy'
      AND grandpasha.is_enabled = true
    LIMIT 1
  ), (SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id) + 1)),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/ktaV1HC6'
  );

-- Onwin butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Onwin Kampanyası',
    variant = 'outline',
    preset = 'onwin-banner',
    image_url = '/images/onwin_site_tasarm_png.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/NtaVWH22';

-- Onwin butonu - eksik olan sayfalara ekle (Sahabet'ten sonra veya GrandPasha'dan 3 sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Onwin Kampanyası',
  'https://cutt.ly/NtaVWH22',
  'outline',
  'onwin-banner',
  '/images/onwin_site_tasarm_png.png',
  COALESCE((
    SELECT sahabet.sort_order + 1
    FROM public.page_actions sahabet
    WHERE sahabet.page_id = p.id
      AND sahabet.href = 'https://cutt.ly/ktaV1HC6'
      AND sahabet.is_enabled = true
    LIMIT 1
  ), COALESCE((
    SELECT tipobet.sort_order + 1
    FROM public.page_actions tipobet
    WHERE tipobet.page_id = p.id
      AND tipobet.href = 'https://cutt.ly/JtaVyZ7y'
      AND tipobet.is_enabled = true
    LIMIT 1
  ), COALESCE((
    SELECT grandpasha.sort_order + 3
    FROM public.page_actions grandpasha
    WHERE grandpasha.page_id = p.id
      AND grandpasha.href = 'https://shorttwelve.online/denizaksoy'
      AND grandpasha.is_enabled = true
    LIMIT 1
  ), (SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id) + 1))),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/NtaVWH22'
  );

-- Şimdi sıralamayı düzelt: GrandPasha'dan sonra Tipobet, Sahabet, Onwin sırasıyla
-- Her sayfa için GrandPasha'nın sort_order'ını bul ve yeni banner'ları doğru sıraya yerleştir
WITH grandpasha_positions AS (
  SELECT 
    pa.page_id,
    pa.sort_order AS grandpasha_sort_order
  FROM public.page_actions pa
  WHERE pa.href = 'https://shorttwelve.online/denizaksoy'
    AND pa.is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = pa.page_id
        AND p.is_enabled = true
    )
)
UPDATE public.page_actions pa
SET sort_order = 
  CASE 
    WHEN pa.href = 'https://cutt.ly/JtaVyZ7y' THEN gp.grandpasha_sort_order + 1 -- Tipobet
    WHEN pa.href = 'https://cutt.ly/ktaV1HC6' THEN gp.grandpasha_sort_order + 2 -- Sahabet
    WHEN pa.href = 'https://cutt.ly/NtaVWH22' THEN gp.grandpasha_sort_order + 3 -- Onwin
    ELSE pa.sort_order
  END,
    updated_at = NOW()
FROM grandpasha_positions gp
WHERE pa.page_id = gp.page_id
  AND pa.is_enabled = true
  AND pa.href IN (
    'https://cutt.ly/JtaVyZ7y',
    'https://cutt.ly/ktaV1HC6',
    'https://cutt.ly/NtaVWH22'
  );

-- Sonuçları doğrula - GrandPasha ve yeni banner'ların sıralamasını göster
SELECT
  p.site_slug,
  pa.label,
  pa.preset,
  pa.href,
  pa.sort_order
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.is_enabled = true
  AND pa.is_enabled = true
  AND (
    pa.href = 'https://shorttwelve.online/denizaksoy' OR -- GrandPasha
    pa.href = 'https://cutt.ly/JtaVyZ7y' OR -- Tipobet
    pa.href = 'https://cutt.ly/ktaV1HC6' OR -- Sahabet
    pa.href = 'https://cutt.ly/NtaVWH22'    -- Onwin
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

