-- CarkBet ve BETVSLOT butonlarının preset stillerini güncelleme scripti
-- Bu script, mevcut butonların stillerini banner stilleri olarak günceller (yeni banner png'leri ile)

-- CarkBet butonlarının preset'ini carkbet-banner olarak güncelle
UPDATE public.page_actions
SET preset = 'carkbet-banner',
    updated_at = NOW()
WHERE href = 'https://t2m.io/CarkBet'
  AND preset != 'carkbet-banner';

-- BETVSLOT butonlarının preset'ini betvslot-banner olarak güncelle
UPDATE public.page_actions
SET preset = 'betvslot-banner',
    updated_at = NOW()
WHERE href = 'https://t2m.io/kOTWHrM'
  AND preset != 'betvslot-banner';

-- Görselleri de güncelle (yeni banner png'leri)
UPDATE public.page_actions
SET image_url = '/images/carkbetbanner.png',
    updated_at = NOW()
WHERE href = 'https://t2m.io/CarkBet'
  AND (image_url IS NULL OR image_url != '/images/carkbetbanner.png');

UPDATE public.page_actions
SET image_url = '/images/betvslotbanner.png',
    updated_at = NOW()
WHERE href = 'https://t2m.io/kOTWHrM'
  AND (image_url IS NULL OR image_url != '/images/betvslotbanner.png');

-- Sonuçları kontrol et
SELECT 
    p.site_slug,
    pa.label,
    pa.href,
    pa.preset,
    pa.image_url,
    pa.updated_at
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE pa.href IN ('https://t2m.io/CarkBet', 'https://t2m.io/kOTWHrM')
ORDER BY p.site_slug, pa.href;

