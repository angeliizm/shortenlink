-- Dodobet ve Betçi banner'larını eksik olan tüm aktif sayfalara ekleme scripti
-- Her banner için ayrı ayrı kontrol edilir ve sadece eksik olan sayfalara eklenir

BEGIN;

-- Dodobet butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Dodobet Kampanyası',
  'https://cutt.ly/2r7JwG3d',
  'outline',
  'dodobet-banner',
  '/images/dodobetbanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/2r7JwG3d'
  );

-- Betçi butonu - eksik olan sayfalara ekle
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'BETCI Fırsatı',
  'https://betcilink2.com/affiliates/?btag=2564486',
  'outline',
  'betci-banner',
  '/images/betcibanner.png',
  COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1,
  true
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://betcilink2.com/affiliates/?btag=2564486'
  );

-- Sonuçları doğrula - her banner için kaç sayfaya eklendiğini göster
SELECT 
  'Dodobet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://cutt.ly/2r7JwG3d'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'BETCI' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM public.pages p
LEFT JOIN public.page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://betcilink2.com/affiliates/?btag=2564486'
WHERE p.is_enabled = true

ORDER BY banner_name;

COMMIT;

