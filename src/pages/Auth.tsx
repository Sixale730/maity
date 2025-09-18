import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";

import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";

import { resolveBaseOrigin, rebaseUrlToOrigin } from "@/lib/urlHelpers";

import { getAppUrl } from "@/lib/appUrl";

import { useNavigate } from "react-router-dom";

import MaityLogo from "@/components/MaityLogo";

import { buildRedirectTo } from '@/lib/auth'; // o ruta relativa



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

  };

  invitation_source?: string;

}



interface CompanyRecord {

  id: string;

  name: string;

}



interface AuthProps {

  mode?: 'default' | 'company';

}



const Auth = ({ mode = 'default' }: AuthProps) => {

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const appUrl = getAppUrl();

  const navigate = useNavigate();

  const baseOrigin = resolveBaseOrigin(appUrl);



  const buildDashboardUrl = () => new URL('/dashboard', baseOrigin).toString();



  const buildRegistrationUrl = (companyId: string) => {

    const url = new URL('/registration', baseOrigin);

    url.searchParams.set('company', companyId);

    return url.toString();

  };



  const buildLocalRedirect = (rawReturnTo: string | null, companyId?: string | null) => {

    const fallback = companyId ? buildRegistrationUrl(companyId) : buildDashboardUrl();



    return rebaseUrlToOrigin(rawReturnTo, baseOrigin, fallback, (url) => {

      if (!companyId) {

        return;

      }



      const hasCompanyParam = url.searchParams.has('company') || url.searchParams.has('company_id');

      if (!hasCompanyParam) {

        url.searchParams.set('company', companyId);

      }

    });

  };

  const isCompanyMode = mode === 'company';

  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');

  const isValidUUID = (value: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

  const fetchCompanyById = async (companyId: string): Promise<CompanyRecord | null> => {

    if (!companyId) {

      return null;

    }

    try {

      const { data, error } = await supabase.rpc('get_company_by_id', {

        company_id: companyId,

      });

      if (error) {

        console.error('[DEBUG] Error fetching company by ID:', error);

        return null;

      }

      if (!data || data.length === 0) {

        return null;

      }

      const record = data[0] as CompanyInfo;



      console.log('[DEBUG] fetchCompanyById:success', { companyId, name: record.name });



      return { id: record.id, name: record.name };



    } catch (error) {

      console.error('[DEBUG] Unexpected error fetching company by ID:', error);

      return null;

    }

  };





  // Helper function to assign company to user (simplified)

  const assignCompanyToUser = async (companyId: string, userId: string, userEmail: string) => {

    console.log('[DEBUG] Starting simple company assignment:', {

      companyId,

      userId,

      userEmail

    });



    try {

      const { data: result, error } = await supabase.rpc('assign_company_simple', {

        user_auth_id: userId,

        company_slug: companyId

      });



      if (error) {

        console.error('[DEBUG] Database error in company assignment:', error);

        throw error;

      }



      const assignmentResult = parseAssignCompanyResult(result);

      console.log('[DEBUG] Company assignment result:', assignmentResult);



      if (!assignmentResult.success) {

        console.error('[DEBUG] Company assignment failed:', assignmentResult);



        if (assignmentResult.error === 'USER_NOT_FOUND') {

          toast({

            title: 'Error',

            description: 'Usuario no encontrado en el sistema.',

            variant: 'destructive',

          });

        } else if (assignmentResult.error === 'COMPANY_NOT_FOUND') {

          toast({

            title: 'Error',

            description: 'La empresa no fue encontrada o esta inactiva.',

            variant: 'destructive',

          });

        }

        return false;

      }



      toast({

        title: 'Exito!',

        description: `Te has unido a ${assignmentResult.company_name}`,

        variant: 'default',

      });



      return true;

    } catch (error) {

      console.error('[DEBUG] Unexpected error in assignCompanyToUser:', error);

      return false;

    }

  };



  const extractCompanyId = (params: URLSearchParams) => {



    const entries = Object.fromEntries(params.entries());



    console.log('[DEBUG] extractCompanyId:start', { entries });



    const directCompanyId = params.get('company');



    if (directCompanyId) {



      console.log('[DEBUG] extractCompanyId:direct', { directCompanyId });



      return directCompanyId;



    }







    const returnParam = params.get('returnTo') || params.get('returnUrl');



    if (!returnParam) {



      console.log('[DEBUG] extractCompanyId:noCompanyParam', { entries });



      return null;



    }







    let decodedReturn = returnParam;



    try {



      decodedReturn = decodeURIComponent(returnParam);



    } catch (decodeError) {



      console.warn('[DEBUG] extractCompanyId:decodeFailed', { returnParam, decodeError });



    }







    try {



      const parsedUrl = new URL(decodedReturn, appUrl);



      const nestedCompany = parsedUrl.searchParams.get('company');



      console.log('[DEBUG] extractCompanyId:nested', { decodedReturn, nestedCompany });



      return nestedCompany;



    } catch (parseError) {



      console.error('[DEBUG] extractCompanyId:parseFailed', { decodedReturn, parseError });



      return null;



    }



  };











  // Check if user is already authenticated



  useEffect(() => {



    const urlParams = new URLSearchParams(window.location.search);



    const companyId = extractCompanyId(urlParams);

    setCompanyIdFieldValue(companyId ?? '');



    console.log('[DEBUG] Auth useEffect:init', {



      companyId,



      urlParams: Object.fromEntries(urlParams.entries()),



      locationSearch: window.location.search,



    });







    // Check for existing session first



    supabase.auth.getSession().then(({ data: { session } }) => {



      console.log('[DEBUG] Auth getSession', {



        hasSession: !!session,



        userId: session?.user?.id,



        companyId,



      });



      if (session?.user) {



        handleLoggedInUser(session.user, companyId);



      }



    });







    // Set up auth state listener



    const { data: { subscription } } = supabase.auth.onAuthStateChange(



      async (event, session) => {



        console.log('[DEBUG] Auth onAuthStateChange', {



          event,



          hasSessionUser: !!session?.user,



          companyId,



        });



        if (event === 'SIGNED_IN' && session?.user) {



          handleLoggedInUser(session.user, companyId);



        }



      }



    );







    return () => subscription.unsubscribe();



  }, []);









  const handleLoggedInUser = async (user: any, companyId: string | null) => {

    try {

      console.log('[DEBUG] === STARTING handleLoggedInUser ===');

      console.log('[DEBUG] Input params:', {

        userId: user.id, 

        email: user.email, 

        companyId,

        userMetadata: user.user_metadata 

      });



      let targetCompanyId: string | null = null;

      let targetCompanyName: string | null = null;



      if (companyId) {

        if (!isValidUUID(companyId)) {

          toast({

            title: "Error",

            description: "El identificador de la empresa no es valido.",

            variant: "destructive",

          });

          navigate('/invitation-required');

          return;

        }



        const companyRecord = await fetchCompanyById(companyId);

        console.log('[DEBUG] Resolved company from parameter:', { companyId, companyRecord });

        if (!companyRecord) {

          toast({

            title: "Error",

            description: "La empresa no fue encontrada o esta inactiva.",

            variant: "destructive",

          });

          navigate('/invitation-required');

          return;

        }



        targetCompanyId = companyRecord.id;

        targetCompanyName = companyRecord.name;

      }



      // Get current user info first (now searches by email if auth_id is null)

      let { data: userInfoArray, error } = await supabase.rpc('get_user_info');

      console.log('[DEBUG] handleLoggedInUser:getUserInfoInitial', { userInfoArray, error });

      

      // If user found but auth_id is null, update it

      if (userInfoArray && userInfoArray.length > 0 && !userInfoArray[0].auth_id) {

        console.log('[DEBUG] handleLoggedInUser:missingAuthIdUpdating');

        const { error: updateError } = await supabase.rpc('update_user_auth_status', {

          user_auth_id: user.id,

          user_email: user.email

        });

        console.log('[DEBUG] handleLoggedInUser:updateAuthStatus', { updateError });

        

        // Refresh user info after updating auth_id

        const { data: refreshedUserInfo, error: refreshError } = await supabase.rpc('get_user_info');

        console.log('[DEBUG] handleLoggedInUser:refreshedUserInfo', { refreshedUserInfo, refreshError });

        if (refreshedUserInfo && refreshedUserInfo.length > 0) {

          userInfoArray = refreshedUserInfo;

        }

      }

      

      // If no user info found, provision the user first

      if (!userInfoArray || userInfoArray.length === 0) {

        console.log('[DEBUG] handleLoggedInUser:provisioningFreshUser');

        

        if (targetCompanyId) {

          console.log('[DEBUG] handleLoggedInUser:provisionWithCompany', targetCompanyId);

          const { data: provisionResult, error: provisionError } = await supabase.rpc('provision_user_with_company', {

            company_slug: targetCompanyId,

            invitation_source: window.location.href

          });



          console.log('[DEBUG] handleLoggedInUser:provisionResult', { provisionResult, provisionError });



          const result = parseProvisionWithCompanyResult(provisionResult);

          if (provisionError || !result?.success) {

            console.error('[DEBUG] Failed to provision user with company:', provisionError, result);

            navigate('/invitation-required');

            return;

          }



          console.log('[DEBUG] handleLoggedInUser:provisionSuccess', result);

          toast({

            title: targetCompanyName ? `Bienvenido a ${targetCompanyName}` : 'Bienvenido!',

            description: `Te has unido a ${result.company_name}`,

          });

        } else {

          // Provision user without company

          await supabase.rpc('provision_user');

        }

        

        // Get user info after provisioning

        const { data: newUserInfoArray, error: newError } = await supabase.rpc('get_user_info');

        console.log('[DEBUG] handleLoggedInUser:userInfoAfterProvisioning', { newUserInfoArray, newError });

        if (newError || !newUserInfoArray || newUserInfoArray.length === 0) {

          console.error('[DEBUG] Failed to get user info after provisioning:', newError);

          navigate('/invitation-required');

          return;

        }

        userInfoArray = newUserInfoArray;

      } 

      // If user exists but has company in URL, try to assign it

      else if (targetCompanyId) {

        console.log('[DEBUG] handleLoggedInUser:assignExistingUser');

        console.log('[DEBUG] handleLoggedInUser:beforeAssignmentState', userInfoArray[0]);



        const assigned = await assignCompanyToUser(targetCompanyId, user.id, user.email);

        if (!assigned) {

          console.log('[DEBUG] handleLoggedInUser:assignmentFailedRedirect');

          navigate('/invitation-required');

          return;

        }

        console.log('[DEBUG] handleLoggedInUser:assignmentSucceeded');



        // Refresh user info after assignment

        const { data: updatedUserInfoArray, error: updateError } = await supabase.rpc('get_user_info');

        console.log('[DEBUG] handleLoggedInUser:userInfoAfterAssignment', { updatedUserInfoArray, updateError });

        if (updatedUserInfoArray && updatedUserInfoArray.length > 0) {

          userInfoArray = updatedUserInfoArray;

        }

      }

      const userInfo = userInfoArray[0];

      console.log('[DEBUG] handleLoggedInUser:finalStateBanner');

      console.log('[DEBUG] handleLoggedInUser:finalUserInfo', userInfo);

      console.log('[DEBUG] handleLoggedInUser:companyCheck', { 

        hasCompanyId: !!userInfo.company_id, 

        companyId: userInfo.company_id,

        registrationCompleted: userInfo.registration_form_completed 

      });



      // Check if user has company assignment

      if (!userInfo.company_id) {

        console.log('[DEBUG] handleLoggedInUser:noCompanyRedirect');

        navigate('/invitation-required');

        return;

      }



      // Check registration status

      if (!userInfo.registration_form_completed) {

        console.log('[DEBUG] handleLoggedInUser:needsRegistration');

        console.log('[DEBUG] handleLoggedInUser:redirectingToRegistration', userInfo.company_id);

        navigate(`/registration?company=${userInfo.company_id}`);

        return;

      }



      // User is fully set up, redirect appropriately



      const urlParams = new URLSearchParams(window.location.search);



      const rawReturnTo = urlParams.get('returnTo');



      const returnTo = rawReturnTo || '/dashboard';



      let decodedReturnTo: string | null = null;



      if (rawReturnTo) {



        try {



          decodedReturnTo = decodeURIComponent(rawReturnTo);



        } catch (error) {



          console.warn('[DEBUG] handleLoggedInUser:decodeReturnToFailed', { rawReturnTo, error });



        }



      }



      console.log('[DEBUG] handleLoggedInUser:finalRedirect', {



        locationSearch: window.location.search,



        rawReturnTo,



        decodedReturnTo,



        destination: returnTo,



      });



      navigate(returnTo);



      console.log('[DEBUG] handleLoggedInUser:complete', { destination: returnTo });



      

    } catch (error) {

      console.error('[DEBUG] handleLoggedInUser:error', error);

      console.error('[DEBUG] handleLoggedInUser:errorStack', error.stack);

      toast({

        title: "Error",

        description: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",

        variant: "destructive",

      });

      navigate('/invitation-required');

    }

  };



  const handleEmailAuth = async (e: React.FormEvent) => {



    e.preventDefault();



    setLoading(true);







    const urlParams = new URLSearchParams(window.location.search);



    const returnTo = urlParams.get('returnTo') || urlParams.get('returnUrl');



    const companyId = extractCompanyId(urlParams);

    setCompanyIdFieldValue(companyId ?? '');



    console.log('[DEBUG] handleEmailAuth:start', {



      isLogin,



      email,



      hasPassword: Boolean(password),



      returnTo,



      companyId,



      locationSearch: window.location.search,



    });







    const redirectTarget = buildLocalRedirect(returnTo, companyId);

    console.log('[DEBUG] handleEmailAuth:redirectTarget', { returnTo, companyId, redirectTarget });







    try {



      if (isLogin) {



        const { error } = await supabase.auth.signInWithPassword({



          email,



          password,



        });



        if (error) throw error;



        console.log('[DEBUG] handleEmailAuth:passwordLoginSuccess', { userEmail: email, redirectTarget });







        toast({



          title: 'Bienvenido!',



          description: 'Has iniciado sesion exitosamente.',



        });



      } else {



        if (!companyId) {



          toast({



            title: 'Invitacion requerida',



            description: 'Necesitas un enlace de invitacion valido para crear una cuenta.',



            variant: 'destructive',



          });



          navigate('/invitation-required');



          return;



        }







        const { error } = await supabase.auth.signUp({



          email,



          password,



          options: {



            emailRedirectTo: redirectTarget



          }



        });



        if (error) throw error;



        console.log('[DEBUG] handleEmailAuth:signUpSuccess', { userEmail: email, companyId, redirectTarget });







        toast({



          title: 'Cuenta creada!',



          description: 'Revisa tu correo para confirmar tu cuenta.',



        });



      }



    } catch (error) {



      toast({



        title: 'Error',



        description: error.message || 'Ocurrio un error inesperado.',



        variant: 'destructive',



      });



    } finally {



      setLoading(false);



    }



  };







  const handleOAuthLogin = async (provider: 'google' | 'azure') => {

    setLoading(true);

  

    const urlParams = new URLSearchParams(window.location.search);

    const returnTo  = urlParams.get('returnTo') || urlParams.get('returnUrl');

    const companyId = extractCompanyId?.(urlParams) ?? null;

    setCompanyIdFieldValue(companyId ?? '');

  

    const redirectTarget = buildRedirectTo(returnTo, companyId);

    console.debug('[AUTH] provider=', provider, { returnTo, companyId, redirectTarget });

  

    try {

      const { error } = await supabase.auth.signInWithOAuth({

        provider,

        options: { redirectTo: redirectTarget }

      });

      if (error) throw error;

    } catch (e: any) {

      toast({

        title: 'Error',

        description: e?.message ?? 'No se pudo conectar con el proveedor.',

        variant: 'destructive',

      });

    } finally {

      setLoading(false); // en éxito real redirige antes de llegar aquí

    }

  };

  



  return (

    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <Card className="w-full max-w-md">

        <CardHeader className="text-center">

          <div className="flex justify-center mb-4">

            <MaityLogo variant="full" size="lg" />

          </div>

          <CardTitle className="font-geist text-2xl">

            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}

          </CardTitle>

          <CardDescription className="font-inter">

            {isLogin 

              ? 'Accede a tu cuenta para continuar' 

              : 'Crea tu cuenta para comenzar tu transformación'

            }

          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-4">

          {/* OAuth Buttons */}

          <div className="space-y-3">

            <Button

              type="button"

              variant="outline"

              size="lg"

              className="w-full font-inter"

              onClick={() => handleOAuthLogin('google')}

              disabled={loading}

            >

              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">

                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>

                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>

                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>

                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>

              </svg>

              Continuar con Google

            </Button>

            

            <Button

              type="button"

              variant="outline"

              size="lg"

              className="w-full font-inter"

              onClick={() => handleOAuthLogin('azure')}

              disabled={loading}

            >

              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">

                <path fill="#00BCF2" d="M11.4 24H0V12.6L11.4 24z"/>

                <path fill="#0078D4" d="M24 24H11.4V12.6L24 24z"/>

                <path fill="#40E0D0" d="M11.4 0v11.4L0 0h11.4z"/>

                <path fill="#0078D4" d="M24 11.4V0H12.6L24 11.4z"/>

              </svg>

              Continuar con Microsoft

            </Button>

          </div>



          <div className="relative">

            <div className="absolute inset-0 flex items-center">

              <Separator />

            </div>

            <div className="relative flex justify-center text-xs uppercase">

              <span className="bg-background px-2 text-muted-foreground font-inter">

                O continúa con email

              </span>

            </div>

          </div>



          {/* Email Form */}

          <form onSubmit={handleEmailAuth} className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="email" className="font-inter">Correo electrónico</Label>

              <Input

                id="email"

                type="email"

                placeholder="tu@ejemplo.com"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

                className="font-inter"

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="password" className="font-inter">Contraseña</Label>

              <Input

                id="password"

                type="password"

                placeholder="********"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                required

                className="font-inter"

              />

            </div>

            <Button type="submit" className="w-full font-inter" disabled={loading}>

              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}

            </Button>

          </form>



          {/* Toggle Login/Signup */}

          <div className="text-center">

            <button

              type="button"

              onClick={() => setIsLogin(!isLogin)}

              className="text-sm text-primary hover:underline font-inter"

            >

              {isLogin 

                ? '¿No tienes cuenta? Regístrate' 

                : '¿Ya tienes cuenta? Inicia sesión'

              }

            </button>

          </div>



          {/* Back to home */}

          <div className="text-center pt-4">

            <button

              type="button"

              onClick={() => navigate('/')}

              className="text-sm text-muted-foreground hover:underline font-inter"

            >

              ← Volver al inicio

            </button>

          </div>

        </CardContent>

      </Card>

    </div>

  );

};



export default Auth;













