-- Fix user_roles RLS policy to allow users to update their own roles (for development purposes)

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;

-- Create updated policy that allows users to manage their own roles
CREATE POLICY "Only admins can manage roles" ON user_roles
    FOR ALL USING (
        get_user_role() = 'admin' OR 
        user_id = auth.uid()
    );
