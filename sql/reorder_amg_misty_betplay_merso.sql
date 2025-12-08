-- Tüm aktif sayfalardaki banner sıralamasını güncelleme scripti
-- Sıralama: 1.AMG, 2.Misty, 3.Betplay, 4.Merso
-- Diğer banner'lar 4'ten sonra aynı sırada kalacak

BEGIN;

-- Önce 1-4 arasındaki diğer banner'ları geçici olarak yüksek bir değere taşı
-- Bu, çakışmaları önlemek için
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 1000,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.sort_order BETWEEN 1 AND 4
AND pa.is_enabled = true
AND NOT (
  pa.preset = 'amg-banner' OR
  pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1' OR
  pa.preset = 'merso-banner' OR
  pa.href = 'https://t2m.io/kirvebetplay'
);

-- AMG - sort_order = 1
UPDATE public.page_actions pa
SET sort_order = 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.preset = 'amg-banner'
AND pa.is_enabled = true;

-- Misty Casino - sort_order = 2
UPDATE public.page_actions pa
SET sort_order = 2,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
AND pa.is_enabled = true;

-- Betplay - sort_order = 3
UPDATE public.page_actions pa
SET sort_order = 3,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t2m.io/kirvebetplay'
AND pa.is_enabled = true;

-- Merso - sort_order = 4
UPDATE public.page_actions pa
SET sort_order = 4,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.preset = 'merso-banner'
AND pa.is_enabled = true;

-- Geçici olarak yüksek değere taşınan banner'ları tekrar sırala (5'ten başlayarak)
-- Her sayfa için, 5'ten başlayarak sort_order'ı güncelle
WITH ranked_actions AS (
  SELECT 
    pa.id,
    pa.page_id,
    ROW_NUMBER() OVER (PARTITION BY pa.page_id ORDER BY 
      CASE 
        WHEN pa.sort_order >= 1000 THEN pa.sort_order - 1000
        ELSE pa.sort_order
      END
    ) + 4 AS new_sort_order
  FROM public.page_actions pa
  WHERE EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = pa.page_id
      AND p.is_enabled = true
  )
  AND pa.is_enabled = true
  AND pa.sort_order >= 1000
)
UPDATE public.page_actions pa
SET sort_order = ra.new_sort_order,
    updated_at = NOW()
FROM ranked_actions ra
WHERE pa.id = ra.id;

-- Sonuçları doğrula
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
  AND pa.sort_order <= 10
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

