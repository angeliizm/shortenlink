-- Fix site_permissions and pages relationship
-- Add foreign key constraint and update the table structure

-- First, let's add a page_id column to site_permissions for direct relationship
ALTER TABLE site_permissions 
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_site_permissions_page_id ON site_permissions(page_id);

-- Update existing records to populate page_id based on site_slug
UPDATE site_permissions 
SET page_id = (
    SELECT id FROM pages 
    WHERE site_slug = site_permissions.site_slug 
    LIMIT 1
)
WHERE page_id IS NULL;

-- Now we can create a proper relationship
-- But let's keep site_slug as well for backwards compatibility

-- Update the composite unique constraint to include page_id
ALTER TABLE site_permissions DROP CONSTRAINT IF EXISTS site_permissions_user_id_site_slug_permission_type_key;
ALTER TABLE site_permissions ADD CONSTRAINT unique_user_page_permission 
    UNIQUE(user_id, page_id, permission_type);

-- Update the has_site_permission function to work with both approaches
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

-- Create a view for easier querying
CREATE OR REPLACE VIEW site_permissions_with_pages AS
SELECT 
    sp.*,
    p.id as page_id_from_slug,
    p.site_slug as page_site_slug,
    p.title as page_title,
    p.owner_id as page_owner_id,
    p.is_enabled as page_is_enabled
FROM site_permissions sp
LEFT JOIN pages p ON (sp.page_id = p.id OR sp.site_slug = p.site_slug);

-- Grant access to the view
GRANT SELECT ON site_permissions_with_pages TO authenticated;

-- Success message
SELECT 'Site permissions relationship fixed!' as message;
