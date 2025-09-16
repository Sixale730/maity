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

      // Get user info using RPC function
      const { data: userInfoArray, error } = await supabase.rpc('get_user_info');
      
      if (error || !userInfoArray || userInfoArray.length === 0) {
        console.error('Error fetching user info:', error);
        // If user not found in our system, redirect to invitation required
        navigate('/invitation-required');
        return;
      }

      const userInfo = userInfoArray[0];

      // Check if user status is not ACTIVE
      if (userInfo.status !== 'ACTIVE') {
        navigate('/pending');
        return;
      }

      // Check if user has no company assigned
      if (!userInfo.company_id) {
        navigate('/invitation-required');
        return;
      }

      // Check if user needs to complete registration form
      if (!userInfo.registration_form_completed) {
        navigate(`/registration?company=${userInfo.company_id}`);
        return;
      }

      // User is ready for dashboard
      setOnboardingCompleted(true);
      setLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      navigate('/invitation-required');
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