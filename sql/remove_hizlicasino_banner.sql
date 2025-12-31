-- Tüm sayfalardan Hizlicasino banner'ını kaldırma scripti
-- Hizlicasino banner'ı preset, label veya href ile tanımlanmış olabilir

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT 
  COUNT(*) AS silinecek_kayit_sayisi,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa_sayisi
FROM public.page_actions pa
WHERE (
  LOWER(pa.preset) LIKE '%hizlicasino%' OR
  LOWER(pa.preset) LIKE '%hızlıcasino%' OR
  LOWER(pa.label) LIKE '%hizlicasino%' OR
  LOWER(pa.label) LIKE '%hızlıcasino%' OR
  LOWER(pa.href) LIKE '%hizli-kirve%' OR
  pa.href = 'https://dub.is/hizli-kirve'
)
AND pa.is_enabled = true;

-- Hizlicasino banner'ını tüm sayfalardan sil
-- Preset, label veya href içinde "hizlicasino" veya "hızlıcasino" geçen tüm kayıtları sil
DELETE FROM public.page_actions
WHERE (
  LOWER(preset) LIKE '%hizlicasino%' OR
  LOWER(preset) LIKE '%hızlıcasino%' OR
  LOWER(label) LIKE '%hizlicasino%' OR
  LOWER(label) LIKE '%hızlıcasino%' OR
  LOWER(href) LIKE '%hizli-kirve%' OR
  href = 'https://dub.is/hizli-kirve'
);

-- Silme işlemi sonrası kontrol
SELECT 
  'Hizlicasino banner silme işlemi tamamlandı' AS durum,
  COUNT(*) AS kalan_hizlicasino_kayit_sayisi
FROM public.page_actions
WHERE (
  LOWER(preset) LIKE '%hizlicasino%' OR
  LOWER(preset) LIKE '%hızlıcasino%' OR
  LOWER(label) LIKE '%hizlicasino%' OR
  LOWER(label) LIKE '%hızlıcasino%' OR
  LOWER(href) LIKE '%hizli-kirve%' OR
  href = 'https://dub.is/hizli-kirve'
);

COMMIT;

