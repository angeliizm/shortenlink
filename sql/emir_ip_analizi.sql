-- Bugün gelen tüm sayfa görüntülenmelerini IP adreslerine göre gruplandırma
SELECT 
    ae.ip_hash AS ip_adresi,
    COUNT(*) AS goruntulenme_sayisi,
    MIN(ae.timestamp) AS ilk_goruntulenme,
    MAX(ae.timestamp) AS son_goruntulenme,
    ae.country AS ulke,
    ae.region AS bolge,
    ae.browser AS tarayici,
    ae.device_type AS cihaz
FROM analytics_events ae
WHERE ae.event_type = 'page_view'
  AND DATE(ae.timestamp) = CURRENT_DATE  -- Bugünün tarihi
GROUP BY 
    ae.ip_hash, 
    ae.country, 
    ae.region, 
    ae.browser, 
    ae.device_type
ORDER BY goruntulenme_sayisi DESC;
