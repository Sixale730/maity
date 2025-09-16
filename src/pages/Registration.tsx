import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, ArrowLeft } from 'lucide-react';
import { createValidationToken } from '@/lib/jwt';

interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

const Registration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<any>(null);
  const [formCompleted, setFormCompleted] = useState(false);

  const companyId = searchParams.get('company');

  useEffect(() => {
    checkAuthAndCompany();
  }, [companyId]);

  const checkAuthAndCompany = async () => {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to auth with return URL
        const returnTo = encodeURIComponent(window.location.href);
        navigate(`/auth?returnTo=${returnTo}`);
        return;
      }

      setUser(session.user);

      // Check if company ID is provided
      if (!companyId) {
        toast({
          title: "Error",
          description: "No se especificó una empresa válida",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Get user info including registration status
      const { data: userInfoArray, error } = await supabase.rpc('get_user_info');
      
      if (error || !userInfoArray || userInfoArray.length === 0) {
        console.error('Error fetching user info:', error);
        toast({
          title: "Error",
          description: "Error al verificar los datos del usuario",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      const userInfo = userInfoArray[0];
      console.log('🔍 [DEBUG] Registration - User info:', userInfo);
      console.log('🔍 [DEBUG] Registration - Company ID check:', { 
        hasCompanyId: !!userInfo.company_id, 
        companyId: userInfo.company_id,
        registrationCompleted: userInfo.registration_form_completed,
        userAuthId: userInfo.auth_id 
      });

      // Check if user has company assignment (critical for Tally webhook)
      if (!userInfo.company_id) {
        console.error('❌ [DEBUG] User has no company assigned in Registration');
        toast({
          title: "Error",
          description: "No tienes una empresa asignada. Contacta al administrador.",
          variant: "destructive",
        });
        navigate('/invitation-required');
        return;
      }

      // Check if registration form is already completed
      if (userInfo.registration_form_completed) {
        console.log('✅ [DEBUG] Registration already completed, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }

      // Get company details by ID
      const { data: companyDataArray, error: companyError } = await supabase.rpc('get_company_by_id', {
        company_id: companyId
      });
      
      if (companyError || !companyDataArray || companyDataArray.length === 0) {
        console.error('Error fetching company:', companyError);
        toast({
          title: "Error",
          description: "Empresa no encontrada o inactiva",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      const companyData = companyDataArray[0];
      setCompany(companyData);
      
      // Load Tally script after company is confirmed
      loadTallyScript();
      
    } catch (error) {
      console.error('Error checking auth and company:', error);
      toast({
        title: "Error",
        description: "Error al verificar los datos",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadTallyScript = () => {
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    script.onload = () => {
      // Listen for form completion
      setupTallyListener();
    };
    document.head.appendChild(script);
  };

  const setupTallyListener = () => {
    // Listen for Tally form submission
    window.addEventListener('message', async (event) => {
      if (event.origin !== 'https://tally.so') return;
      
      if (event.data.type === 'TALLY_FORM_SUBMIT') {
        await handleFormCompletion();
      }
    });
  };

  const handleFormCompletion = async () => {
    try {
      console.log('📝 [DEBUG] Starting form completion process...');
      
      // Get current user info to verify state
      const { data: currentUserInfo } = await supabase.rpc('get_user_info');
      console.log('📝 [DEBUG] Current user info before completion:', currentUserInfo);
      
      // Mark user registration as completed
      const { error } = await supabase.rpc('complete_user_registration');
      console.log('📝 [DEBUG] Complete registration result:', { error });
      
      if (error) throw error;

      setFormCompleted(true);
      
      // Verify the update worked
      const { data: updatedUserInfo } = await supabase.rpc('get_user_info');
      console.log('📝 [DEBUG] User info after completion:', updatedUserInfo);
      
      toast({
        title: "¡Registro completado!",
        description: "Serás redirigido al dashboard en unos segundos",
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('❌ [DEBUG] Error completing registration:', error);
      console.error('❌ [DEBUG] Error details:', error.message, error.details);
      toast({
        title: "Error",
        description: "Error al completar el registro",
        variant: "destructive",
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando datos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (formCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Registro completado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Tu registro para <strong>{company?.name}</strong> ha sido completado exitosamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Serás redirigido al dashboard automáticamente...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Empresa no encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              La empresa especificada no existe o no está activa.
            </p>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          html { margin: 0; height: 100%; overflow: hidden; }
          body { margin: 0; height: 100%; overflow: hidden; }
          #root { height: 100%; }
          iframe { position: absolute; top: 0; right: 0; bottom: 0; left: 0; border: 0; }
        `}
      </style>
      <iframe 
        data-tally-src={`https://tally.so/r/wQGAyA?transparentBackground=1&companyName=${encodeURIComponent(company.name)}&companyId=${company.id}&userId=${user?.id || ''}&validationToken=${createValidationToken(user?.id || '')}&webhookUrl=${encodeURIComponent('https://nhlrtflkxoojvhbyocet.supabase.co/functions/v1/tally-webhook')}`}
        width="100%" 
        height="100%" 
        frameBorder="0" 
        marginHeight={0} 
        marginWidth={0} 
        title="Registro"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Note: user_id and validation_token are passed as URL parameters to Tally
            // They will be automatically included as hidden fields in the form submission
            console.log('Tally form loaded with user data for user: ${user?.email || ''}');
          `
        }}
      />
    </>
  );
};

export default Registration;