import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Loader2 } from 'lucide-react';
import { NativeRegistrationForm } from '../components/registration/NativeRegistrationForm';

/**
 * Registration Page - Native Form
 * Shows multi-step diagnostic form to users in REGISTRATION phase
 *
 * Flow:
 * 1. Verify user session
 * 2. Check user phase (must have company_id but not registration_form_completed)
 * 3. Show native form (19 questions)
 * 4. On completion -> Redirect to dashboard
 */

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    void init();
  }, []); // Empty deps - run only once on mount

  const init = async () => {
    console.log('[Registration] 🚀 Starting init...');
    try {
      // 1) Session required
      const session = await AuthService.getSession();
      if (!session) {
        const returnTo = encodeURIComponent(window.location.href);
        navigate(`/auth?returnTo=${returnTo}`);
        return;
      }

      // 2) Check current user phase
      const statusData = await AuthService.getMyStatus();

      if (!statusData) {
        console.error('[Registration] my_status returned no data');
        navigate('/user-status-error', { replace: true });
        return;
      }

      const userStatus = statusData[0];
      console.log('[Registration] User status:', {
        id: userStatus.id,
        company_id: userStatus.company_id,
        registration_form_completed: userStatus.registration_form_completed,
        phase: userStatus.phase
      });

      // Already completed registration? -> Dashboard
      if (userStatus.registration_form_completed) {
        console.log('[Registration] User already completed registration, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }

      // No company assigned? -> Pending page
      if (!userStatus.company_id) {
        console.log('[Registration] User has no company, redirecting to pending');
        navigate('/pending', { replace: true });
        return;
      }

      // Ready to show form
      console.log('[Registration] ✅ Ready to show form, userId:', userStatus.id);
      setUserId(userStatus.id);
      setLoading(false);
    } catch (error) {
      console.error('[Registration] init error', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el formulario de registro.',
        variant: 'destructive',
      });
      navigate('/');
    }
  };

  const handleFormComplete = async () => {
    console.log('[Registration] ✅ Form completed successfully');

    try {
      // Invalidate and WAIT for queries to refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['formResponses'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'status'] }),
      ]);

      // Small delay to ensure Supabase RLS policies reflect the update
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: '¡Registro completado!',
        description: 'Tu evaluación diagnóstico ha sido guardada exitosamente.',
      });

      // Navigate after everything is ready
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('[Registration] Error invalidating queries:', error);
      // Even on error, navigate to dashboard (user completed form successfully)
      navigate('/dashboard', { replace: true });
    }
  };

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando formulario...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl sm:text-3xl">
              Evaluación Diagnóstico de Comunicación
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Completa este cuestionario para personalizar tu experiencia en Maity
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <NativeRegistrationForm userId={userId} onComplete={handleFormComplete} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;
