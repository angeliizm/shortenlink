-- Bahibom ve Palazzobet banner'larını 3. ve 4. sıraya çekme scripti
-- Bu script, mevcut banner'ları günceller ve diğer banner'ları kaydırır

BEGIN;

-- Önce 3. ve 4. sıradaki diğer banner'ları aşağı kaydır (Bahibom ve Palazzobet hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.sort_order IN (3, 4)
AND pa.is_enabled = true
AND pa.href NOT IN (
  'https://cutt.ly/denizaksoyxbahibom',
  'https://cutt.ly/pzdenizaksoy'
);

-- Bahibom - sort_order = 3
UPDATE public.page_actions pa
SET sort_order = 3,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
AND pa.is_enabled = true;

-- Palazzobet - sort_order = 4
UPDATE public.page_actions pa
SET sort_order = 4,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/pzdenizaksoy'
AND pa.is_enabled = true;

-- Sonuçları doğrula - Bahibom ve Palazzobet'in sıralamalarını göster
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
  AND pa.href IN (
    'https://cutt.ly/denizaksoyxbahibom',
    'https://cutt.ly/pzdenizaksoy'
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 50;

COMMIT;
