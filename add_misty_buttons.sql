-- Misty banner butonunu tüm aktif sayfalara ekleme scripti
-- Her buton yalnızca eksik sayfalara eklenir; tekrar çalıştırmak güvenlidir.

BEGIN;

-- Misty butonu
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id AS page_id,
  'Misty Casino Kampanyası' AS label,
  'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1' AS href,
  'outline' AS variant,
  'misty-banner' AS preset,
  '/images/mistybanner.png' AS image_url,
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
  true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
  );

-- Sonuç kontrolü
SELECT
  p.site_slug,
  pa.label,
  pa.href,
  pa.preset,
  pa.sort_order
FROM public.pages p
JOIN public.page_actions pa ON p.id = pa.page_id
WHERE pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
ORDER BY p.site_slug, pa.sort_order;

COMMIT;

