-- Tüm sayfalardan Onwin, Sahabet, Tipobet ve Locabet banner'larını kaldırma scripti
-- Onwin:   preset = 'onwin-banner',   href = 'https://cutt.ly/NtaVWH22'
-- Sahabet: preset = 'sahabet-banner', href = 'https://cutt.ly/ktaV1HC6'
-- Tipobet: preset = 'tipobet-banner', href = 'https://cutt.ly/JtaVyZ7y'
-- Locabet: preset = 'locabet-banner', href = 'https://t2m.io/kirvegiris'

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT
  'Onwin' AS banner,
  COUNT(*) AS silinecek_kayit,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa
FROM public.page_actions pa
WHERE pa.preset = 'onwin-banner'
   OR pa.href = 'https://cutt.ly/NtaVWH22'

UNION ALL

SELECT
  'Sahabet' AS banner,
  COUNT(*) AS silinecek_kayit,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa
FROM public.page_actions pa
WHERE pa.preset = 'sahabet-banner'
   OR pa.href = 'https://cutt.ly/ktaV1HC6'

UNION ALL

SELECT
  'Tipobet' AS banner,
  COUNT(*) AS silinecek_kayit,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa
FROM public.page_actions pa
WHERE pa.preset = 'tipobet-banner'
   OR pa.href = 'https://cutt.ly/JtaVyZ7y'

UNION ALL

SELECT
  'Locabet' AS banner,
  COUNT(*) AS silinecek_kayit,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa
FROM public.page_actions pa
WHERE pa.preset = 'locabet-banner'
   OR pa.href = 'https://t2m.io/kirvegiris';

-- Onwin, Sahabet, Tipobet ve Locabet banner'larını tüm sayfalardan sil
DELETE FROM public.page_actions
WHERE preset = 'onwin-banner'
   OR preset = 'sahabet-banner'
   OR preset = 'tipobet-banner'
   OR preset = 'locabet-banner'
   OR href = 'https://cutt.ly/NtaVWH22'
   OR href = 'https://cutt.ly/ktaV1HC6'
   OR href = 'https://cutt.ly/JtaVyZ7y'
   OR href = 'https://t2m.io/kirvegiris';

-- Silme işlemi sonrası kontrol
SELECT
  'Silme işlemi tamamlandı' AS durum,
  COUNT(*) AS kalan_kayit_sayisi
FROM public.page_actions
WHERE preset IN ('onwin-banner', 'sahabet-banner', 'tipobet-banner', 'locabet-banner')
   OR href IN (
     'https://cutt.ly/NtaVWH22',
     'https://cutt.ly/ktaV1HC6',
     'https://cutt.ly/JtaVyZ7y',
     'https://t2m.io/kirvegiris'
   );

COMMIT;
