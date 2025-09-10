-- Create function to get user emails by IDs
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email VARCHAR(255))
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR(255)
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Create function to get all users (for admin use)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(id UUID, email VARCHAR(255))
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to call this function
  IF get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR(255)
  FROM auth.users au
  ORDER BY au.created_at DESC
  LIMIT 100;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;
