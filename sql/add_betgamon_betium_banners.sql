-- Betgamon ve Betium banner'larını tüm aktif sayfalara ekleme scripti
-- Bu banner'lar Onwin butonunun altına, 3. ve 4. sıralara yerleştirilecek (Onwin'den sonra 1. ve 2. pozisyonlar)

BEGIN;

-- Önce Onwin'den sonraki tüm banner'ları 2 aşağı kaydır (Betgamon ve Betium hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true
AND pa.href NOT IN ('https://gamonaff.com/?ref=kirvehub', 'https://bit.ly/4s4gSqy')
AND EXISTS (
  SELECT 1 FROM public.page_actions onwin
  WHERE onwin.page_id = pa.page_id
    AND onwin.href = 'https://cutt.ly/NtaVWH22'
    AND onwin.is_enabled = true
    AND pa.sort_order > onwin.sort_order
);

-- Betgamon butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Betgamon Kampanyası',
    variant = 'outline',
    preset = 'betgamon-banner',
    image_url = '/images/betgamon_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://gamonaff.com/?ref=kirvehub';

-- Betium butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Betium Kampanyası',
    variant = 'outline',
    preset = 'betium-banner',
    image_url = '/images/betium_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://bit.ly/4s4gSqy';

-- Betgamon butonu - eksik olan sayfalara ekle (Onwin'den sonra 1. pozisyon)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betgamon Kampanyası',
  'https://gamonaff.com/?ref=kirvehub',
  'outline',
  'betgamon-banner',
  '/images/betgamon_site_tasarm.png',
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
      AND pa.href = 'https://gamonaff.com/?ref=kirvehub'
  )
  AND EXISTS (
    SELECT 1
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
  );

-- Betium butonu - eksik olan sayfalara ekle (Onwin'den sonra 2. pozisyon, Betgamon'dan sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betium Kampanyası',
  'https://bit.ly/4s4gSqy',
  'outline',
  'betium-banner',
  '/images/betium_site_tasarm.png',
  COALESCE((
    SELECT betgamon.sort_order + 1
    FROM public.page_actions betgamon
    WHERE betgamon.page_id = p.id
      AND betgamon.href = 'https://gamonaff.com/?ref=kirvehub'
      AND betgamon.is_enabled = true
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
      AND pa.href = 'https://bit.ly/4s4gSqy'
  )
  AND EXISTS (
    SELECT 1
    FROM public.page_actions onwin
    WHERE onwin.page_id = p.id
      AND onwin.href = 'https://cutt.ly/NtaVWH22'
      AND onwin.is_enabled = true
  );

-- Şimdi sıralamayı düzelt: Onwin'den sonra Betgamon, sonra Betium
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
  AND pa.href = 'https://gamonaff.com/?ref=kirvehub';

-- Betium'u Betgamon'dan sonra yerleştir
WITH betgamon_positions AS (
  SELECT 
    pa.page_id,
    pa.sort_order AS betgamon_sort_order
  FROM public.page_actions pa
  WHERE pa.href = 'https://gamonaff.com/?ref=kirvehub'
    AND pa.is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = pa.page_id
        AND p.is_enabled = true
    )
)
UPDATE public.page_actions pa
SET sort_order = bp.betgamon_sort_order + 1,
    updated_at = NOW()
FROM betgamon_positions bp
WHERE pa.page_id = bp.page_id
  AND pa.is_enabled = true
  AND pa.href = 'https://bit.ly/4s4gSqy';

-- Sonuçları doğrula - Onwin, Betgamon ve Betium'un sıralamasını göster
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
    pa.href = 'https://gamonaff.com/?ref=kirvehub' OR -- Betgamon
    pa.href = 'https://bit.ly/4s4gSqy' -- Betium
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

