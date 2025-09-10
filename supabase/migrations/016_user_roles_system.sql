-- Kullanıcı rolleri sistemi
-- Roller: admin, moderator, approved, pending

-- Kullanıcı rolleri tablosu
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'moderator', 'approved', 'pending')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id) -- Her kullanıcının sadece bir rolü olabilir
);

-- Site izinleri tablosu (moderator ve approved kullanıcılar için)
CREATE TABLE IF NOT EXISTS site_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_slug VARCHAR(255) NOT NULL,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'edit', 'analytics', 'create')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, site_slug, permission_type)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_site_permissions_user_id ON site_permissions(user_id);
CREATE INDEX idx_site_permissions_site_slug ON site_permissions(site_slug);
CREATE INDEX idx_site_permissions_composite ON site_permissions(user_id, site_slug, permission_type);

-- Yeni kullanıcılar için otomatik "pending" rolü atama
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role, assigned_by, notes)
    VALUES (NEW.id, 'pending', NULL, 'Otomatik atanan başlangıç rolü');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Yeni kullanıcı kaydında otomatik rol atama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION assign_default_role();

-- Kullanıcının rolünü alma fonksiyonu
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS VARCHAR(20) AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_role, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının belirli bir site için izni olup olmadığını kontrol etme
CREATE OR REPLACE FUNCTION has_site_permission(
    user_uuid UUID,
    site_slug_param VARCHAR(255),
    permission_type_param VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Kullanıcının rolünü al
    SELECT get_user_role(user_uuid) INTO user_role;
    
    -- Admin her şeyi yapabilir
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Pending kullanıcılar hiçbir şey yapamaz
    IF user_role = 'pending' THEN
        RETURN FALSE;
    END IF;
    
    -- Site sahibi her zaman kendi sitesini yönetebilir
    SELECT EXISTS(
        SELECT 1 FROM pages 
        WHERE site_slug = site_slug_param 
        AND owner_id = user_uuid
    ) INTO has_permission;
    
    IF has_permission THEN
        RETURN TRUE;
    END IF;
    
    -- Specific site permissions kontrolü
    SELECT EXISTS(
        SELECT 1 FROM site_permissions 
        WHERE user_id = user_uuid 
        AND site_slug = site_slug_param 
        AND permission_type = permission_type_param
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının dashboard'a erişip erişemeyeceğini kontrol etme
CREATE OR REPLACE FUNCTION can_access_dashboard(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT get_user_role(user_uuid) INTO user_role;
    
    -- Pending kullanıcılar dashboard'a erişemez
    IF user_role = 'pending' THEN
        RETURN FALSE;
    END IF;
    
    -- Diğer tüm roller dashboard'a erişebilir
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının yeni site oluşturup oluşturamayacağını kontrol etme
CREATE OR REPLACE FUNCTION can_create_sites(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
BEGIN
    SELECT get_user_role(user_uuid) INTO user_role;
    
    -- Admin ve moderator yeni site oluşturabilir
    IF user_role IN ('admin', 'moderator') THEN
        RETURN TRUE;
    END IF;
    
    -- Approved kullanıcılar sadece kendi sitelerini yönetebilir (yeni oluşturamaz)
    -- Pending kullanıcılar hiçbir şey yapamaz
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- User Roles tablosu için RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi rollerini görebilir, adminler herkesinkini görebilir
CREATE POLICY "Users can view their own role, admins can view all" ON user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR 
        get_user_role() = 'admin'
    );

-- Sadece adminler rol atayabilir, ancak kullanıcılar kendi rollerini güncelleyebilir (geliştirme amaçlı)
CREATE POLICY "Only admins can manage roles" ON user_roles
    FOR ALL USING (
        get_user_role() = 'admin' OR 
        user_id = auth.uid()
    );

-- Site Permissions tablosu için RLS
ALTER TABLE site_permissions ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi izinlerini görebilir, adminler ve moderatörler herkesinkini görebilir
CREATE POLICY "Users can view permissions" ON site_permissions
    FOR SELECT USING (
        user_id = auth.uid() OR 
        get_user_role() IN ('admin', 'moderator')
    );

-- Adminler ve moderatörler izin verebilir
CREATE POLICY "Admins and moderators can manage permissions" ON site_permissions
    FOR ALL USING (get_user_role() IN ('admin', 'moderator'));

-- Pages tablosu için güncellenmiş RLS politikaları
DROP POLICY IF EXISTS "Users can view their own pages" ON pages;
DROP POLICY IF EXISTS "Users can insert their own pages" ON pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON pages;

-- Güncellenmiş pages politikaları
CREATE POLICY "Users can view pages based on permissions" ON pages
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        owner_id = auth.uid() OR
        has_site_permission(auth.uid(), site_slug, 'view')
    );

CREATE POLICY "Users can create pages based on role" ON pages
    FOR INSERT WITH CHECK (
        can_create_sites() AND owner_id = auth.uid()
    );

CREATE POLICY "Users can update pages based on permissions" ON pages
    FOR UPDATE USING (
        get_user_role() = 'admin' OR
        owner_id = auth.uid() OR
        has_site_permission(auth.uid(), site_slug, 'edit')
    );

CREATE POLICY "Only admins and owners can delete pages" ON pages
    FOR DELETE USING (
        get_user_role() = 'admin' OR
        owner_id = auth.uid()
    );

-- Page Actions tablosu için güncellenmiş RLS politikaları
DROP POLICY IF EXISTS "Users can view their own page actions" ON page_actions;
DROP POLICY IF EXISTS "Users can insert their own page actions" ON page_actions;
DROP POLICY IF EXISTS "Users can update their own page actions" ON page_actions;
DROP POLICY IF EXISTS "Users can delete their own page actions" ON page_actions;

CREATE POLICY "Users can view page actions based on permissions" ON page_actions
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        page_id IN (
            SELECT id FROM pages 
            WHERE owner_id = auth.uid() OR 
            has_site_permission(auth.uid(), site_slug, 'view')
        )
    );

CREATE POLICY "Users can manage page actions based on permissions" ON page_actions
    FOR ALL USING (
        get_user_role() = 'admin' OR
        page_id IN (
            SELECT id FROM pages 
            WHERE owner_id = auth.uid() OR 
            has_site_permission(auth.uid(), site_slug, 'edit')
        )
    );

-- Analytics tabloları için güncellenmiş RLS politikaları

-- Analytics Events
DROP POLICY IF EXISTS "Site owners can view analytics events" ON analytics_events;
CREATE POLICY "Users can view analytics based on permissions" ON analytics_events
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Analytics Sessions
DROP POLICY IF EXISTS "Site owners can view analytics sessions" ON analytics_sessions;
CREATE POLICY "Users can view sessions based on permissions" ON analytics_sessions
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Analytics Metrics Hourly
DROP POLICY IF EXISTS "Site owners can view metrics" ON analytics_metrics_hourly;
CREATE POLICY "Users can view metrics based on permissions" ON analytics_metrics_hourly
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- Analytics Realtime
DROP POLICY IF EXISTS "Site owners can view realtime analytics" ON analytics_realtime;
CREATE POLICY "Users can view realtime based on permissions" ON analytics_realtime
    FOR SELECT USING (
        get_user_role() = 'admin' OR
        site_slug IN (
            SELECT site_slug FROM pages 
            WHERE owner_id = auth.uid()
        ) OR
        has_site_permission(auth.uid(), site_slug, 'analytics')
    );

-- İlk admin kullanıcısı oluşturma (isteğe bağlı - manuel olarak çalıştırılabilir)
-- Bu komutu sadece ilk admin'i atamak için kullanın
/*
UPDATE user_roles 
SET role = 'admin', assigned_by = user_id, notes = 'İlk admin kullanıcısı'
WHERE user_id = 'BURAYA_ADMIN_KULLANICI_UUID_GIRIN';
*/

-- Grant permissions
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT ON site_permissions TO authenticated;

-- Admin dashboard için fonksiyon oluşturma (RLS policy yerine)
CREATE OR REPLACE FUNCTION get_admin_users_view()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    user_created_at TIMESTAMPTZ,
    role VARCHAR(20),
    role_assigned_at TIMESTAMPTZ,
    role_notes TEXT,
    owned_sites_count BIGINT,
    granted_permissions_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Sadece adminler bu fonksiyonu çağırabilir
    IF get_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Bu işlemi gerçekleştirmek için yeterli yetkiniz yok.';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email::VARCHAR,
        u.created_at as user_created_at,
        COALESCE(ur.role, 'pending'::VARCHAR(20)) as role,
        COALESCE(ur.assigned_at, u.created_at) as role_assigned_at,
        ur.notes as role_notes,
        (SELECT COUNT(*) FROM pages WHERE owner_id = u.id) as owned_sites_count,
        (SELECT COUNT(*) FROM site_permissions WHERE user_id = u.id AND is_active = true) as granted_permissions_count
    FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    ORDER BY ur.role, u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Başarı mesajı
SELECT 'Kullanıcı rolleri sistemi başarıyla oluşturuldu!' as message;
