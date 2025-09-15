import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formCompleted, setFormCompleted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndUser();
    setupTallyListener();
    loadTallyScript();
  }, []);

  const checkAuthAndUser = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth?returnTo=/onboarding');
        return;
      }

      // Provision user in maity schema
      const { error: provisionError } = await supabase.rpc('provision_user');
      if (provisionError) {
        console.error('Error provisioning user:', provisionError);
        toast({
          title: "Error",
          description: "Error al configurar usuario",
          variant: "destructive",
        });
      }

      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
      navigate('/auth?returnTo=/onboarding');
    }
  };

  const loadTallyScript = () => {
    // Check if Tally is already loaded
    if ((window as any).Tally) {
      (window as any).Tally.loadEmbeds();
      return;
    }
    
    // Check if script is already present
    if (document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.onload = () => {
      if ((window as any).Tally) {
        (window as any).Tally.loadEmbeds();
      } else {
        // Fallback for iframes
        document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((iframe) => {
          const htmlIframe = iframe as HTMLIFrameElement;
          const src = htmlIframe.getAttribute('data-tally-src');
          if (src) {
            htmlIframe.src = src;
          }
        });
      }
    };
    script.onerror = () => {
      // Fallback for iframes
      document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((iframe) => {
        const htmlIframe = iframe as HTMLIFrameElement;
        const src = htmlIframe.getAttribute('data-tally-src');
        if (src) {
          htmlIframe.src = src;
        }
      });
    };
    document.body.appendChild(script);
  };

  const setupTallyListener = () => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for Tally form completion
      if (event.data.type === 'TALLY_FORM_COMPLETED') {
        handleFormCompletion();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  };

  const handleFormCompletion = async () => {
    try {
      // Complete onboarding in database
      const { error } = await supabase.rpc('complete_onboarding');
      
      if (error) {
        console.error('Error completing onboarding:', error);
        toast({
          title: "Error",
          description: "Error al completar onboarding",
          variant: "destructive",
        });
        return;
      }

      setFormCompleted(true);
      
      toast({
        title: "¡Bienvenido!",
        description: "Onboarding completado exitosamente",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error in form completion:', error);
      toast({
        title: "Error",
        description: "Error al procesar formulario",
        variant: "destructive",
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Verificando datos...</p>
        </div>
      </div>
    );
  }

  if (formCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">¡Bienvenido a Maity!</CardTitle>
            <CardDescription>
              Tu onboarding ha sido completado exitosamente. Serás redirigido al dashboard en breve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Necesitas iniciar sesión para acceder al onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Iniciar Sesión
            </Button>
            <Button variant="outline" onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate validation token (simple approach for now)
  const validationToken = btoa(`${user.id}:${Date.now()}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">¡Bienvenido a Maity!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Completa tu perfil para comenzar a usar la plataforma
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tally Form Embed */}
          <iframe 
            data-tally-src={`https://tally.so/embed/wQGAyA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&redirectURL=${encodeURIComponent(`${window.location.origin}/onboarding/success?token=${validationToken}&rid={{response_id}}`)}`}
            loading="lazy" 
            width="100%" 
            height="587" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0} 
            title="Registro"
            className="min-h-[587px] w-full bg-background rounded-lg border"
          />
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={handleBackToHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;