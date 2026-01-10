-- Tüm sayfalardan belirtilen butonlar hariç tüm butonları kaldırma scripti
-- Korunacak butonlar: AMG, LOCA, MİLLİ, PALAZZO, BETİUM
-- Bu butonlar label, preset veya href ile tanımlanmış olabilir

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT 
  COUNT(*) AS silinecek_kayit_sayisi,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa_sayisi
FROM public.page_actions pa
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true
AND NOT (
  -- AMG butonları
  pa.preset = 'amg-banner' OR
  UPPER(pa.label) LIKE '%AMG%' OR
  
  -- LOCA butonları
  UPPER(pa.label) LIKE '%LOCA%' OR
  LOWER(pa.preset) LIKE '%loca%' OR
  
  -- MİLLİ butonları
  UPPER(pa.label) LIKE '%MİLLİ%' OR
  UPPER(pa.label) LIKE '%MİLLI%' OR
  UPPER(pa.label) LIKE '%MILLI%' OR
  LOWER(pa.preset) LIKE '%milli%' OR
  
  -- PALAZZO butonları
  pa.preset = 'palazzobet-banner' OR
  UPPER(pa.label) LIKE '%PALAZZO%' OR
  UPPER(pa.label) LIKE '%Palazzobet%' OR
  
  -- BETİUM butonları
  pa.preset = 'betium-banner' OR
  UPPER(pa.label) LIKE '%BETİUM%' OR
  UPPER(pa.label) LIKE '%BETIUM%' OR
  UPPER(pa.label) LIKE '%Betium%'
);

-- Belirtilen butonlar hariç tüm butonları sil
DELETE FROM public.page_actions
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = page_actions.page_id
    AND p.is_enabled = true
)
AND NOT (
  -- AMG butonları
  preset = 'amg-banner' OR
  UPPER(label) LIKE '%AMG%' OR
  
  -- LOCA butonları
  UPPER(label) LIKE '%LOCA%' OR
  LOWER(preset) LIKE '%loca%' OR
  
  -- MİLLİ butonları
  UPPER(label) LIKE '%MİLLİ%' OR
  UPPER(label) LIKE '%MİLLI%' OR
  UPPER(label) LIKE '%MILLI%' OR
  LOWER(preset) LIKE '%milli%' OR
  
  -- PALAZZO butonları
  preset = 'palazzobet-banner' OR
  UPPER(label) LIKE '%PALAZZO%' OR
  UPPER(label) LIKE '%Palazzobet%' OR
  
  -- BETİUM butonları
  preset = 'betium-banner' OR
  UPPER(label) LIKE '%BETİUM%' OR
  UPPER(label) LIKE '%BETIUM%' OR
  UPPER(label) LIKE '%Betium%'
);

-- Silme işlemi sonrası kontrol - kalan butonları göster
SELECT 
  'Kalan butonlar' AS durum,
  COUNT(*) AS toplam_buton_sayisi,
  COUNT(DISTINCT page_id) AS sayfa_sayisi
FROM public.page_actions pa
WHERE EXISTS (
  SELECT 1 FROM public.pages p
  WHERE p.id = pa.page_id
    AND p.is_enabled = true
)
AND pa.is_enabled = true;

-- Kalan butonların detaylarını göster
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
ORDER BY p.site_slug, pa.sort_order
LIMIT 200;

COMMIT;



