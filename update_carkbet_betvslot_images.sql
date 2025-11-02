-- CarkBet ve BETVSLOT butonlarına PNG görsellerini ekleme scripti

-- CarkBet butonlarının image_url'lerini güncelle
UPDATE public.page_actions
SET image_url = '/images/carkbet.png',
    updated_at = NOW()
WHERE preset = 'carkbet-banner'
  AND (image_url IS NULL OR image_url != '/images/carkbet.png');

-- BETVSLOT butonlarının image_url'lerini güncelle
UPDATE public.page_actions
SET image_url = '/images/betvslot.png',
    updated_at = NOW()
WHERE preset = 'betvslot-banner'
  AND (image_url IS NULL OR image_url != '/images/betvslot.png');

-- Sonuçları kontrol et
SELECT 
    p.site_slug,
    pa.label,
    pa.preset,
    pa.image_url,
    pa.updated_at
FROM public.pages p
INNER JOIN public.page_actions pa ON p.id = pa.page_id
WHERE pa.preset IN ('carkbet-banner', 'betvslot-banner')
ORDER BY p.site_slug, pa.preset;

