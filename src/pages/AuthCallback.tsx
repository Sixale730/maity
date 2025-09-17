import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MaityLogo from '@/components/MaityLogo';

const OAUTH_STATE_STORAGE_KEY = 'maity.oauth.state';
const MAX_STATE_AGE_MS = 10 * 60 * 1000;

interface StatePayload {
  company_id: string;
  return_to?: string;
  nonce: string;
  timestamp: number;
}

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const decodeStatePayload = (encoded: string): StatePayload => {
  const normalized = encoded.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as StatePayload;
};

const sanitizeReturnTo = (value?: string) => {
  if (!value) return '/dashboard';

  try {
    if (value.startsWith('/')) {
      return value;
    }

    const parsed = new URL(value, window.location.origin);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/dashboard';
    }
  } catch (error) {
    console.warn('[DEBUG] AuthCallback:sanitizeReturnTo', { value, error });
  }

  return '/dashboard';
};

const buildDestination = (returnTo: string, companyId: string) => {
  const url = new URL(returnTo, window.location.origin);
  url.searchParams.set('company_id', companyId);
  return `${url.pathname}${url.search}${url.hash}`;
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;
        const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''));

        const code = searchParams.get('code') ?? hashParams.get('code');
        const stateParam = searchParams.get('state') ?? hashParams.get('state');
        const appStateParam = searchParams.get('app_state') ?? hashParams.get('app_state');
        const errorParam = searchParams.get('error') ?? hashParams.get('error');
        const errorDescription = searchParams.get('error_description') ?? hashParams.get('error_description');

        console.log('[DEBUG] AuthCallback:incomingParams', {
          code,
          stateParam,
          appStateParam,
          errorParam,
          errorDescription,
          href: window.location.href,
        });

        if (errorParam || errorDescription) {
          setErrorMessage(errorDescription || errorParam || 'El proveedor rechazo la autenticacion.');
          setLoading(false);
          return;
        }

        if (!appStateParam) {
          setErrorMessage('No se pudo recuperar el estado de la solicitud. Intenta nuevamente.');
          setLoading(false);
          return;
        }

        let statePayload: StatePayload;
        try {
          statePayload = decodeStatePayload(appStateParam);
        } catch (decodeError) {
          console.error('[DEBUG] AuthCallback:decodeStateFailed', decodeError);
          setErrorMessage('No se pudo validar la respuesta del proveedor.');
          setLoading(false);
          return;
        }

        console.log('[DEBUG] AuthCallback:decodedState', statePayload);

        if (!statePayload.company_id || !uuidRegex.test(statePayload.company_id)) {
          setErrorMessage('El company_id recibido no es valido.');
          setLoading(false);
          return;
        }

        if (Math.abs(Date.now() - statePayload.timestamp) > MAX_STATE_AGE_MS) {
          setErrorMessage('El enlace de autenticacion expiro. Vuelve a iniciar sesion.');
          setLoading(false);
          return;
        }

        const storedStateRaw = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
        if (!storedStateRaw) {
          setErrorMessage('No se pudo validar el estado de la solicitud OAuth. Intenta nuevamente.');
          setLoading(false);
          return;
        }

        let storedState: Partial<StatePayload> = {};
        try {
          storedState = JSON.parse(storedStateRaw);
        } catch (parseError) {
          console.warn('[DEBUG] AuthCallback:storedStateParseFailed', parseError);
        }

        sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);

        if (storedState.nonce !== statePayload.nonce) {
          setErrorMessage('No se pudo verificar la integridad de la solicitud OAuth.');
          setLoading(false);
          return;
        }

        if (storedState.company_id && storedState.company_id !== statePayload.company_id) {
          setErrorMessage('El company_id recibido no coincide con el solicitado.');
          setLoading(false);
          return;
        }

        const sanitizedReturnTo = sanitizeReturnTo(statePayload.return_to);

        const sessionResponse = await supabase.auth.getSession();
        if (sessionResponse.error) {
          throw sessionResponse.error;
        }

        let session = sessionResponse.data.session;

        if (!session) {
          if (!code) {
            setErrorMessage('No se encontro el codigo de autorizacion para completar el inicio de sesion.');
            setLoading(false);
            return;
          }

          const exchangeResult = await supabase.auth.exchangeCodeForSession({ code });
          if (exchangeResult.error || !exchangeResult.data.session) {
            console.error('[DEBUG] AuthCallback:exchangeFailed', exchangeResult.error);
            setErrorMessage('No se pudo completar el inicio de sesion con el proveedor.');
            setLoading(false);
            return;
          }

          session = exchangeResult.data.session;
        }

        if (!session?.user) {
          setErrorMessage('No se encontro la sesion del usuario.');
          setLoading(false);
          return;
        }

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('id', statePayload.company_id)
          .maybeSingle();

        if (companyError) {
          console.error('[DEBUG] AuthCallback:companyLookupError', companyError);
          setErrorMessage('No se pudo validar la empresa seleccionada.');
          setLoading(false);
          return;
        }

        if (!company) {
          setErrorMessage('La empresa especificada no existe o no esta disponible.');
          setLoading(false);
          return;
        }

        const { data: existingUser, error: existingUserError } = await supabase
          .from('maity.users')
          .select('company_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (existingUserError) {
          console.error('[DEBUG] AuthCallback:userLookupError', existingUserError);
          setErrorMessage('No se pudo validar el estado de tu perfil.');
          setLoading(false);
          return;
        }

        const existingCompanyId = existingUser?.company_id ?? null;
        const isDifferentCompany = Boolean(existingCompanyId && existingCompanyId !== statePayload.company_id);
        const finalCompanyId = existingCompanyId || statePayload.company_id;

        const userEmail = session.user.email ?? '';
        const upsertPayload = {
          id: session.user.id,
          email: userEmail,
          company_id: finalCompanyId,
          updated_at: new Date().toISOString(),
        };

        const { error: userUpsertError } = await supabase
          .from('maity.users')
          .upsert(upsertPayload, { onConflict: 'id' });

        if (userUpsertError) {
          console.error('[DEBUG] AuthCallback:userUpsertError', userUpsertError);
          setErrorMessage('No se pudo vincular tu usuario con la empresa.');
          setLoading(false);
          return;
        }

        if (isDifferentCompany) {
          toast({
            title: 'Cuenta ya asociada',
            description: 'Conservamos tu acceso a la empresa previamente asignada.',
          });
        } else {
          toast({
            title: 'Autenticacion completada',
            description: 'Tu cuenta se asocio correctamente a la empresa.',
          });
        }

        const destination = buildDestination(sanitizedReturnTo, finalCompanyId);
        console.log('[DEBUG] AuthCallback:navigate', { destination });
        navigate(destination, { replace: true });
      } catch (error) {
        console.error('[DEBUG] AuthCallback:Unexpected error', error);
        setErrorMessage('Ocurrio un error inesperado durante la autenticacion.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <MaityLogo variant="full" size="lg" />
            </div>
            <CardTitle className="font-geist text-2xl">Procesando autenticacion...</CardTitle>
            <CardDescription className="font-inter">
              Estamos completando tu inicio de sesion. Esto puede tardar unos segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <MaityLogo variant="full" size="lg" />
            </div>
            <CardTitle className="font-geist text-2xl text-destructive">Error de autenticacion</CardTitle>
            <CardDescription className="font-inter">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <button
              onClick={() => navigate('/auth_company')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-inter"
            >
              Intentar de nuevo
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;



