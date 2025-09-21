import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useStatusValidation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToAuth = () => {
    if (location.pathname !== '/auth') {
      navigate('/auth', { replace: true });
    }
  };

  const validateStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirectToAuth();
        return false;
      }

      const { data: status } = await supabase.rpc('my_status');
      if (status !== 'ACTIVE') {
        redirectToAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating user status:', error);
      redirectToAuth();
      return false;
    }
  };

  useEffect(() => {
    validateStatus();

    const handleWindowFocus = () => {
      validateStatus();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [location.pathname, navigate]);

  return { validateStatus };
};
