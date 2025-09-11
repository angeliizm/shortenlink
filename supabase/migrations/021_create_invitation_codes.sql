-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS public.invitation_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(12) UNIQUE NOT NULL,
    site_title VARCHAR(255) NOT NULL,
    site_slug VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure site_slug is unique across invitation codes
    CONSTRAINT unique_invitation_site_slug UNIQUE (site_slug)
);

-- Create indexes for performance
CREATE INDEX idx_invitation_codes_code ON public.invitation_codes(code);
CREATE INDEX idx_invitation_codes_created_by ON public.invitation_codes(created_by);
CREATE INDEX idx_invitation_codes_used_by ON public.invitation_codes(used_by);
CREATE INDEX idx_invitation_codes_expires_at ON public.invitation_codes(expires_at);
CREATE INDEX idx_invitation_codes_is_used ON public.invitation_codes(is_used);

-- Create rate_limiting table for IP-based timeouts
CREATE TABLE IF NOT EXISTS public.rate_limiting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_ip_address UNIQUE (ip_address)
);

-- Create index for rate limiting
CREATE INDEX idx_rate_limiting_ip ON public.rate_limiting(ip_address);
CREATE INDEX idx_rate_limiting_blocked_until ON public.rate_limiting(blocked_until);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitation_codes
CREATE POLICY "Admin and moderator can view all invitation codes" ON public.invitation_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admin and moderator can create invitation codes" ON public.invitation_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admin and moderator can update invitation codes" ON public.invitation_codes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for rate_limiting (only for system use)
CREATE POLICY "System can manage rate limiting" ON public.rate_limiting
    FOR ALL USING (true);

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    code_length INTEGER := 8;
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_exists BOOLEAN := TRUE;
BEGIN
    WHILE code_exists LOOP
        result := '';
        FOR i IN 1..code_length LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
        
        SELECT EXISTS(SELECT 1 FROM public.invitation_codes WHERE code = result) INTO code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use invitation code
CREATE OR REPLACE FUNCTION use_invitation_code(
    invitation_code TEXT,
    user_ip INET DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    code_record RECORD;
    user_id UUID;
    site_record RECORD;
    rate_limit_record RECORD;
    result JSON;
BEGIN
    -- Get current user ID
    user_id := auth.uid();
    
    IF user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Kullanıcı girişi gerekli');
    END IF;
    
    -- Check rate limiting if IP provided
    IF user_ip IS NOT NULL THEN
        SELECT * INTO rate_limit_record 
        FROM public.rate_limiting 
        WHERE ip_address = user_ip;
        
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
    WHERE code = invitation_code
    AND is_used = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
    
    -- If code not found or expired
    IF NOT FOUND THEN
        -- Update rate limiting
        IF user_ip IS NOT NULL THEN
            INSERT INTO public.rate_limiting (ip_address, failed_attempts, updated_at)
            VALUES (user_ip, 1, NOW())
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
    
    -- Check if site_slug already exists in pages table
    SELECT * INTO site_record
    FROM public.pages
    WHERE site_slug = code_record.site_slug;
    
    IF FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Site zaten mevcut');
    END IF;
    
    -- Create the site
    INSERT INTO public.pages (
        site_slug,
        title,
        target_url,
        brand_color,
        is_enabled,
        owner_id,
        created_at,
        updated_at
    ) VALUES (
        code_record.site_slug,
        code_record.site_title,
        'https://example.com', -- Default URL, user can change later
        '#3B82F6', -- Default blue color
        TRUE, -- Enable after code usage
        user_id, -- Code user becomes the owner
        NOW(),
        NOW()
    );
    
    -- Mark code as used
    UPDATE public.invitation_codes
    SET is_used = TRUE,
        used_by = user_id,
        used_at = NOW()
    WHERE id = code_record.id;
    
    -- Update user role to approved
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (user_id, 'approved', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'approved',
        created_at = NOW();
    
    -- Grant all permissions to the user for their new site
    INSERT INTO public.site_permissions (user_id, site_slug, permission_type, granted_by, granted_at)
    VALUES 
        (user_id, code_record.site_slug, 'view', code_record.created_by, NOW()),
        (user_id, code_record.site_slug, 'edit', code_record.created_by, NOW()),
        (user_id, code_record.site_slug, 'analytics', code_record.created_by, NOW());
    
    -- Reset rate limiting on success
    IF user_ip IS NOT NULL THEN
        DELETE FROM public.rate_limiting WHERE ip_address = user_ip;
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Kod başarıyla kullanıldı',
        'site_slug', code_record.site_slug,
        'site_title', code_record.site_title
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Bir hata oluştu: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active invitation codes for admin/moderator
CREATE OR REPLACE FUNCTION get_active_invitation_codes()
RETURNS TABLE (
    id UUID,
    code VARCHAR,
    site_title VARCHAR,
    site_slug VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN,
    created_by UUID,
    creator_email TEXT,
    used_by UUID,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if user is admin or moderator
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'moderator')
    ) THEN
        RAISE EXCEPTION 'Yetkisiz erişim';
    END IF;
    
    RETURN QUERY
    SELECT 
        ic.id,
        ic.code,
        ic.site_title,
        ic.site_slug,
        ic.expires_at,
        ic.is_used,
        ic.created_by,
        creator.email as creator_email,
        ic.used_by,
        user_profile.email as user_email,
        ic.created_at,
        ic.used_at
    FROM public.invitation_codes ic
    LEFT JOIN public.profiles creator ON ic.created_by = creator.id
    LEFT JOIN public.profiles user_profile ON ic.used_by = user_profile.id
    ORDER BY ic.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
