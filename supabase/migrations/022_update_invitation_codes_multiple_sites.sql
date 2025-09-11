-- Update use_invitation_code function to handle multiple sites
CREATE OR REPLACE FUNCTION use_invitation_code(
    p_code VARCHAR,
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL
)
RETURNS JSON
AS $$
DECLARE
    code_record RECORD;
    site_record RECORD;
    rate_limit_record RECORD;
    site_slugs TEXT[];
    i INTEGER;
BEGIN
    -- Check rate limiting if IP provided
    IF p_ip_address IS NOT NULL THEN
        SELECT * INTO rate_limit_record 
        FROM public.rate_limiting 
        WHERE ip_address = p_ip_address;
        
        -- If blocked and still within block period
        IF rate_limit_record.blocked_until IS NOT NULL 
           AND rate_limit_record.blocked_until > NOW() THEN
            RETURN json_build_object(
                'success', false, 
                'error', 'Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.',
                'blocked_until', rate_limit_record.blocked_until
            );
        END IF;
    END IF;
    
    -- Find the invitation code
    SELECT * INTO code_record
    FROM public.invitation_codes
    WHERE code = p_code
    AND is_used = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
    
    -- If code not found or expired
    IF NOT FOUND THEN
        -- Update rate limiting
        IF p_ip_address IS NOT NULL THEN
            INSERT INTO public.rate_limiting (ip_address, failed_attempts, updated_at)
            VALUES (p_ip_address, 1, NOW())
            ON CONFLICT (ip_address) DO UPDATE SET
                failed_attempts = CASE 
                    WHEN rate_limiting.blocked_until IS NULL OR rate_limiting.blocked_until <= NOW() 
                    THEN rate_limiting.failed_attempts + 1
                    ELSE rate_limiting.failed_attempts
                END,
                blocked_until = CASE
                    WHEN (rate_limiting.failed_attempts + 1) >= 3 
                    THEN NOW() + INTERVAL '1 hour'
                    ELSE rate_limiting.blocked_until
                END,
                updated_at = NOW();
        END IF;
        
        RETURN json_build_object('success', false, 'error', 'Geçersiz veya süresi dolmuş kod');
    END IF;
    
    -- Get all sites for this code
    SELECT ARRAY_AGG(site_slug) INTO site_slugs
    FROM public.invitation_codes
    WHERE code = p_code AND is_used = FALSE;
    
    -- Check if any site_slug already exists in pages table
    FOR i IN 1..array_length(site_slugs, 1) LOOP
        SELECT * INTO site_record
        FROM public.pages
        WHERE site_slug = site_slugs[i];
        
        IF FOUND THEN
            RETURN json_build_object('success', false, 'error', 'Site zaten mevcut: ' || site_slugs[i]);
        END IF;
    END LOOP;
    
    -- Create all sites for this code
    FOR i IN 1..array_length(site_slugs, 1) LOOP
        INSERT INTO public.pages (
            site_slug,
            title,
            target_url,
            brand_color,
            is_enabled,
            owner_id,
            created_at,
            updated_at
        ) 
        SELECT 
            ic.site_slug,
            ic.site_title,
            'https://example.com', -- Default URL, user can change later
            '#3B82F6', -- Default blue color
            TRUE, -- Enable after code usage
            p_user_id, -- Code user becomes the owner
            NOW(),
            NOW()
        FROM public.invitation_codes ic
        WHERE ic.code = p_code 
        AND ic.site_slug = site_slugs[i]
        AND ic.is_used = FALSE;
    END LOOP;
    
    -- Mark all codes as used
    UPDATE public.invitation_codes
    SET is_used = TRUE,
        used_by = p_user_id,
        used_at = NOW()
    WHERE code = p_code AND is_used = FALSE;
    
    -- Update user role to approved
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (p_user_id, 'approved', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'approved',
        created_at = NOW();
    
    -- Grant all permissions to the user for all their new sites
    FOR i IN 1..array_length(site_slugs, 1) LOOP
        INSERT INTO public.site_permissions (user_id, site_slug, permission_type, granted_by, granted_at)
        VALUES 
            (p_user_id, site_slugs[i], 'view', code_record.created_by, NOW()),
            (p_user_id, site_slugs[i], 'edit', code_record.created_by, NOW()),
            (p_user_id, site_slugs[i], 'analytics', code_record.created_by, NOW());
    END LOOP;
    
    -- Reset rate limiting on success
    IF p_ip_address IS NOT NULL THEN
        DELETE FROM public.rate_limiting WHERE ip_address = p_ip_address;
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Kod başarıyla kullanıldı',
        'sites_created', site_slugs,
        'sites_count', array_length(site_slugs, 1)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Bir hata oluştu: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
