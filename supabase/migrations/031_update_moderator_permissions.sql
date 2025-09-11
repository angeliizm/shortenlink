-- Update moderator permissions to have full access like admin
-- Moderators should be able to access, edit, view analytics, and delete all sites

-- Update has_site_permission function to include moderator
CREATE OR REPLACE FUNCTION has_site_permission(
    site_slug_param VARCHAR(255),
    permission_type_param VARCHAR(20),
    user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Kullanıcının rolünü al
    SELECT get_user_role(user_uuid) INTO user_role;
    
    -- Admin ve moderator her şeyi yapabilir
    IF user_role IN ('admin', 'moderator') THEN
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
    
    -- Specific site permissions kontrolü - both site_slug and page_id approaches
    SELECT EXISTS(
        SELECT 1 FROM site_permissions sp
        LEFT JOIN pages p ON sp.page_id = p.id
        WHERE sp.user_id = user_uuid 
        AND (sp.site_slug = site_slug_param OR p.site_slug = site_slug_param)
        AND sp.permission_type = permission_type_param
        AND sp.is_active = TRUE
        AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_delete_site function to include moderator
CREATE OR REPLACE FUNCTION can_delete_site(
    site_slug_param VARCHAR(255),
    user_uuid UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
    is_owner BOOLEAN := FALSE;
BEGIN
    -- Kullanıcının rolünü al
    SELECT get_user_role(user_uuid) INTO user_role;
    
    -- Admin ve moderator her şeyi silebilir
    IF user_role IN ('admin', 'moderator') THEN
        RETURN TRUE;
    END IF;
    
    -- Site sahibi kontrolü
    SELECT EXISTS(
        SELECT 1 FROM pages 
        WHERE site_slug = site_slug_param 
        AND owner_id = user_uuid
    ) INTO is_owner;
    
    RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_create_sites function to include moderator (already exists but let's make sure)
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

-- Success message
SELECT 'Moderator permissions updated successfully!' as message;
