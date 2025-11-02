-- CarkBet ve BETVSLOT butonlarını tüm sayfalara ekleme scripti
-- Bu script, her sayfaya iki yeni buton ekler (sadece daha önce eklenmemişse)

-- CarkBet butonu için
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT 
    p.id AS page_id,
    '500 TL DENEME BONUSU BELGESİZ 10 MİLYON TL ÇEKİM' AS label,
    'https://t2m.io/CarkBet' AS href,
    'outline' AS variant,
    'carkbet-banner' AS preset,
    '/images/carkbet.png' AS image_url,
    COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
    true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa 
    WHERE pa.page_id = p.id 
    AND pa.preset = 'carkbet-banner'
  );

-- BETVSLOT butonu için
INSERT INTO public.page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT 
    p.id AS page_id,
    '200 DOLAR ANINDA HEDİYE! GLOBAL MARKANIZ.' AS label,
    'https://t2m.io/kOTWHrM' AS href,
    'outline' AS variant,
    'betvslot-banner' AS preset,
    '/images/betvslot.png' AS image_url,
    COALESCE((SELECT MAX(sort_order) FROM public.page_actions WHERE page_id = p.id), 0) + 1 AS sort_order,
    true AS is_enabled
FROM public.pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM public.page_actions pa 
    WHERE pa.page_id = p.id 
    AND pa.preset = 'betvslot-banner'
  );

-- Sonuçları kontrol et
SELECT 
    p.site_slug,
    pa.label,
    pa.preset,
    pa.sort_order
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE pa.preset IN ('carkbet-banner', 'betvslot-banner')
ORDER BY p.site_slug, pa.sort_order;

