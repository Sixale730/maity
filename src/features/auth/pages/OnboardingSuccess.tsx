import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OnboardingSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    validateAndCompleteOnboarding();
  }, []);

  const validateAndCompleteOnboarding = async () => {
    try {
      setLoading(true);
      
      const token = searchParams.get('token');
      const responseId = searchParams.get('rid');
      
      if (!token) {
        setError('Token de validación no encontrado');
        setLoading(false);
        return;
      }

      // Validate token (simple validation for now)
      try {
        const tokenData = atob(token);
        const [userId, timestamp] = tokenData.split(':');
        
        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
          setError('Token de validación expirado');
          setLoading(false);
          return;
        }

        // Verify user is authenticated and matches token
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== userId) {
          setError('Token de validación inválido');
          setLoading(false);
          return;
        }

      } catch (tokenError) {
        setError('Token de validación malformado');
        setLoading(false);
        return;
      }

      // Complete onboarding (idempotent - safe to call multiple times)
      const { error: completeError } = await supabase.rpc('complete_onboarding');
      
      if (completeError) {
        console.error('Error completing onboarding:', completeError);
        setError('Error al completar onboarding');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      toast({
        title: "¡Onboarding Completado!",
        description: "Tu perfil ha sido configurado exitosamente",
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error in onboarding validation:', error);
      setError('Error al validar onboarding');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <CardTitle>Validando información...</CardTitle>
            <CardDescription>
              Procesando tu onboarding
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Error en Onboarding</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/onboarding')} className="w-full">
              Volver al Onboarding
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">¡Onboarding Completado!</CardTitle>
          <CardDescription>
            Tu perfil ha sido configurado exitosamente. Serás redirigido al dashboard automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Ir al Dashboard Ahora
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Redirección automática en 3 segundos...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSuccess;