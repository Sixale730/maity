import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useStatusValidation = () => {
  const navigate = useNavigate();

  const validateStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return false;
      }

      const { data: status } = await supabase.rpc('my_status');
      if (status !== 'ACTIVE') {
        navigate('/pending');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating user status:', error);
      navigate('/auth');
      return false;
    }
  };

  useEffect(() => {
    validateStatus();
    
    // Revalidate on window focus
    const handleWindowFocus = () => {
      validateStatus();
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [navigate]);

  return { validateStatus };
};
