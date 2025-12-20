-- Cassinox banner'ını tüm aktif sayfalara ekleme scripti
-- Bu banner Onwin butonunun hemen altına yerleştirilecek

BEGIN;

-- Önce Onwin'den sonraki tüm banner'ları 1 aşağı kaydır (Cassinox hariç)
UPDATE public.page_actions pa
SET sort_order = pa.sort_order + 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true
AND pa.href != 'https://t2m.io/kirvehubcassnx'
AND EXISTS (
  SELECT 1 FROM public.page_actions onwin
  WHERE onwin.page_id = pa.page_id
    AND onwin.href = 'https://cutt.ly/NtaVWH22'
    AND onwin.is_enabled = true
    AND pa.sort_order > onwin.sort_order
);

-- Cassinox butonu - zaten varsa güncelle
UPDATE public.page_actions pa
SET label = 'Cassinox Kampanyası',
    variant = 'outline',
    preset = 'cassinox-banner',
    image_url = '/images/cassnox_site_tasarm.png',
    is_enabled = true,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t2m.io/kirvehubcassnx';

-- Cassinox butonu - eksik olan sayfalara ekle (Onwin'den sonra)
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Cassinox Kampanyası',
  'https://t2m.io/kirvehubcassnx',
  'outline',
  'cassinox-banner',
  '/images/cassnox_site_tasarm.png',
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
      AND pa.href = 'https://t2m.io/kirvehubcassnx'
  );

-- Şimdi sıralamayı düzelt: Onwin'den sonra Cassinox
-- Her sayfa için Onwin'in sort_order'ını bul ve Cassinox'u doğru sıraya yerleştir
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
  AND pa.href = 'https://t2m.io/kirvehubcassnx';

-- Sonuçları doğrula - Onwin ve Cassinox'un sıralamasını göster
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
    pa.href = 'https://t2m.io/kirvehubcassnx' -- Cassinox
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

