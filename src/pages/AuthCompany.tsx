import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import MaityLogo from "@/components/MaityLogo";
import { useCompanyAssociation } from "@/hooks/useCompanyAssociation";
import { persistCompanyId, getPersistedCompanyId, isValidUUID } from "@/lib/companyPersistence";

interface InvitationResult {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
  company_name?: string;
  current_company?: {
    id: string;
    name: string;
  };
  target_company?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CompanyRecord {
  id: string;
  name: string;
  slug: string;
}

const AuthCompany: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { associateUserWithCompany } = useCompanyAssociation();
  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // AC-2: State for validation and button blocking
  const [isCompanyIdValid, setIsCompanyIdValid] = useState(true);
  const [showMissingCompanyWarning, setShowMissingCompanyWarning] = useState(false);

  // Fetch company by ID
  const fetchCompanyById = async (companyId: string): Promise<CompanyRecord | null> => {
    if (!companyId) {
      return null;
    }

    try {
      const { data: records, error } = await supabase.rpc('get_company_by_id', {
        company_id: companyId,
      });

      if (error) {
        console.error('[DEBUG] fetchCompanyById:error', error);
        return null;
      }

      if (!records || records.length === 0) {
        console.warn('[DEBUG] fetchCompanyById:notFound', { companyId });
        return null;
      }

      const record = records[0];
      console.log('[DEBUG] fetchCompanyById:success', { companyId, name: record.name });
      
      return {
        id: record.id,
        name: record.name,
        slug: record.slug,
      };
    } catch (error) {
      console.error('[DEBUG] fetchCompanyById:exception', { companyId, error });
      return null;
    }
  };

  // Assign company to user after they're logged in  
  const assignCompanyToUser = async (companySlug: string, userId: string, userEmail: string) => {
    console.log('[DEBUG] assignCompanyToUser:start', {
      companySlug,
      userId,
      userEmail
    });

    try {
      const { data: result, error } = await supabase.rpc('assign_company_simple', {
        user_auth_id: userId,
        company_slug: companySlug
      });

      if (error) {
        console.error('[DEBUG] Database error in company assignment:', error);
        throw error;
      }

      const assignmentResult = result as any;
      console.log('[DEBUG] assignCompanyToUser:success', assignmentResult);

      if (assignmentResult?.success) {
        toast({
          title: "✅ Asociación exitosa",
          description: `Asignado a la empresa: ${assignmentResult.company_name}`,
        });

        console.log('[DEBUG] assignCompanyToUser:navigatingToDashboard', { userId });
        navigate('/dashboard');
      } else {
        console.error('[DEBUG] assignCompanyToUser:failedAssignment', assignmentResult);
        toast({
          title: "❌ Error en la asignación",
          description: assignmentResult?.message || 'No se pudo asignar la empresa',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('[DEBUG] assignCompanyToUser:exception', { companySlug, userId, error });
      toast({
        title: "❌ Error en la asignación",
        description: error.message || 'Error interno del servidor',
        variant: "destructive"
      });
    }
  };

  // AC-1: Extract company_id from URL and persist it
  const extractCompanyId = (params: URLSearchParams) => {
    const entries = Array.from(params.entries());
    console.log('[DEBUG] extractCompanyId:start', { entries });

    const directCompanyId = params.get('company');
    
    if (directCompanyId) {
      console.log(`[AC-1] Querystring leído: company_id=${directCompanyId}`);
      return directCompanyId;
    }

    const returnParam = params.get('return');
    if (!returnParam) {
      console.log('[DEBUG] extractCompanyId:noCompanyParam', { entries });
      return null;
    }

    try {
      const decodedReturn = decodeURIComponent(returnParam);
      console.log('[DEBUG] extractCompanyId:decoding', { returnParam, decodedReturn });

      const nestedCompany = new URL(decodedReturn).searchParams.get('company');
      console.log('[DEBUG] extractCompanyId:nested', { decodedReturn, nestedCompany });
      
      if (nestedCompany) {
        console.log(`[AC-1] Querystring leído: company_id=${nestedCompany}`);
      }
      return nestedCompany;
    } catch (parseError) {
      console.error('[DEBUG] extractCompanyId:parseFailed', { decodedReturn: returnParam, parseError });
      return null;
    }
  };

  // AC-1 & AC-2: Initialize and validate company_id
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let companyId = extractCompanyId(urlParams);
    
    // AC-1: Try to get from persisted storage if not in URL
    if (!companyId) {
      companyId = getPersistedCompanyId();
      if (companyId) {
        console.log(`[AC-1] company_id recuperado de persistencia: ${companyId}`);
      }
    }

    setCompanyIdFieldValue(companyId ?? '');

    console.log('[DEBUG] Auth useEffect:init', {
      companyId,
      isValidUUID: companyId ? isValidUUID(companyId) : false,
    });

    // AC-1: Persist company_id if valid
    if (companyId && isValidUUID(companyId)) {
      persistCompanyId(companyId);
      setIsCompanyIdValid(true);
      setShowMissingCompanyWarning(false);
      
      fetchCompanyById(companyId).then(company => {
        if (company) {
          setCompanyName(company.name);
        }
      });
    } else {
      // AC-2: Show warning and block buttons if company_id is missing or invalid
      if (!companyId) {
        console.log('[AC-2] Advertencia: company_id ausente — bloqueando botones');
        setShowMissingCompanyWarning(true);
        setIsCompanyIdValid(false);
      } else {
        console.log('[AC-2] Advertencia: company_id inválido — bloqueando botones');
        setIsCompanyIdValid(false);
        setShowMissingCompanyWarning(true);
      }
    }

    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[DEBUG] Auth useEffect:sessionFound', {
          companyId,
          userId: session.user?.id
        });
        handleLoggedInUser(session.user, companyId);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[DEBUG] Auth state change', { event, session: !!session, companyId });
        if (session) {
          console.log('[DEBUG] Auth useEffect:authStateChange', {
            companyId,
            userId: session.user?.id
          });
          handleLoggedInUser(session.user, companyId);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLoggedInUser = async (user: any, companyId: string | null) => {
    console.log('[DEBUG] handleLoggedInUser:start', {
      userId: user.id,
      userEmail: user.email,
      companyId,
    });

    let targetCompanyId: string | null = null;

    // Process company ID from URL parameter
    if (companyId) {
      if (!isValidUUID(companyId)) {
        console.warn('[DEBUG] handleLoggedInUser:invalidUUID', { companyId });
        toast({
          title: "Error de configuración",
          description: "El ID de empresa en la URL no es válido.",
          variant: "destructive"
        });
        return;
      }

      const companyRecord = await fetchCompanyById(companyId);
      console.log('[DEBUG] Resolved company from parameter:', { companyId, companyRecord });

      if (!companyRecord) {
        console.warn('[DEBUG] handleLoggedInUser:companyNotFound', { companyId });
        toast({
          title: "Empresa no encontrada", 
          description: "La empresa especificada no existe o no está activa.",
          variant: "destructive"
        });
        return;
      } else {
        console.log('[DEBUG] handleLoggedInUser:companyFound', companyRecord);
        setCompanyName(companyRecord.name);
        targetCompanyId = companyRecord.id;
      }
    }

    // Check user's current company status
    const { data: userInfoArray } = await supabase.rpc('get_user_info', {
      user_auth_id: user.id
    } as any);

    console.log('[DEBUG] handleLoggedInUser:userInfoResponse', { userInfoArray });

    if (!userInfoArray || userInfoArray.length === 0) {
      console.log('[DEBUG] handleLoggedInUser:provisioningFreshUser');
      
      if (targetCompanyId) {
        console.log('[DEBUG] handleLoggedInUser:provisionWithCompany', targetCompanyId);
        const { data: provisionResult, error: provisionError } = await supabase.rpc('provision_user_with_company', {
          company_slug: targetCompanyId,
          invitation_source: window.location.href
        });

        console.log('[DEBUG] handleLoggedInUser:provisionResult', { provisionResult, provisionError });

        if (provisionError) {
          console.error('[DEBUG] handleLoggedInUser:provisionError', provisionError);
          toast({
            title: "Error de configuración",
            description: "No se pudo asociar el usuario con la empresa.",
            variant: "destructive"
          });
          return;
        }

        const result = provisionResult as any;
        if (result?.success) {
          toast({
            title: "✅ Cuenta configurada",
            description: `Bienvenido a ${result.company_name}`,
          });
          navigate('/dashboard');
        } else {
          console.error('[DEBUG] handleLoggedInUser:provisionFailed', result);
          toast({
            title: "Error de configuración", 
            description: result?.message || "No se pudo configurar tu cuenta.",
            variant: "destructive"
          });
        }
      }
      else if (targetCompanyId) {
        // Company exists in URL, assign it
        console.log('[DEBUG] handleLoggedInUser:assigningFromUrl', { targetCompanyId });
        
        const associationResult = await associateUserWithCompany(user.id, targetCompanyId, user.email);
        console.log('[DEBUG] handleLoggedInUser:associationResult', associationResult);

        if (associationResult.success) {
          toast({
            title: "✅ Asociación exitosa",
            description: `Has sido asignado a la empresa.`,
          });
          navigate('/dashboard');
        } else {
          console.error('[DEBUG] handleLoggedInUser:associationFailed', associationResult);
          toast({
            title: "❌ Error en la asociación",
            description: associationResult.message || 'No se pudo asignar la empresa',
            variant: "destructive"
          });
        }
      } else {
        console.log('[DEBUG] handleLoggedInUser:noCompanyProvided');
        navigate('/registration');
      }
      return;
    }

    // User already exists
    const userInfo = userInfoArray[0];
    console.log('[DEBUG] handleLoggedInUser:existingUser', {
      hasCompanyId: !!userInfo.company_id, 
      companyId: userInfo.company_id,
      registrationCompleted: userInfo.registration_form_completed
    });

    // If user exists but no company in URL, check if they have company_id in metadata (from email signup)
    if (!userInfo.company_id) {
      console.log('[DEBUG] handleLoggedInUser:noCompanyAssigned');
      if (userInfo.registration_form_completed) {
        navigate('/dashboard');
      } else {
        console.log('[DEBUG] handleLoggedInUser:redirectingToRegistration', userInfo.company_id);
        navigate(`/registration?company=${userInfo.company_id}`);
      }
    } else {
      // User has a company
      if (userInfo.registration_form_completed) {
        console.log('[DEBUG] handleLoggedInUser:existingUserWithCompany');
        navigate('/dashboard');
      } else {
        console.log('[DEBUG] handleLoggedInUser:redirectingToOnboarding');
        navigate('/onboarding');
      }
    }
  };

  // AC-3: Handle email authentication with logging
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa email y contraseña.",
        variant: "destructive"
      });
      return;
    }

    // AC-2: Block if company_id is invalid
    if (!isCompanyIdValid) {
      toast({
        title: "Company ID requerido",
        description: "No se puede proceder sin un company_id válido en la URL.",
        variant: "destructive"
      });
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = extractCompanyId(urlParams);
    setCompanyIdFieldValue(companyId ?? '');

    console.log(`[AC-3] Lanzando login (email) → redirect=callback`);

    const returnTo = window.location.href;
    let redirectTarget: string;

    try {
      if (companyId) {
        redirectTarget = `${window.location.origin}/registration?company=${companyId}`;
      } else {
        redirectTarget = `${window.location.origin}/registration`;
      }
    } catch (error) {
      redirectTarget = `${window.location.origin}/registration`;
    }

    console.log('[DEBUG] handleEmailAuth:redirectTarget', { returnTo, companyId, redirectTarget });

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        console.log('[DEBUG] handleEmailAuth:loginSuccess', { userEmail: email, companyId, redirectTarget });
      } else {
        // Sign up
        if (!companyId) {
          toast({
            title: "Company ID requerido",
            description: "No se puede registrar sin especificar una empresa.",
            variant: "destructive"
          });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTarget,
            data: {
              company_id: companyId // Store company_id in user metadata for later association
            }
          }
        });

        if (error) throw error;
        
        console.log('[DEBUG] handleEmailAuth:signUpSuccess', { userEmail: email, companyId, redirectTarget });
        
        toast({
          title: "Registro exitoso",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      }
    } catch (error: any) {
      console.error('[DEBUG] handleEmailAuth:error', error);
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // AC-3: Handle OAuth login with logging
  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    // AC-2: Block if company_id is invalid
    if (!isCompanyIdValid) {
      toast({
        title: "Company ID requerido",
        description: "No se puede proceder sin un company_id válido en la URL.",
        variant: "destructive"
      });
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = extractCompanyId(urlParams);
    
    setCompanyIdFieldValue(companyId ?? '');

    console.log(`[AC-3] Lanzando login (provider=${provider}) → redirect=callback`);

    if (!companyId) {
      console.error('[AC-2] company_id ausente durante OAuth');
      toast({
        title: 'Company ID requerido',
        description: 'Este enlace de acceso necesita un company_id válido.',
        variant: 'destructive'
      });
      return;
    }

    if (!isValidUUID(companyId)) {
      console.error('[AC-2] company_id inválido durante OAuth', { companyId });
      toast({
        title: 'Company ID inválido',
        description: 'El company_id proporcionado no es válido.',
        variant: 'destructive'
      });
      return;
    }

    // Create OAuth state with company info for callback
    const createOAuthState = (): string => {
      const stateData = {
        company_id: companyId,
        timestamp: Date.now(),
        return_to: window.location.href,
      };
      
      const stateString = JSON.stringify(stateData);
      console.log('[DEBUG] handleOAuthLogin:creatingState', { 
        stateData, 
        stateString,
        encodedLength: btoa(stateString).length
      });
      
      return btoa(stateString);
    };

    const encodedState = createOAuthState();
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
    redirectUrl.searchParams.set('app_state', encodedState);

    console.log('[DEBUG] handleOAuthLogin:redirectTarget', {
      provider,
      companyId,
      redirectUrl: redirectUrl.toString(),
      encodedStateLength: encodedState.length,
    });

    console.log(`[AC-4] Smoke test OK: redirección saliente y retorno a callback (${provider})`);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('[DEBUG] AuthCompany: OAuth error', error);
      toast({
        title: 'Error',
        description: error.message || `Error al conectar con ${provider}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <MaityLogo className="mx-auto h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {companyName ? `Acceso para ${companyName}` : 'Ingresa tus credenciales para continuar'}
              </p>
            </div>
          </div>

          {/* AC-2: Warning message when company_id is missing */}
          {showMissingCompanyWarning && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="text-destructive">⚠️</div>
                  <div>
                    <p className="font-medium text-destructive">Company ID requerido</p>
                    <p className="text-sm text-muted-foreground">
                      Este enlace necesita un company_id válido para continuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || !isCompanyIdValid}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !isCompanyIdValid}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !isCompanyIdValid}
                >
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  O continúa con
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading || !isCompanyIdValid}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleOAuthLogin('azure')}
                  disabled={loading || !isCompanyIdValid}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4z"/>
                    <path d="M24 11.4H12.6V0H24v11.4z"/>
                  </svg>
                  Microsoft
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={loading || !isCompanyIdValid}
                  className="text-sm text-muted-foreground"
                >
                  {isLogin 
                    ? '¿No tienes cuenta? Crear una nueva' 
                    : '¿Ya tienes cuenta? Iniciar sesión'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div>Company ID: {companyIdFieldValue || 'N/A'}</div>
                  <div>Company Name: {companyName || 'N/A'}</div>
                  <div>Valid: {isCompanyIdValid ? 'Sí' : 'No'}</div>
                  <div>Warning: {showMissingCompanyWarning ? 'Sí' : 'No'}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCompany;