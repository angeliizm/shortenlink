-- Tüm sayfalardan Anubis Bet banner'ını kaldırma scripti
-- Anubis: preset = 'anubis-banner', href = 'https://cutt.ly/DenizaksoyxAnubis'

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT
  COUNT(*) AS silinecek_kayit_sayisi,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa_sayisi
FROM public.page_actions pa
WHERE pa.preset = 'anubis-banner'
   OR pa.href = 'https://cutt.ly/DenizaksoyxAnubis';

-- Anubis banner'ını tüm sayfalardan sil
DELETE FROM public.page_actions
WHERE preset = 'anubis-banner'
   OR href = 'https://cutt.ly/DenizaksoyxAnubis';

-- Silme işlemi sonrası kontrol
SELECT
  'Anubis banner silme işlemi tamamlandı' AS durum,
  COUNT(*) AS kalan_anubis_kayit_sayisi
FROM public.page_actions
WHERE preset = 'anubis-banner'
   OR href = 'https://cutt.ly/DenizaksoyxAnubis';

COMMIT;
