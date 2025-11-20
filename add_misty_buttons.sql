-- Misty banner butonunu tüm aktif sayfalara ekleme/güncelleme scripti
-- Bu script, butonu son sıraya ekler ve idempotent olacak şekilde tasarlanmıştır

BEGIN;

-- Hedef sayfaları belirle (buton eksik ya da yanlış sıradaysa)
CREATE TEMP TABLE pages_to_update ON COMMIT DROP AS
SELECT p.id
FROM public.pages p
WHERE p.is_enabled = true
  AND (
    NOT EXISTS (
      SELECT 1
      FROM public.page_actions pa
      WHERE pa.page_id = p.id
        AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
    )
  );

-- Misty butonu zaten varsa güncelle (tüm aktif sayfalarda)
UPDATE public.page_actions pa
SET label = 'Misty Casino Kampanyası',
    variant = 'outline',
    preset = 'misty-banner',
    image_url = '/images/mistybanner.png',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
  AND EXISTS (
    SELECT 1 FROM public.pages p
    WHERE p.id = pa.page_id
      AND p.is_enabled = true
  );

-- Misty butonunu ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  ptu.id,
  'Misty Casino Kampanyası',
  'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1',
  'outline',
  'misty-banner',
  '/images/mistybanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = ptu.id), 0) + 1,
  true
FROM pages_to_update ptu
WHERE NOT EXISTS (
  SELECT 1
  FROM public.page_actions pa
  WHERE pa.page_id = ptu.id
    AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
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
WHERE p.is_enabled = true
  AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
ORDER BY p.site_slug, pa.sort_order;

COMMIT;

