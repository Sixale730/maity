-- Function to mark platform tour as completed
CREATE OR REPLACE FUNCTION maity.mark_tour_completed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE maity.users
  SET platform_tour_completed = TRUE
  WHERE auth_id = auth.uid();
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.mark_tour_completed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM maity.mark_tour_completed();
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.mark_tour_completed TO authenticated;
