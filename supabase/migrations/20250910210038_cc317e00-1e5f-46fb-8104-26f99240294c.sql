-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_companies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_company(uuid) TO authenticated;

-- Create RLS policies for function execution (if needed)
-- The functions already have SECURITY DEFINER so they should work with proper permissions