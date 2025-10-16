import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { AuthService, OrganizationService } from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

// Removed UserInfo type as get_user_info is no longer used

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formCompleted, setFormCompleted] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    void checkAuthAndUser();
    const cleanupListener = setupTallyListener();
    loadTallyScript();

    return cleanupListener;
  }, []);

  const checkAuthAndUser = async () => {
    try {
      setLoading(true);

      const currentUser = await AuthService.getUser();

      if (!currentUser) {
        navigate('/auth?returnTo=/onboarding');
        return;
      }

      // Check user status instead of get_user_info
      const statusData = await AuthService.getMyStatus();

      if (statusData?.[0]?.registration_form_completed) {
        navigate('/dashboard');
        return;
      }

      try {
        await OrganizationService.provisionUser();
      } catch (provisionError) {
        console.error('Error provisioning user:', provisionError);
        toast({
          title: 'Error',
          description: `Error al configurar usuario: ${(provisionError as Error).message}`,
          variant: 'destructive',
        });
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/invitation-required');
    } finally {
      setLoading(false);
    }
  };

  const loadTallyScript = () => {
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }

    if (document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.onload = () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
        return;
      }

      document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((iframe) => {
        const htmlIframe = iframe as HTMLIFrameElement;
        const src = htmlIframe.getAttribute('data-tally-src');
        if (src) {
          htmlIframe.src = src;
        }
      });
    };
    script.onerror = () => {
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
      if (event.data?.type === 'TALLY_FORM_COMPLETED') {
        void handleFormCompletion();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  };

  const handleFormCompletion = async () => {
    try {
      await AuthService.completeOnboarding();

      setFormCompleted(true);

      toast({
        title: 'Bienvenido!',
        description: 'Onboarding completado exitosamente',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Error al completar onboarding',
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setUser(null);
    void checkAuthAndUser();
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">{t('onboarding.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" onClick={handleBack} role="button" tabIndex={0} />
              {t('onboarding.not_authorized_title')}
            </CardTitle>
            <CardDescription>
              {t('onboarding.not_authorized_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              {t('onboarding.retry_button')}
            </Button>
            <Button variant="outline" onClick={handleBack} className="w-full">
              {t('onboarding.back_button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (formCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle>{t('onboarding.success_title')}</CardTitle>
            <CardDescription>{t('onboarding.success_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              {t('onboarding.redirect_message')}
            </p>
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
        `}
      </style>
      <iframe
        data-tally-src="https://tally.so/r/wQGAyA?transparentBackground=1"
        width="100%"
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Registro"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          border: 0
        }}
      />
    </>
  );
};

export default Onboarding;


