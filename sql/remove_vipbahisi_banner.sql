-- Tüm sayfalardan Vipbahisi banner'ını kaldırma scripti
-- Vipbahisi banner'ı preset, label veya href ile tanımlanmış olabilir

BEGIN;

-- Silmeden önce kaç kayıt silineceğini göster
SELECT 
  COUNT(*) AS silinecek_kayit_sayisi,
  COUNT(DISTINCT page_id) AS etkilenecek_sayfa_sayisi
FROM public.page_actions pa
WHERE (
  LOWER(pa.preset) LIKE '%vipbahis%' OR
  LOWER(pa.label) LIKE '%vipbahis%' OR
  LOWER(pa.href) LIKE '%vipbahis%'
)
AND pa.is_enabled = true;

-- Vipbahisi banner'ını tüm sayfalardan sil
-- Preset, label veya href içinde "vipbahis" geçen tüm kayıtları sil
DELETE FROM public.page_actions
WHERE (
  LOWER(preset) LIKE '%vipbahis%' OR
  LOWER(label) LIKE '%vipbahis%' OR
  LOWER(href) LIKE '%vipbahis%'
);

-- Silme işlemi sonrası kontrol
SELECT 
  'Vipbahisi banner silme işlemi tamamlandı' AS durum,
  COUNT(*) AS kalan_vipbahisi_kayit_sayisi
FROM public.page_actions
WHERE (
  LOWER(preset) LIKE '%vipbahis%' OR
  LOWER(label) LIKE '%vipbahis%' OR
  LOWER(href) LIKE '%vipbahis%'
);

COMMIT;

