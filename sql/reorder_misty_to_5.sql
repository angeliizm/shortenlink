-- Misty Casino banner'ını tüm aktif sayfalarda 5. sıraya çekme scripti

BEGIN;

-- Önce 5. sıradaki diğer banner'ları aşağı kaydır (Misty hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.sort_order = 5
AND pa.is_enabled = true
AND pa.href != 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1';

-- Misty Casino - sort_order = 5
UPDATE public.page_actions pa
SET sort_order = 5,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
AND pa.is_enabled = true;

-- Sonuçları doğrula - Misty'nin sıralamasını göster
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
  AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
ORDER BY p.site_slug, pa.sort_order
LIMIT 50;

COMMIT;

