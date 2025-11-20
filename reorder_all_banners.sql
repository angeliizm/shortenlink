-- Tüm aktif sayfalardaki banner sıralamasını güncelleme scripti
-- Sıralama: 1.Merso, 2.AMG, 3.Misty, 4.GrandPasha, 5.Dodobet, 6.Betçi, 7.HizliCasino, 8.Padisah, 9.BetPuan, 10.Pusula

BEGIN;

-- Önce tüm banner'ları belirtilen sıraya göre güncelle
-- Merso - sort_order = 1
UPDATE public.page_actions pa
SET sort_order = 1,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.preset = 'merso-banner'
AND pa.is_enabled = true;

-- AMG - sort_order = 2
UPDATE public.page_actions pa
SET sort_order = 2,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.preset = 'amg-banner'
AND pa.is_enabled = true;

-- Misty Casino - sort_order = 3
UPDATE public.page_actions pa
SET sort_order = 3,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1'
AND pa.is_enabled = true;

-- GrandPasha - sort_order = 4
UPDATE public.page_actions pa
SET sort_order = 4,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://shorttwelve.online/denizaksoy'
AND pa.is_enabled = true;

-- Dodobet - sort_order = 5
UPDATE public.page_actions pa
SET sort_order = 5,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://cutt.ly/2r7JwG3d'
AND pa.is_enabled = true;

-- Betçi - sort_order = 6
UPDATE public.page_actions pa
SET sort_order = 6,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://betcilink2.com/affiliates/?btag=2564486'
AND pa.is_enabled = true;

-- HizliCasino - sort_order = 7
UPDATE public.page_actions pa
SET sort_order = 7,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://dub.is/hizli-kirve'
AND pa.is_enabled = true;

-- Padisah - sort_order = 8
UPDATE public.page_actions pa
SET sort_order = 8,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://p.t2m.io/EfQMjRJ'
AND pa.is_enabled = true;

-- BetPuan - sort_order = 9
UPDATE public.page_actions pa
SET sort_order = 9,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://www.betpuanpartner.com/links/?btag=2098924'
AND pa.is_enabled = true;

-- Pusula - sort_order = 10
UPDATE public.page_actions pa
SET sort_order = 10,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.href = 'https://t.ly/PusulaKumarlayasiyorum'
AND pa.is_enabled = true;

-- Diğer banner'ları (yukarıdaki 10 banner dışındakiler) 11'den başlayarak sırala
-- Her sayfa için diğer banner'ları mevcut sıralarına göre 11'den başlayarak numaralandır
WITH other_actions AS (
  SELECT 
    pa.id,
    pa.page_id,
    pa.sort_order as old_sort_order,
    pa.created_at
  FROM public.page_actions pa
  INNER JOIN public.pages p ON p.id = pa.page_id
  WHERE p.is_enabled = true
    AND pa.is_enabled = true
    AND NOT (
      pa.preset IN ('merso-banner', 'amg-banner')
      OR pa.href IN (
        'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1',
        'https://shorttwelve.online/denizaksoy',
        'https://cutt.ly/2r7JwG3d',
        'https://betcilink2.com/affiliates/?btag=2564486',
        'https://dub.is/hizli-kirve',
        'https://p.t2m.io/EfQMjRJ',
        'https://www.betpuanpartner.com/links/?btag=2098924',
        'https://t.ly/PusulaKumarlayasiyorum'
      )
    )
),
ranked_others AS (
  SELECT 
    id,
    page_id,
    10 + ROW_NUMBER() OVER (
      PARTITION BY page_id 
      ORDER BY old_sort_order, created_at
    ) as new_sort_order
  FROM other_actions
)
UPDATE public.page_actions pa
SET sort_order = ro.new_sort_order,
    updated_at = NOW()
FROM ranked_others ro
WHERE pa.id = ro.id
  AND pa.sort_order != ro.new_sort_order;

-- Sonuçları doğrula - her sayfadaki banner sıralamasını göster
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
    pa.preset IN ('merso-banner', 'amg-banner')
    OR pa.href IN (
      'https://tr.fgtrack.net/click?key=503a7225e89b71f9ffc3&uid=f263c030-6a10-4021-bbe3-b21739d94dbd&domain=mistycasino.com&offer_id=1',
      'https://shorttwelve.online/denizaksoy',
      'https://cutt.ly/2r7JwG3d',
      'https://betcilink2.com/affiliates/?btag=2564486',
      'https://dub.is/hizli-kirve',
      'https://p.t2m.io/EfQMjRJ',
      'https://www.betpuanpartner.com/links/?btag=2098924',
      'https://t.ly/PusulaKumarlayasiyorum'
    )
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 100;

COMMIT;

