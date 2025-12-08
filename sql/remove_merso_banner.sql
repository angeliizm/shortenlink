-- Tüm sayfalardan Merso banner'ını kaldırma scripti
-- Merso banner'ı preset = 'merso-banner' ile tanımlanmıştır

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT 
  COUNT(*) AS silinecek_kayit_sayisi,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa_sayisi
FROM public.page_actions pa
WHERE pa.preset = 'merso-banner'
  AND pa.is_enabled = true;

-- Merso banner'ını tüm sayfalardan sil
DELETE FROM public.page_actions
WHERE preset = 'merso-banner';

-- Silme işlemi sonrası kontrol
SELECT 
  'Merso banner silme işlemi tamamlandı' AS durum,
  COUNT(*) AS kalan_merso_kayit_sayisi
FROM public.page_actions
WHERE preset = 'merso-banner';

COMMIT;


