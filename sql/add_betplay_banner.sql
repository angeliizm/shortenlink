-- Betplay banner'ını tüm aktif sayfalara ekleme ve 4. sıraya yerleştirme scripti
-- Betplay banner'ı eksik olan sayfalara eklenir ve 4. sıraya yerleştirilir
-- Mevcut 4. ve sonrasındaki banner'lar bir aşağı kaydırılır

BEGIN;

-- Önce 4. ve sonrasındaki banner'ları bir aşağı kaydır (Betplay hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.sort_order >= 4
AND pa.is_enabled = true
AND pa.href != 'https://t2m.io/kirvebetplay';

-- Betplay butonu - zaten varsa güncelle, yoksa ekle
UPDATE public.page_actions pa
SET label = 'Betplay Kampanyası',
    variant = 'outline',
    preset = 'betplay-banner',
    image_url = '/images/betplaybanner.png',
    sort_order = 4,
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t2m.io/kirvebetplay';

-- Betplay butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Betplay Kampanyası',
  'https://t2m.io/kirvebetplay',
  'outline',
  'betplay-banner',
  '/images/betplaybanner.png',
  4,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://t2m.io/kirvebetplay'
  );

-- Sonuçları doğrula - Betplay'in kaç sayfaya eklendiğini göster
SELECT 
  'Betplay' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://t2m.io/kirvebetplay'
WHERE p.is_enabled = true;

-- İlk 10 banner'ın sıralamasını göster
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

