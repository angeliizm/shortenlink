-- Bahibom ve Palazzobet banner'larını eksik olan tüm aktif sayfalara ekleme scripti
-- Her banner için ayrı ayrı kontrol edilir ve sadece eksik olan sayfalara eklenir
-- Bu script 3. ve 4. sıraya ekler, mevcut butonları kaydırır

BEGIN;

-- Önce mevcut 3. ve üzeri sıradaki butonları 2 sıra aşağı kaydır
UPDATE page_actions pa
SET sort_order = pa.sort_order + 2,
    updated_at = NOW()
WHERE pa.sort_order >= 3
  AND pa.is_enabled = true
  AND EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = pa.page_id
      AND p.is_enabled = true
  )
  AND pa.href NOT IN (
    'https://cutt.ly/denizaksoyxbahibom',
    'https://cutt.ly/pzdenizaksoy'
  );

-- Bahibom butonu - eksik olan sayfalara 3. sıraya ekle
INSERT INTO page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Bahibom Kampanyası',
  'https://cutt.ly/denizaksoyxbahibom',
  'outline',
  'bahibom-banner',
  '/images/bahibombanner.png',
  3,
  true
FROM pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
  );

-- Palazzobet butonu - eksik olan sayfalara 4. sıraya ekle
INSERT INTO page_actions (page_id, label, href, variant, preset, image_url, sort_order, is_enabled)
SELECT
  p.id,
  'Palazzobet Avantajı',
  'https://cutt.ly/pzdenizaksoy',
  'outline',
  'palazzobet-banner',
  '/images/palazzobetbanner.png',
  4,
  true
FROM pages p
WHERE p.is_enabled = true
  AND NOT EXISTS (
    SELECT 1
    FROM page_actions pa
    WHERE pa.page_id = p.id
      AND pa.href = 'https://cutt.ly/pzdenizaksoy'
  );

-- Mevcut Bahibom butonlarını 3. sıraya güncelle (eğer farklı sıradaysa)
UPDATE page_actions pa
SET sort_order = 3,
    label = 'Bahibom Kampanyası',
    preset = 'bahibom-banner',
    image_url = '/images/bahibombanner.png',
    variant = 'outline',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.href = 'https://cutt.ly/denizaksoyxbahibom'
  AND pa.sort_order != 3
  AND EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = pa.page_id
      AND p.is_enabled = true
  );

-- Mevcut Palazzobet butonlarını 4. sıraya güncelle (eğer farklı sıradaysa)
UPDATE page_actions pa
SET sort_order = 4,
    label = 'Palazzobet Avantajı',
    preset = 'palazzobet-banner',
    image_url = '/images/palazzobetbanner.png',
    variant = 'outline',
    is_enabled = true,
    updated_at = NOW()
WHERE pa.href = 'https://cutt.ly/pzdenizaksoy'
  AND pa.sort_order != 4
  AND EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = pa.page_id
      AND p.is_enabled = true
  );

-- Sonuçları doğrula - her banner için kaç sayfaya eklendiğini göster
SELECT 
  'Bahibom' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM pages p
LEFT JOIN page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://cutt.ly/denizaksoyxbahibom'
WHERE p.is_enabled = true

UNION ALL

SELECT 
  'Palazzobet' AS banner_name,
  COUNT(DISTINCT p.id) AS total_sites,
  COUNT(DISTINCT pa.page_id) AS sites_with_banner
FROM pages p
LEFT JOIN page_actions pa ON pa.page_id = p.id 
  AND pa.href = 'https://cutt.ly/pzdenizaksoy'
WHERE p.is_enabled = true

ORDER BY banner_name;

-- Detaylı sonuç listesi
SELECT 
  p.site_slug,
  pa.label,
  pa.preset,
  pa.sort_order
FROM pages p
INNER JOIN page_actions pa ON p.id = pa.page_id
WHERE p.is_enabled = true
  AND pa.is_enabled = true
  AND pa.href IN (
    'https://cutt.ly/denizaksoyxbahibom',
    'https://cutt.ly/pzdenizaksoy'
  )
ORDER BY p.site_slug, pa.sort_order
LIMIT 50;

COMMIT;


