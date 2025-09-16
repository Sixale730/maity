import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // Get comprehensive user info
      const { data: userInfo } = await supabase.rpc('get_user_info' as any);
      
      if (!userInfo) {
        navigate('/onboarding');
        return;
      }

      // Check if user needs to complete registration form
      if (userInfo.company_id && !userInfo.registration_form_completed) {
        navigate(`/registration?company=${userInfo.company_id}`);
        return;
      }

      // Check if user has completed registration
      if (userInfo.registration_form_completed) {
        setOnboardingCompleted(true);
      } else {
        navigate('/onboarding');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      navigate('/onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Verificando estado...</p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return null; // Will redirect to onboarding
  }

  return <>{children}</>;
};