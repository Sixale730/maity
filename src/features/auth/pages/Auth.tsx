import React, { useState, useEffect } from 'react';

import { Button } from "@/ui/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";

import { Input } from "@/ui/components/ui/input";

import { Label } from "@/ui/components/ui/label";

import { Separator } from "@/ui/components/ui/separator";

import { useToast } from "@/shared/hooks/use-toast";

import { supabase, AuthService } from "@maity/shared";

import { resolveBaseOrigin, rebaseUrlToOrigin, getAppUrl } from "@maity/shared";

import { useNavigate } from "react-router-dom";

import MaityLogo from "@/shared/components/MaityLogo";

import { Eye, EyeOff } from "lucide-react";

import { env } from "@/lib/env";

// Missing type and utility definitions
// getErrorMessage defined for future error handling
// const getErrorMessage = (error: any): string => {
//   if (typeof error === 'string') return error;
//   if (error?.message) return error.message;
//   return 'An unexpected error occurred';
// };

// Unused interface - kept for future use
// interface InvitationResult {
//   success: boolean;
//   action?: string;
//   message?: string;
//   error?: string;
//   company_name?: string;
//   current_company?: {
//     id: string;
//     name: string;
//   };
//   target_company?: {
//     id: string;
//     name: string;
//   };
//   invitation_source?: string;
// }

interface AuthProps {

  mode?: 'default' | 'company';

}

const Auth = ({ mode: _mode = 'default' }: AuthProps) => {

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [showPasswordWarning, setShowPasswordWarning] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();

  const appUrl = getAppUrl();

  const navigate = useNavigate();

  const baseOrigin = resolveBaseOrigin(appUrl);

  // Pre-fill from query params (e.g., from landing signup form)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const modeParam = params.get('mode');

    if (modeParam === 'signup') {
      setIsLogin(false);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const buildDashboardUrl = () => new URL('/dashboard', baseOrigin).toString();

  const buildLocalRedirect = (rawReturnTo: string | null) => {

    const fallback = buildDashboardUrl();

    return rebaseUrlToOrigin(rawReturnTo, baseOrigin, fallback);

  };


  // Validar espacios en contraseña al pegar
  const handlePasswordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    if (pastedText.includes(' ')) {
      setShowPasswordWarning(true);
      // Quitar espacios del texto pegado
      const cleanedText = pastedText.replace(/\s/g, '');
      setPassword(cleanedText);

      toast({
        title: 'Espacios detectados',
        description: 'Tu contraseña parece contener espacios al principio o al final. Asegúrate de que esto es intencional, ya que el sistema distingue entre espacios y caracteres. Si copiste y pegaste tu contraseña, por favor, comprueba que no incluiste espacios accidentales.',
        variant: 'default',
      });
    } else {
      setPassword(pastedText);
    }
  };

  // Validar espacios al escribir
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(' ') && !showPasswordWarning) {
      setShowPasswordWarning(true);
      toast({
        title: 'Espacios detectados',
        description: 'Tu contraseña contiene espacios. Asegúrate de que esto es intencional.',
        variant: 'default',
      });
    }
    setPassword(value);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);

    const urlParams = new URLSearchParams(window.location.search);

    const returnTo = urlParams.get('returnTo') || urlParams.get('returnUrl');

    const redirectTarget = buildLocalRedirect(returnTo);


    console.log('[DEBUG] handleEmailAuth:start', {

      isLogin,

      email,

      hasPassword: Boolean(password),

      returnTo,

      locationSearch: window.location.search,

    });

    console.log('[DEBUG] handleEmailAuth:redirectTarget', { returnTo, redirectTarget });


    try {

      if (isLogin) {

        const { error } = await supabase.auth.signInWithPassword({

          email,

          password,

        });

        if (error) throw error;

        console.log('[DEBUG] handleEmailAuth:passwordLoginSuccess', { userEmail: email, returnTo });

        toast({

          title: 'Bienvenido!',

          description: 'Has iniciado sesion exitosamente.',

        });

        // Use centralized post-login service
        console.log('[Auth] Calling handlePostLogin service...');
        const result = await AuthService.handlePostLogin({
          returnTo,
          apiUrl: env.apiUrl,
          skipInviteCheck: false
        });

        console.log('[Auth] Post-login processing completed:', result);
        navigate(result.destination, { replace: true });

        return;

      } else {


        const { error } = await supabase.auth.signUp({

          email,

          password,

          options: {

            emailRedirectTo: redirectTarget

          }

        });

        if (error) throw error;

        console.log('[DEBUG] handleEmailAuth:signUpSuccess', { userEmail: email, redirectTarget });

        // Auto-login después del registro
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          toast({
            title: 'Cuenta creada!',
            description: 'Por favor inicia sesión con tu nueva cuenta.',
          });
          setIsLogin(true);
        } else {
          toast({
            title: 'Bienvenido!',
            description: 'Tu cuenta ha sido creada exitosamente.',
          });

          // Use centralized post-login service for signup flow too
          console.log('[Auth] Calling handlePostLogin service after signup...');
          const result = await AuthService.handlePostLogin({
            returnTo,
            apiUrl: env.apiUrl,
            skipInviteCheck: false
          });

          console.log('[Auth] Post-login processing completed:', result);
          navigate(result.destination, { replace: true });
        }

      }

    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || '';

      // Handle specific authentication errors
      if (isLogin && errorMessage.toLowerCase().includes('invalid login credentials')) {
        // Check if user exists to provide more specific error message
        try {
          const userExists = await AuthService.checkUserExistsByEmail(email);

          if (!userExists) {
            // User doesn't exist - offer to create account
            toast({
              title: 'Cuenta no encontrada',
              description: 'No existe una cuenta con este email. ¿Quieres crear una?',
              variant: 'destructive',
            });

            // Automatically switch to signup mode after a short delay
            setTimeout(() => {
              setIsLogin(false);
            }, 2000);
          } else {
            // User exists but password is wrong
            toast({
              title: 'Contraseña incorrecta',
              description: 'Por favor verifica tu contraseña e intenta nuevamente.',
              variant: 'destructive',
            });
          }
        } catch (checkError) {
          // Fallback to generic message if check fails
          console.error('Error checking user existence:', checkError);
          toast({
            title: 'Error de autenticación',
            description: 'Credenciales inválidas. Por favor verifica tu email y contraseña.',
            variant: 'destructive',
          });
        }
      } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
        // Email not confirmed error
        toast({
          title: 'Email no confirmado',
          description: 'Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
          variant: 'destructive',
        });
      } else {
        // Other errors - show generic message
        toast({
          title: 'Error',
          description: errorMessage || 'Ocurrió un error inesperado.',
          variant: 'destructive',
        });
      }

    } finally {

      setLoading(false);

    }

  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {

    setLoading(true);

    const redirectTarget = new URL('/auth/callback', baseOrigin).toString();

    console.debug('[AUTH/OAuth] redirectTarget=', redirectTarget);

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

            {isLogin ? (
              <MaityLogo variant="full" size="lg" />
            ) : (
              <img
                src="/lovable-uploads/maity_logo_rojo.png"
                alt="Maity Logo"
                className="h-12 w-auto"
              />
            )}

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

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  onPaste={handlePasswordPaste}
                  required
                  className="font-inter pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

            </div>

            <Button
              type="submit"
              className={`w-full font-inter ${
                isLogin
                  ? 'bg-[hsl(var(--maity-blue))] hover:opacity-90 text-white border-0'
                  : 'bg-[hsl(var(--maity-pink))] hover:opacity-90 text-white border-0'
              }`}
              disabled={loading}
            >

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


