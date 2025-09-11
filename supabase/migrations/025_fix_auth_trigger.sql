-- Fix for auth trigger to allow user registration
-- The issue is that the trigger function needs proper permissions to insert into user_roles

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS assign_default_role();

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert the default role for new user
    INSERT INTO public.user_roles (user_id, role, assigned_by, notes)
    VALUES (NEW.id, 'pending', NULL, 'Otomatik atanan başlangıç rolü')
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate entries
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Could not assign default role: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant necessary permissions to the function
ALTER FUNCTION public.assign_default_role() OWNER TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.assign_default_role();

-- Also ensure the user_roles table has proper RLS policies for the trigger
-- Add a policy that allows the trigger function to insert
DROP POLICY IF EXISTS "System can create default roles" ON public.user_roles;
CREATE POLICY "System can create default roles" ON public.user_roles
    FOR INSERT 
    WITH CHECK (true); -- Allow inserts from the trigger function

-- Ensure existing users without roles get a default role
INSERT INTO public.user_roles (user_id, role, assigned_by, notes)
SELECT 
    id as user_id,
    'pending' as role,
    NULL as assigned_by,
    'Retroactively assigned default role' as notes
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'Auth trigger fixed successfully!' as message;