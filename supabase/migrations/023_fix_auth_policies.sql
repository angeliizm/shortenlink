-- Fix auth policies that might be blocking user creation

-- First, let's check if there are any problematic RLS policies on auth.users
-- and make sure user creation is not blocked

-- Ensure auth.users table allows user creation
-- Note: This is usually handled by Supabase automatically, but let's make sure

-- Check if there are any triggers or policies blocking user creation
-- Drop any custom RLS policies on auth.users that might interfere
DO $$
BEGIN
    -- Check if there are any custom policies on auth.users
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'users'
    ) THEN
        RAISE NOTICE 'Found custom policies on auth.users table';
    END IF;
END $$;

-- Ensure user_roles table allows inserts for new users
-- This might be the issue - RLS on user_roles preventing user creation
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own role (this might be needed for triggers)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own role" ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to manage all roles
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
CREATE POLICY "Service role can manage all roles" ON public.user_roles
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Ensure site_permissions table doesn't block user creation
ALTER TABLE public.site_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_permissions ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all site permissions
DROP POLICY IF EXISTS "Service role can manage all permissions" ON public.site_permissions;
CREATE POLICY "Service role can manage all permissions" ON public.site_permissions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow users to view their own permissions
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.site_permissions;
CREATE POLICY "Users can view their own permissions" ON public.site_permissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Check if there are any problematic triggers
-- List all triggers that might affect user creation
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT n.nspname as schemaname, c.relname as tablename, t.tgname as triggername, t.tgtype
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname IN ('auth', 'public')
        AND c.relname IN ('users', 'user_roles', 'site_permissions')
    LOOP
        RAISE NOTICE 'Found trigger: %.%.% on table %.%', 
            trigger_record.schemaname, 
            trigger_record.tablename, 
            trigger_record.triggername,
            trigger_record.schemaname,
            trigger_record.tablename;
    END LOOP;
END $$;
