import { useState, useEffect } from 'react';
import { supabase } from '../../../api/client/supabase';

export interface OnboardingStatus {
  isCompleted: boolean;
  completedAt: string | null;
  loading: boolean;
  error: string | null;
}

export const useOnboardingStatus = () => {
  const [status, setStatus] = useState<OnboardingStatus>({
    isCompleted: false,
    completedAt: null,
    loading: true,
    error: null
  });

  const checkOnboardingStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus({
          isCompleted: false,
          completedAt: null,
          loading: false,
          error: null
        });
        return;
      }

      // Check onboarding status using my_status function that accesses maity.users
      const { data: statusResult } = await supabase.rpc('my_status');
      
      // For now, we'll use a simple approach - if user has ACTIVE status and has completed registration_form
      // In the future, we can create a specific RPC for onboarding status
      const { data, error } = await supabase.rpc('complete_user_registration');
      
      if (error && error.code !== 'PGRST301') { // Ignore "No data returned" error
        console.error('Error checking onboarding status:', error);
        setStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Error al verificar estado de onboarding' 
        }));
        return;
      }

      // For now, assume onboarding is completed if user has active status
      // This will be enhanced when we have proper onboarding_completed_at field access
      setStatus({
        isCompleted: statusResult?.[0]?.registration_form_completed || false,
        completedAt: statusResult?.[0]?.registration_form_completed ? new Date().toISOString() : null,
        loading: false,
        error: null
      });

    } catch (err) {
      console.error('Error in checkOnboardingStatus:', err);
      setStatus(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al verificar estado de onboarding' 
      }));
    }
  };

  useEffect(() => {
    checkOnboardingStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setTimeout(() => {
          checkOnboardingStatus();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...status,
    refresh: checkOnboardingStatus
  };
};
