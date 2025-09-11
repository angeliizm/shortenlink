-- Drop all existing function variants first - more comprehensive approach
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop all use_invitation_code functions
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'use_invitation_code'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Create use_invitation_code function
CREATE OR REPLACE FUNCTION use_invitation_code(
    p_code VARCHAR(12),
    p_user_id UUID,
    p_ip_address INET
)
RETURNS JSON AS $$
DECLARE
    invitation_record RECORD;
    site_record RECORD;
    user_role VARCHAR(20);
    result JSON;
BEGIN
    -- Check if user is authenticated
    IF p_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Kullanıcı kimliği gerekli'
        );
    END IF;

    -- Check rate limiting
    IF EXISTS (
        SELECT 1 FROM rate_limiting 
        WHERE ip_address = p_ip_address 
        AND blocked_until > NOW()
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
            'blocked_until', (
                SELECT blocked_until FROM rate_limiting 
                WHERE ip_address = p_ip_address
            )
        );
    END IF;

    -- Find the invitation code
    SELECT * INTO invitation_record
    FROM invitation_codes
    WHERE code = p_code
    AND is_used = FALSE
    AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;

    -- If code not found or expired
    IF NOT FOUND THEN
        -- Update rate limiting
        INSERT INTO rate_limiting (ip_address, failed_attempts, blocked_until)
        VALUES (p_ip_address, 1, NOW() + INTERVAL '1 hour')
        ON CONFLICT (ip_address) DO UPDATE SET
            failed_attempts = rate_limiting.failed_attempts + 1,
            blocked_until = CASE 
                WHEN rate_limiting.failed_attempts >= 2 THEN NOW() + INTERVAL '1 hour'
                ELSE rate_limiting.blocked_until
            END,
            updated_at = NOW();

        RETURN json_build_object(
            'success', false,
            'error', 'Geçersiz veya süresi dolmuş kod'
        );
    END IF;

    -- Check if user already has a role
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = p_user_id;

    -- If user already has a role other than pending, don't allow
    IF user_role IS NOT NULL AND user_role != 'pending' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Bu kullanıcının zaten bir rolü var'
        );
    END IF;

    -- Create or update user role to 'approved'
    INSERT INTO user_roles (user_id, role, assigned_by, notes)
    VALUES (p_user_id, 'approved', invitation_record.created_by, 'Invitation code ile onaylandı')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'approved',
        assigned_by = invitation_record.created_by,
        notes = 'Invitation code ile onaylandı',
        updated_at = NOW();

    -- Create the site
    INSERT INTO pages (
        site_slug,
        title,
        owner_id,
        is_enabled,
        created_at,
        updated_at
    ) VALUES (
        invitation_record.site_slug,
        invitation_record.site_title,
        invitation_record.created_by, -- Admin/moderator owns the site
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (site_slug) DO NOTHING;

    -- Get the created site
    SELECT * INTO site_record
    FROM pages
    WHERE site_slug = invitation_record.site_slug;

    -- Grant permissions to the user
    INSERT INTO site_permissions (
        user_id,
        site_slug,
        permission_type,
        granted_by,
        granted_at,
        is_active
    ) VALUES 
    (p_user_id, invitation_record.site_slug, 'view', invitation_record.created_by, NOW(), TRUE),
    (p_user_id, invitation_record.site_slug, 'edit', invitation_record.created_by, NOW(), TRUE),
    (p_user_id, invitation_record.site_slug, 'analytics', invitation_record.created_by, NOW(), TRUE)
    ON CONFLICT (user_id, site_slug, permission_type) DO UPDATE SET
        is_active = TRUE,
        granted_at = NOW();

    -- Mark the invitation code as used
    UPDATE invitation_codes
    SET is_used = TRUE,
        used_by = p_user_id,
        used_at = NOW()
    WHERE code = p_code;

    -- Clear rate limiting for successful use
    DELETE FROM rate_limiting WHERE ip_address = p_ip_address;

    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'Kod başarıyla kullanıldı. Site erişiminiz aktif edildi.',
        'site_slug', invitation_record.site_slug,
        'site_title', invitation_record.site_title
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return failure
        RETURN json_build_object(
            'success', false,
            'error', 'Beklenmeyen bir hata oluştu: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION use_invitation_code TO authenticated;

-- Success message
SELECT 'use_invitation_code function created successfully!' as message;
