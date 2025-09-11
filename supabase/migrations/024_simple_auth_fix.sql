-- Simple fix for auth issues
-- Disable RLS temporarily on user_roles to allow user creation

-- Temporarily disable RLS on user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Re-enable with minimal policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" ON public.user_roles
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow users to view their own role
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Do the same for site_permissions
ALTER TABLE public.site_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_permissions ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
DROP POLICY IF EXISTS "Service role full access" ON public.site_permissions;
CREATE POLICY "Service role full access" ON public.site_permissions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow users to view their own permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON public.site_permissions;
CREATE POLICY "Users can view own permissions" ON public.site_permissions
    FOR SELECT
    USING (auth.uid() = user_id);
