-- Admin rolü atama scripti
-- User ID: 3adc5462-f40d-4895-b0d7-5a9a5a477d57

-- Kullanıcının mevcut rolünü kontrol et
SELECT 
    u.email,
    ur.role,
    ur.assigned_at,
    ur.notes
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id = '3adc5462-f40d-4895-b0d7-5a9a5a477d57';

-- Admin rolü ata (mevcut rol varsa güncelle, yoksa yeni kayıt oluştur)
INSERT INTO user_roles (user_id, role, assigned_by, notes, assigned_at)
VALUES (
    '3adc5462-f40d-4895-b0d7-5a9a5a477d57',
    'admin',
    '3adc5462-f40d-4895-b0d7-5a9a5a477d57', -- Kendi kendine atama
    'Manuel olarak admin rolü atandı - Full yetki',
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    assigned_by = '3adc5462-f40d-4895-b0d7-5a9a5a477d57',
    notes = 'Manuel olarak admin rolü atandı - Full yetki',
    assigned_at = NOW(),
    updated_at = NOW();

-- Sonucu kontrol et
SELECT 
    u.email,
    ur.role,
    ur.assigned_at,
    ur.notes,
    'Admin rolü başarıyla atandı!' as message
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id = '3adc5462-f40d-4895-b0d7-5a9a5a477d57';
