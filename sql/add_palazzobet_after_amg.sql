-- Palazzobet butonunu AMG'nin hemen altına ekleme
-- Referans link: https://cutt.ly/pzdenizaksoy

BEGIN;

-- Önce AMG'den sonraki tüm banner'ları 1 aşağı kaydır (Palazzobet hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
  AND pa.is_enabled = true
  AND pa.href != 'https://cutt.ly/pzdenizaksoy'
  AND EXISTS (
    SELECT 1 FROM public.page_actions amg
    WHERE amg.page_id = pa.page_id
      AND amg.preset = 'amg-banner'
      AND amg.is_enabled = true
      AND pa.sort_order > amg.sort_order
  );

-- Palazzobet butonu - zaten varsa güncelle (AMG'nin altına taşı)
UPDATE public.page_actions pa
SET label = 'Palazzobet Avantajı',
    variant = 'outline',
    preset = 'palazzobet-banner',
    image_url = '/images/palazzobetbanner.png',
    sort_order = amg_pos.amg_sort + 1,
    is_enabled = true,
    updated_at = NOW()
FROM (
  SELECT amg.page_id, amg.sort_order AS amg_sort
  FROM public.page_actions amg
  WHERE amg.preset = 'amg-banner'
    AND amg.is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = amg.page_id AND p.is_enabled = true
    )
) amg_pos
WHERE pa.page_id = amg_pos.page_id
  AND pa.href = 'https://cutt.ly/pzdenizaksoy';

-- Palazzobet butonu - eksik olan sayfalara ekle (AMG'nin hemen altına)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Palazzobet Avantajı',
  'https://cutt.ly/pzdenizaksoy',
  'outline',
  'palazzobet-banner',
  '/images/palazzobetbanner.png',
  COALESCE((
    SELECT amg.sort_order + 1
    FROM public.page_actions amg
    WHERE amg.page_id = p.id
      AND amg.preset = 'amg-banner'
      AND amg.is_enabled = true
    LIMIT 1
  ), (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM public.page_actions WHERE page_id = p.id)),
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND EXISTS (
    SELECT 1 FROM public.page_actions amg
    WHERE amg.page_id = p.id
      AND amg.preset = 'amg-banner'
      AND amg.is_enabled = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/pzdenizaksoy'
  );

-- Sonuçları doğrula - AMG ve Palazzobet sıralamasını göster
SELECT
  p.site_slug,
  pa.label,
  pa.preset,
  pa.sort_order
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE p.is_enabled = true
  AND pa.is_enabled = true
  AND (pa.preset = 'amg-banner' OR pa.href = 'https://cutt.ly/pzdenizaksoy')
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;
