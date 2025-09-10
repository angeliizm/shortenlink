-- Demo2 sayfası için örnek analytics verileri
-- Site ID: 44a2697e-b640-4f77-b484-78bdc659b3b9
-- Site Slug: demo2

-- Önce mevcut demo2 verilerini temizle (eğer varsa)
DELETE FROM analytics_events WHERE site_slug = 'demo2';
DELETE FROM analytics_sessions WHERE site_slug = 'demo2';
DELETE FROM analytics_metrics_hourly WHERE site_slug = 'demo2';
DELETE FROM analytics_realtime WHERE site_slug = 'demo2';

-- Örnek ziyaretçi ID'leri
-- Bu ID'ler gerçekçi UUID formatında
INSERT INTO analytics_events (
    site_slug, event_type, timestamp, session_id, visitor_id,
    path, referrer, device_type, browser, os, country, region,
    action_index, action_type, ip_hash, is_bot, is_new_visitor
) VALUES 
-- Son 7 gün içinde sayfa görüntülemeleri
('demo2', 'page_view', NOW() - INTERVAL '1 hour', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', NULL, NULL, 'hash1', false, true),
('demo2', 'page_view', NOW() - INTERVAL '2 hours', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', NULL, NULL, 'hash2', false, true),
('demo2', 'page_view', NOW() - INTERVAL '3 hours', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', NULL, NULL, 'hash3', false, true),
('demo2', 'page_view', NOW() - INTERVAL '4 hours', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', NULL, NULL, 'hash4', false, true),
('demo2', 'page_view', NOW() - INTERVAL '5 hours', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', NULL, NULL, 'hash5', false, true),

-- Son 2 gün içinde sayfa görüntülemeleri
('demo2', 'page_view', NOW() - INTERVAL '1 day', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', NULL, NULL, 'hash6', false, true),
('demo2', 'page_view', NOW() - INTERVAL '1 day 1 hour', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', NULL, NULL, 'hash7', false, true),
('demo2', 'page_view', NOW() - INTERVAL '1 day 2 hours', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', NULL, NULL, 'hash8', false, true),
('demo2', 'page_view', NOW() - INTERVAL '1 day 3 hours', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', NULL, NULL, 'hash9', false, true),
('demo2', 'page_view', NOW() - INTERVAL '1 day 4 hours', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', NULL, NULL, 'hash10', false, true),

-- Son 3 gün içinde sayfa görüntülemeleri
('demo2', 'page_view', NOW() - INTERVAL '2 days', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', NULL, NULL, 'hash11', false, true),
('demo2', 'page_view', NOW() - INTERVAL '2 days 1 hour', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', NULL, NULL, 'hash12', false, true),
('demo2', 'page_view', NOW() - INTERVAL '2 days 2 hours', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', NULL, NULL, 'hash13', false, true),
('demo2', 'page_view', NOW() - INTERVAL '2 days 3 hours', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', NULL, NULL, 'hash14', false, true),
('demo2', 'page_view', NOW() - INTERVAL '2 days 4 hours', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440015', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', NULL, NULL, 'hash15', false, true),

-- Son 7 gün içinde buton tıklamaları
('demo2', 'action_click', NOW() - INTERVAL '1 hour', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', 0, 'button', 'hash1', false, false),
('demo2', 'action_click', NOW() - INTERVAL '2 hours', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', 1, 'button', 'hash2', false, false),
('demo2', 'action_click', NOW() - INTERVAL '3 hours', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', 2, 'button', 'hash3', false, false),
('demo2', 'action_click', NOW() - INTERVAL '4 hours', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', 0, 'button', 'hash4', false, false),
('demo2', 'action_click', NOW() - INTERVAL '5 hours', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', 1, 'button', 'hash5', false, false),

-- Son 2 gün içinde buton tıklamaları
('demo2', 'action_click', NOW() - INTERVAL '1 day', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', 2, 'button', 'hash6', false, false),
('demo2', 'action_click', NOW() - INTERVAL '1 day 1 hour', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', 0, 'button', 'hash7', false, false),
('demo2', 'action_click', NOW() - INTERVAL '1 day 2 hours', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', 1, 'button', 'hash8', false, false),
('demo2', 'action_click', NOW() - INTERVAL '1 day 3 hours', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', 2, 'button', 'hash9', false, false),
('demo2', 'action_click', NOW() - INTERVAL '1 day 4 hours', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', 0, 'button', 'hash10', false, false),

-- Son 3 gün içinde buton tıklamaları
('demo2', 'action_click', NOW() - INTERVAL '2 days', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', '/', 'google.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', 1, 'button', 'hash11', false, false),
('demo2', 'action_click', NOW() - INTERVAL '2 days 1 hour', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', '/', 'facebook.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', 2, 'button', 'hash12', false, false),
('demo2', 'action_click', NOW() - INTERVAL '2 days 2 hours', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '/', 'twitter.com', 'tablet', 'Chrome', 'Android', 'TR', 'Izmir', 0, 'button', 'hash13', false, false),
('demo2', 'action_click', NOW() - INTERVAL '2 days 3 hours', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', '/', 'linkedin.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', 1, 'button', 'hash14', false, false),
('demo2', 'action_click', NOW() - INTERVAL '2 days 4 hours', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440015', '/', 'direct', 'mobile', 'Chrome', 'Android', 'TR', 'Antalya', 2, 'button', 'hash15', false, false),

-- Son 7 gün içinde daha fazla sayfa görüntüleme (çeşitlilik için)
('demo2', 'page_view', NOW() - INTERVAL '6 hours', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440016', '/', 'youtube.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', NULL, NULL, 'hash16', false, true),
('demo2', 'page_view', NOW() - INTERVAL '7 hours', '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440017', '/', 'instagram.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', NULL, NULL, 'hash17', false, true),
('demo2', 'page_view', NOW() - INTERVAL '8 hours', '550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440018', '/', 'tiktok.com', 'mobile', 'Chrome', 'Android', 'TR', 'Izmir', NULL, NULL, 'hash18', false, true),
('demo2', 'page_view', NOW() - INTERVAL '9 hours', '550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440019', '/', 'reddit.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', NULL, NULL, 'hash19', false, true),
('demo2', 'page_view', NOW() - INTERVAL '10 hours', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', '/', 'direct', 'tablet', 'Safari', 'iOS', 'TR', 'Antalya', NULL, NULL, 'hash20', false, true),

-- Son 7 gün içinde daha fazla buton tıklama
('demo2', 'action_click', NOW() - INTERVAL '6 hours', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440016', '/', 'youtube.com', 'desktop', 'Chrome', 'Windows', 'TR', 'Istanbul', 0, 'button', 'hash16', false, false),
('demo2', 'action_click', NOW() - INTERVAL '7 hours', '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440017', '/', 'instagram.com', 'mobile', 'Safari', 'iOS', 'TR', 'Ankara', 1, 'button', 'hash17', false, false),
('demo2', 'action_click', NOW() - INTERVAL '8 hours', '550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440018', '/', 'tiktok.com', 'mobile', 'Chrome', 'Android', 'TR', 'Izmir', 2, 'button', 'hash18', false, false),
('demo2', 'action_click', NOW() - INTERVAL '9 hours', '550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440019', '/', 'reddit.com', 'desktop', 'Firefox', 'Windows', 'TR', 'Bursa', 0, 'button', 'hash19', false, false),
('demo2', 'action_click', NOW() - INTERVAL '10 hours', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', '/', 'direct', 'tablet', 'Safari', 'iOS', 'TR', 'Antalya', 1, 'button', 'hash20', false, false);

-- Session verileri ekle
INSERT INTO analytics_sessions (
    id, site_slug, visitor_id, started_at, ended_at, duration_seconds, 
    page_views, bounce, country, device_type, browser
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'demo2', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '2 minutes', 120, 1, false, 'TR', 'desktop', 'Chrome'),
('550e8400-e29b-41d4-a716-446655440002', 'demo2', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes', 180, 1, false, 'TR', 'mobile', 'Safari'),
('550e8400-e29b-41d4-a716-446655440003', 'demo2', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '1 minute', 60, 1, true, 'TR', 'tablet', 'Chrome'),
('550e8400-e29b-41d4-a716-446655440004', 'demo2', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours' + INTERVAL '4 minutes', 240, 1, false, 'TR', 'desktop', 'Firefox'),
('550e8400-e29b-41d4-a716-446655440005', 'demo2', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '2 minutes', 120, 1, false, 'TR', 'mobile', 'Chrome'),
('550e8400-e29b-41d4-a716-446655440006', 'demo2', '550e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes', 180, 1, false, 'TR', 'desktop', 'Chrome'),
('550e8400-e29b-41d4-a716-446655440007', 'demo2', '550e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '1 day 1 hour', NOW() - INTERVAL '1 day 1 hour' + INTERVAL '2 minutes', 120, 1, false, 'TR', 'mobile', 'Safari'),
('550e8400-e29b-41d4-a716-446655440008', 'demo2', '550e8400-e29b-41d4-a716-446655440008', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours' + INTERVAL '1 minute', 60, 1, true, 'TR', 'tablet', 'Chrome'),
('550e8400-e29b-41d4-a716-446655440009', 'demo2', '550e8400-e29b-41d4-a716-446655440009', NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 3 hours' + INTERVAL '4 minutes', 240, 1, false, 'TR', 'desktop', 'Firefox'),
('550e8400-e29b-41d4-a716-446655440010', 'demo2', '550e8400-e29b-41d4-a716-446655440010', NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours' + INTERVAL '2 minutes', 120, 1, false, 'TR', 'mobile', 'Chrome');

-- Realtime verileri ekle (son 5 dakika içinde aktif ziyaretçiler)
INSERT INTO analytics_realtime (
    site_slug, visitor_id, last_seen, path, device_type, country
) VALUES 
('demo2', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 minutes', '/', 'desktop', 'TR'),
('demo2', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 minute', '/', 'mobile', 'TR'),
('demo2', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 minutes', '/', 'tablet', 'TR');

-- Hourly metrics verileri ekle (son 7 gün için)
INSERT INTO analytics_metrics_hourly (
    site_slug, hour, page_views, unique_visitors, sessions, total_session_duration, bounces
) VALUES 
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '3 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '4 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '5 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '6 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '7 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '8 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '9 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '10 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 day'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 day 1 hour'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 day 2 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 day 3 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '1 day 4 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 days'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 days 1 hour'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 days 2 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 days 3 hours'), 5, 5, 5, 600, 1),
('demo2', DATE_TRUNC('hour', NOW() - INTERVAL '2 days 4 hours'), 5, 5, 5, 600, 1);

-- Veri ekleme işlemi tamamlandı
SELECT 'Demo2 analytics verileri başarıyla eklendi!' as message;
