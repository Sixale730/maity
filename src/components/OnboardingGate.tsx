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

      // For now, we'll use a simple RPC call to check if onboarding is completed
      // This will be enhanced when we have better access to maity.users table
      const { data: status } = await supabase.rpc('my_status' as any);
      
      if (status !== 'ACTIVE') {
        navigate('/pending');
        return;
      }

      // For the initial implementation, we'll assume onboarding is needed
      // In a real implementation, you would check the onboarding_completed_at field
      // from maity.users table through an RPC function
      
      // Check if user has completed registration (existing logic)
      // This is a temporary approach until we have proper onboarding status RPC
      try {
        const { error } = await supabase.rpc('complete_user_registration' as any);
        // If this doesn't error, user exists and registration is completed
        setOnboardingCompleted(true);
      } catch (err) {
        // User might not have completed onboarding
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