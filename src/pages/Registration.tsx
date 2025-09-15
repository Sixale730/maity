import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, ArrowLeft } from 'lucide-react';

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

  const companySlug = searchParams.get('org');

  useEffect(() => {
    checkAuthAndCompany();
  }, [companySlug]);

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

      // Check if company slug is provided
      if (!companySlug) {
        toast({
          title: "Error",
          description: "No se especificó una empresa válida",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // First check if user already has this company assigned
      const { data: userData, error: userError } = await supabase
        .from('maity.users')
        .select('company_id, companies!inner(name, slug)')
        .eq('auth_id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast({
          title: "Error",
          description: "Error al verificar los datos del usuario",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // If user already has the correct company assigned, use that
      if (userData?.company_id && userData.companies?.slug === companySlug) {
        setCompany({
          id: userData.company_id,
          name: userData.companies.name,
          slug: userData.companies.slug,
          plan: 'standard', // Default plan
          timezone: 'UTC', // Default timezone
          is_active: true,
          created_at: new Date().toISOString()
        });
        loadTallyScript();
        return;
      }

      // If user doesn't have the company or has a different one, try to assign it
      if (companySlug !== 'privada') {
        try {
          await supabase.rpc('assign_user_to_company', {
            user_auth_id: session.user.id,
            company_slug: companySlug
          });
          console.log('Successfully assigned user to company:', companySlug);
        } catch (error) {
          console.error('Error assigning user to company:', error);
          toast({
            title: "Error",
            description: "No se pudo asignar la empresa. Contacta al administrador.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      }

      // Fetch company by slug to get full details
      const { data: companyData, error: companyError } = await supabase
        .rpc('get_company_by_slug', { company_slug: companySlug });

      if (companyError || !companyData || companyData.length === 0) {
        toast({
          title: "Error",
          description: "Empresa no encontrada o inactiva",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCompany(companyData[0]);
      
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
      // Mark user registration as completed
      const { error } = await supabase.rpc('complete_user_registration');
      
      if (error) throw error;

      setFormCompleted(true);
      
      toast({
        title: "¡Registro completado!",
        description: "Serás redirigido al dashboard en unos segundos",
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error completing registration:', error);
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
        data-tally-src={`https://tally.so/r/wQGAyA?transparentBackground=1&company=${encodeURIComponent(company.name)}&userId=${user?.id || ''}`}
        width="100%" 
        height="100%" 
        frameBorder="0" 
        marginHeight={0} 
        marginWidth={0} 
        title="Registro"
      />
    </>
  );
};

export default Registration;