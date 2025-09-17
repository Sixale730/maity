import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MaityLogo from '@/components/MaityLogo';
import { COMPANY_ID_COOKIE, COMPANY_ID_KEY, persistCompanyId, isValidUUID } from '@/lib/companyPersistence';
import { getAppUrl } from '@/lib/appUrl';

const OAUTH_STATE_STORAGE_KEY = 'maity.oauth.state';
const MAX_STATE_AGE_MS = 10 * 60 * 1000;

type CompanyResolutionSource = 'query' | 'cookie' | 'localStorage' | 'state';

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

    const parsed = new URL(value, getAppUrl());
    if (parsed.origin === getAppUrl()) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/dashboard';
    }
  } catch (error) {
    console.warn('[DEBUG] AuthCallback:sanitizeReturnTo', { value, error });
  }

  return '/dashboard';
};

const buildDestination = (returnTo: string, companyId: string) => {
  const url = new URL(returnTo, getAppUrl());
  url.searchParams.set('company_id', companyId);
  return `${url.pathname}${url.search}${url.hash}`;
};

const getCompanyIdFromCookie = (): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COMPANY_ID_COOKIE && value) {
      return value;
    }
  }

  return null;
};

const getCompanyIdFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(COMPANY_ID_KEY);
  } catch (error) {
    console.warn('[CB-3] No se pudo acceder a localStorage para recuperar company_id', error);
    return null;
  }
};

const resolveCompanyId = (stateCompanyId?: string): { companyId: string | null; source: CompanyResolutionSource | null } => {
  if (typeof window === 'undefined') {
    return { companyId: null, source: null };
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('company_id') ?? params.get('company');
  if (fromQuery) {
    if (isValidUUID(fromQuery)) {
      console.log(`[CB-3] company_id resuelto desde query: ${fromQuery}`);
      return { companyId: fromQuery, source: 'query' };
    }
    console.warn('[CB-3] company_id de query invalido', { fromQuery });
  }

  const fromCookie = getCompanyIdFromCookie();
  if (fromCookie) {
    if (isValidUUID(fromCookie)) {
      console.log(`[CB-3] company_id resuelto desde cookie: ${fromCookie}`);
      return { companyId: fromCookie, source: 'cookie' };
    }
    console.warn('[CB-3] company_id de cookie invalido', { fromCookie });
  }

  const fromLocalStorage = getCompanyIdFromLocalStorage();
  if (fromLocalStorage) {
    if (isValidUUID(fromLocalStorage)) {
      console.log(`[CB-3] company_id resuelto desde localStorage: ${fromLocalStorage}`);
      return { companyId: fromLocalStorage, source: 'localStorage' };
    }
    console.warn('[CB-3] company_id de localStorage invalido', { fromLocalStorage });
  }

  if (stateCompanyId && isValidUUID(stateCompanyId)) {
    console.log(`[CB-3] company_id resuelto desde estado OAuth: ${stateCompanyId}`);
    return { companyId: stateCompanyId, source: 'state' };
  }

  console.error('[CB-3][ERROR] No se encontro company_id - abortando enlace');
  return { companyId: null, source: null };
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const appUrl = getAppUrl();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorActionPath, setErrorActionPath] = useState('/auth_company');
  const [errorActionLabel, setErrorActionLabel] = useState('Intentar de nuevo');

  useEffect(() => {
    console.log('[CB-1] Callback cargado - esperando sesion Supabase');

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
          console.log('[CB-7][ERROR] Enlace fallido - motivo: proveedor rechazo la autenticacion', { errorParam, errorDescription });
          setErrorMessage(errorDescription || errorParam || 'El proveedor rechazo la autenticacion.');
          setLoading(false);
          return;
        }

        if (!appStateParam) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: estado ausente');
          setErrorMessage('No se pudo recuperar el estado de la solicitud. Intenta nuevamente.');
          setLoading(false);
          return;
        }

        let statePayload: StatePayload;
        try {
          statePayload = decodeStatePayload(appStateParam);
        } catch (decodeError) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: decode state', decodeError);
          setErrorMessage('No se pudo validar la respuesta del proveedor.');
          setLoading(false);
          return;
        }

        console.log('[DEBUG] AuthCallback:decodedState', statePayload);

        if (!statePayload.company_id || !uuidRegex.test(statePayload.company_id)) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: company_id en estado invalido', statePayload);
          setErrorMessage('El company_id recibido no es valido.');
          setLoading(false);
          return;
        }

        if (Math.abs(Date.now() - statePayload.timestamp) > MAX_STATE_AGE_MS) {
          console.warn('[CB-7][ERROR] Enlace fallido - motivo: estado expirado', { timestamp: statePayload.timestamp });
          setErrorMessage('El enlace de autenticacion expiro. Vuelve a iniciar sesion.');
          setLoading(false);
          return;
        }

        const storedStateRaw = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
        if (!storedStateRaw) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: estado en sessionStorage ausente');
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
          console.error('[CB-7][ERROR] Enlace fallido - motivo: nonce no coincide', { storedNonce: storedState.nonce, stateNonce: statePayload.nonce });
          setErrorMessage('No se pudo verificar la integridad de la solicitud OAuth.');
          setLoading(false);
          return;
        }

        if (storedState.company_id && storedState.company_id !== statePayload.company_id) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: company_id en estado previo no coincide', {
            storedCompanyId: storedState.company_id,
            stateCompanyId: statePayload.company_id,
          });
          setErrorMessage('El company_id recibido no coincide con el solicitado.');
          setLoading(false);
          return;
        }

        const sanitizedReturnTo = sanitizeReturnTo(statePayload.return_to);

        const { companyId: resolvedCompanyId, source: resolvedSource } = resolveCompanyId(statePayload.company_id);
        if (!resolvedCompanyId) {
          setErrorMessage('No se pudo identificar la empresa para completar el enlace.');
          setLoading(false);
          return;
        }

        if (statePayload.company_id && resolvedSource !== 'state' && statePayload.company_id !== resolvedCompanyId) {
          console.error('[CB-3][ERROR] El company_id recuperado no coincide con el enviado en estado', {
            stateCompanyId: statePayload.company_id,
            resolvedCompanyId,
            resolvedSource,
          });
          setErrorMessage('La empresa especificada no coincide con la esperada.');
          setLoading(false);
          return;
        }

        persistCompanyId(resolvedCompanyId);

        const sessionResponse = await supabase.auth.getSession();
        if (sessionResponse.error) {
          throw sessionResponse.error;
        }

        let session = sessionResponse.data.session;

        if (!session) {
          if (!code) {
            console.error('[CB-7][ERROR] Enlace fallido - motivo: codigo de autorizacion ausente');
            setErrorMessage('No se encontro el codigo de autorizacion para completar el inicio de sesion.');
            setLoading(false);
            return;
          }

          const exchangeResult = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeResult.error || !exchangeResult.data.session) {
            console.error('[CB-7][ERROR] Enlace fallido - motivo: intercambio de codigo', exchangeResult.error);
            setErrorMessage('No se pudo completar el inicio de sesion con el proveedor.');
            setLoading(false);
            return;
          }

          session = exchangeResult.data.session;
        }

        if (!session?.user) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: sesion sin usuario');
          setErrorMessage('No se encontro la sesion del usuario.');
          setLoading(false);
          return;
        }

        console.log(`[CB-2] Sesion detectada - user.id=${session.user.id}`);
        const provider = (session.user as any)?.app_metadata?.provider;
        if (provider) {
          console.log(`[CB-2] Proveedor detectado: ${provider}`);
        }

        const { data: companyLookup, error: companyLookupError } = await supabase
          .rpc('get_company_by_id', { company_id: resolvedCompanyId });

        if (companyLookupError) {
          console.error('[CB-4][ERROR] RPC fallo - get_company_by_id', companyLookupError);
          setErrorMessage('No se pudo validar la empresa seleccionada.');
          setLoading(false);
          return;
        }

        if (!Array.isArray(companyLookup) || companyLookup.length === 0 || !companyLookup[0]) {
          console.error('[CB-3][ERROR] company_id valido pero sin registro', { resolvedCompanyId });
          setErrorMessage('La empresa especificada no existe o no esta disponible.');
          setLoading(false);
          return;
        }

        const { data: userInfo, error: userInfoError } = await supabase.rpc('get_user_info', {
          user_auth_id: session.user.id,
        } as any);

        if (userInfoError) {
          console.error('[CB-7][ERROR] Enlace fallido - motivo: get_user_info', userInfoError);
          setErrorMessage('No se pudo validar el estado de tu cuenta.');
          setLoading(false);
          return;
        }

        const userRecord = Array.isArray(userInfo) && userInfo.length > 0 ? userInfo[0] : null;
        const existingCompanyId = userRecord?.company_id ?? null;

        if (existingCompanyId) {
          console.log('[CB-7][ERROR] Enlace fallido - motivo: usuario ya asociado a empresa', {
            existingCompanyId,
            userId: session.user.id,
          });
          setErrorMessage('Tu cuenta ya esta asociada a una empresa activa. Ingresa desde el portal principal.');
          setErrorActionPath('/auth');
          setErrorActionLabel('Ir a login principal');
          console.log('[CB-7] Accion usuario: Volver a /auth');
          setLoading(false);
          return;
        }

        console.log(`[CB-4] RPC link_user_company_by_company_id -> company_id=${resolvedCompanyId}`);
        const { data: linkResult, error: linkError } = await supabase.rpc('link_user_company_by_company_id', {
          company_id: resolvedCompanyId,
          user_auth_id: session.user.id,
        } as any);

        if (linkError || !(linkResult as any)?.success) {
          console.error('[CB-4][ERROR] RPC fallo -', linkError || linkResult);
          setErrorMessage('No se pudo vincular tu usuario con la empresa.');
          setLoading(false);
          return;
        }

        console.log('[CB-4] RPC OK - usuario enlazado a compania');

        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          console.log('[CB-5] Sesion refrescada tras enlace');
        } else if (refreshError) {
          console.warn('[CB-5] No se pudo refrescar la sesion', refreshError);
        }

        toast({
          title: 'Autenticacion completada',
          description: 'Tu cuenta se asocio correctamente a la empresa.',
        });

        const destination = buildDestination(sanitizedReturnTo, resolvedCompanyId);
        console.log(`[CB-6] Redirigiendo a ${destination}`);
        navigate(destination, { replace: true });
      } catch (error) {
        console.error('[CB-7][ERROR] Enlace fallido - motivo: error inesperado', error);
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
              onClick={() => navigate(errorActionPath)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-inter"
            >
              {errorActionLabel}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

