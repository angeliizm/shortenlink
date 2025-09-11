-- Fix RLS policies for invitation_codes to allow service role access
-- Service role should bypass RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Admin and moderator can view all invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Admin and moderator can create invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Admin and moderator can update invitation codes" ON public.invitation_codes;

-- Create new policies that allow service role access
CREATE POLICY "Service role and admin can view all invitation codes" ON public.invitation_codes
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Service role and admin can create invitation codes" ON public.invitation_codes
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Service role and admin can update invitation codes" ON public.invitation_codes
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'moderator')
        )
    );

-- Also fix user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;

CREATE POLICY "Service role and users can view roles" ON public.user_roles
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        user_id = auth.uid()
    );

CREATE POLICY "Service role can manage user roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'service_role');

-- Fix site_permissions table policies
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.site_permissions;
DROP POLICY IF EXISTS "Service role can manage permissions" ON public.site_permissions;

CREATE POLICY "Service role and users can view permissions" ON public.site_permissions
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        user_id = auth.uid()
    );

CREATE POLICY "Service role can manage permissions" ON public.site_permissions
    FOR ALL USING (auth.role() = 'service_role');
