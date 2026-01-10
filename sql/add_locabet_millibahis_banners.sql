-- Locabet ve Millibahis banner'larını tüm aktif sayfalara ekleme scripti
-- Bu banner'lar Onwin butonunun altına, 3. ve 4. sıralara yerleştirilecek (Onwin'den sonra 1. ve 2. pozisyonlar)
-- Sıralama: Onwin -> Locabet (3. sıra) -> Millibahis (4. sıra)

BEGIN;

-- Önce Onwin'den sonraki tüm banner'ları 2 aşağı kaydır (Locabet ve Millibahis hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true
AND pa.href NOT IN ('https://t2m.io/kirvegiris', 'https://t2m.io/kirvemilli')
AND EXISTS (
  SELECT 1 FROM public.page_actions onwin
  WHERE onwin.page_id = pa.page_id
    AND onwin.href = 'https://cutt.ly/NtaVWH22'
    AND onwin.is_enabled = true
    AND pa.sort_order > onwin.sort_order
);

-- Locabet butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Locabet Kampanyası',
    variant = 'outline',
    preset = 'locabet-banner',
    image_url = '/images/locabet_site_tasarm_png.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t2m.io/kirvegiris';

-- Millibahis butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Millibahis Kampanyası',
    variant = 'outline',
    preset = 'millibahis-banner',
    image_url = '/images/millibahis_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t2m.io/kirvemilli';

-- Locabet butonu - eksik olan sayfalara ekle (Onwin'den sonra 1. pozisyon, 3. sıra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Locabet Kampanyası',
  'https://t2m.io/kirvegiris',
  'outline',
  'locabet-banner',
  '/images/locabet_site_tasarm_png.png',
  COALESCE((
    SELECT onwin.sort_order + 1
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
    LIMIT 1
  ), (SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id) + 1),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://t2m.io/kirvegiris'
  )
  AND EXISTS (
    SELECT 1
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
  );

-- Millibahis butonu - eksik olan sayfalara ekle (Onwin'den sonra 2. pozisyon, 4. sıra, Locabet'ten sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Millibahis Kampanyası',
  'https://t2m.io/kirvemilli',
  'outline',
  'millibahis-banner',
  '/images/millibahis_site_tasarm.png',
  COALESCE((
    SELECT locabet.sort_order + 1
    FROM public.page_actions locabet
    WHERE locabet.page_id = p.id
      AND locabet.href = 'https://t2m.io/kirvegiris'
      AND locabet.is_enabled = true
    LIMIT 1
  ), (
    SELECT onwin.sort_order + 2
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
    LIMIT 1
  ), (SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id) + 1),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://t2m.io/kirvemilli'
  )
  AND EXISTS (
    SELECT 1
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
  );

-- Şimdi sıralamayı düzelt: Onwin'den sonra Locabet (3. sıra), sonra Millibahis (4. sıra)
WITH onwin_positions AS (
  SELECT 
    pa.page_id,
    pa.sort_order AS onwin_sort_order
  FROM public.page_actions pa
  WHERE pa.href = 'https://cutt.ly/NtaVWH22'
    AND pa.is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = pa.page_id
        AND p.is_enabled = true
    )
)
UPDATE public.page_actions pa
SET sort_order = op.onwin_sort_order + 1,
    updated_at = NOW()
FROM onwin_positions op
WHERE pa.page_id = op.page_id
  AND pa.is_enabled = true
  AND pa.href = 'https://t2m.io/kirvegiris';

-- Millibahis'i Locabet'ten sonra yerleştir (4. sıra)
WITH locabet_positions AS (
  SELECT 
    pa.page_id,
    pa.sort_order AS locabet_sort_order
  FROM public.page_actions pa
  WHERE pa.href = 'https://t2m.io/kirvegiris'
    AND pa.is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = pa.page_id
        AND p.is_enabled = true
    )
)
UPDATE public.page_actions pa
SET sort_order = lp.locabet_sort_order + 1,
    updated_at = NOW()
FROM locabet_positions lp
WHERE pa.page_id = lp.page_id
  AND pa.is_enabled = true
  AND pa.href = 'https://t2m.io/kirvemilli';

-- Sonuçları doğrula - Onwin, Locabet ve Millibahis'in sıralamasını göster
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
    pa.href = 'https://cutt.ly/NtaVWH22' OR -- Onwin
    pa.href = 'https://t2m.io/kirvegiris' OR -- Locabet
    pa.href = 'https://t2m.io/kirvemilli' -- Millibahis
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

