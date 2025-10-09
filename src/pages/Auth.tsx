import React, { useState } from 'react';

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

import { Eye, EyeOff } from "lucide-react";

import { MAITY_COLORS } from "@/lib/colors";

// Missing type and utility definitions
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

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

interface AuthProps {

  mode?: 'default' | 'company';

}

const Auth = ({ mode = 'default' }: AuthProps) => {

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

        console.log('[DEBUG] handleEmailAuth:passwordLoginSuccess', { userEmail: email, redirectTarget });

        toast({

          title: 'Bienvenido!',

          description: 'Has iniciado sesion exitosamente.',

        });

        // Preservar returnTo en la navegación al callback
        const callbackUrl = returnTo
          ? `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
          : '/auth/callback';
        navigate(callbackUrl, { replace: true });

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

          // Navegar al callback para proceso de onboarding
          const callbackUrl = returnTo
            ? `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
            : '/auth/callback';
          navigate(callbackUrl, { replace: true });
        }

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

    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4"
      style={{
        backgroundColor: MAITY_COLORS.black,
        background: `radial-gradient(ellipse at center, ${MAITY_COLORS.darkGrayAlpha(0.8)} 0%, ${MAITY_COLORS.black} 100%)`,
      }}
    >

      <Card
        className="w-full max-w-md border-0"
        style={{
          backgroundColor: MAITY_COLORS.darkGray,
          boxShadow: `0 0 60px ${MAITY_COLORS.primaryAlpha(0.15)}, 0 0 100px ${MAITY_COLORS.secondaryAlpha(0.1)}`,
        }}
      >

        <CardHeader className="text-center p-4 sm:p-6 space-y-2">

          {/* Logo con efecto neón */}
          <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
            <div
              className="text-5xl sm:text-6xl font-bold tracking-wider mb-2"
              style={{
                color: MAITY_COLORS.primary,
                textShadow: `0 0 20px ${MAITY_COLORS.primaryAlpha(0.8)}, 0 0 40px ${MAITY_COLORS.primaryAlpha(0.5)}, 0 0 60px ${MAITY_COLORS.primaryAlpha(0.3)}`,
              }}
            >
              MAITY
            </div>
            <div
              className="text-sm font-medium tracking-widest opacity-80"
              style={{ color: MAITY_COLORS.lightGray }}
            >
              Tu mentor de IA
            </div>
          </div>

          <CardTitle
            className="font-geist text-xl sm:text-2xl"
            style={{ color: MAITY_COLORS.lightGray }}
          >

            {isLogin ? 'Bienvenido de vuelta' : 'Crear Cuenta'}

          </CardTitle>

          <CardDescription
            className="font-inter text-sm sm:text-base opacity-70"
            style={{ color: MAITY_COLORS.lightGray }}
          >

            {isLogin

              ? 'Accede a tu cuenta para continuar'

              : 'Crea tu cuenta para comenzar tu transformación'

            }

          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">

          {/* OAuth Buttons */}

          <div className="space-y-2 sm:space-y-3">

            <Button

              type="button"

              variant="outline"

              size="lg"

              className="w-full font-inter text-sm sm:text-base h-11 sm:h-12 transition-all duration-300 hover:scale-[1.02]"

              style={{
                backgroundColor: MAITY_COLORS.darkGrayAlpha(0.5),
                borderColor: MAITY_COLORS.primaryAlpha(0.3),
                color: MAITY_COLORS.lightGray,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = MAITY_COLORS.primary;
                e.currentTarget.style.boxShadow = `0 0 20px ${MAITY_COLORS.primaryAlpha(0.3)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = MAITY_COLORS.primaryAlpha(0.3);
                e.currentTarget.style.boxShadow = 'none';
              }}

              onClick={() => handleOAuthLogin('google')}

              disabled={loading}

            >

              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">

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

              className="w-full font-inter text-sm sm:text-base h-11 sm:h-12 transition-all duration-300 hover:scale-[1.02]"

              style={{
                backgroundColor: MAITY_COLORS.darkGrayAlpha(0.5),
                borderColor: MAITY_COLORS.secondaryAlpha(0.3),
                color: MAITY_COLORS.lightGray,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = MAITY_COLORS.secondary;
                e.currentTarget.style.boxShadow = `0 0 20px ${MAITY_COLORS.secondaryAlpha(0.3)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = MAITY_COLORS.secondaryAlpha(0.3);
                e.currentTarget.style.boxShadow = 'none';
              }}

              onClick={() => handleOAuthLogin('azure')}

              disabled={loading}

            >

              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">

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

              <div
                className="w-full h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${MAITY_COLORS.primaryAlpha(0.3)}, transparent)`,
                }}
              />

            </div>

            <div className="relative flex justify-center text-xs uppercase">

              <span
                className="px-3 font-inter tracking-wider"
                style={{
                  backgroundColor: MAITY_COLORS.darkGray,
                  color: MAITY_COLORS.lightGrayAlpha(0.6),
                }}
              >

                O continúa con email

              </span>

            </div>

          </div>

          {/* Email Form */}

          <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4">

            <div className="space-y-2">

              <Label
                htmlFor="email"
                className="font-inter text-sm sm:text-base"
                style={{ color: MAITY_COLORS.lightGrayAlpha(0.9) }}
              >
                Correo electrónico
              </Label>

              <Input

                id="email"

                type="email"

                placeholder="tu@ejemplo.com"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

                className="font-inter text-sm sm:text-base h-10 sm:h-11 transition-all duration-200"
                style={{
                  backgroundColor: MAITY_COLORS.blackAlpha(0.5),
                  borderColor: MAITY_COLORS.primaryAlpha(0.2),
                  color: MAITY_COLORS.lightGray,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = MAITY_COLORS.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${MAITY_COLORS.primaryAlpha(0.3)}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = MAITY_COLORS.primaryAlpha(0.2);
                  e.currentTarget.style.boxShadow = 'none';
                }}

              />

            </div>

            <div className="space-y-2">

              <Label
                htmlFor="password"
                className="font-inter text-sm sm:text-base"
                style={{ color: MAITY_COLORS.lightGrayAlpha(0.9) }}
              >
                Contraseña
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  onPaste={handlePasswordPaste}
                  required
                  className="font-inter text-sm sm:text-base h-10 sm:h-11 pr-10 transition-all duration-200"
                  style={{
                    backgroundColor: MAITY_COLORS.blackAlpha(0.5),
                    borderColor: MAITY_COLORS.secondaryAlpha(0.2),
                    color: MAITY_COLORS.lightGray,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = MAITY_COLORS.secondary;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${MAITY_COLORS.secondaryAlpha(0.3)}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = MAITY_COLORS.secondaryAlpha(0.2);
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{
                    color: MAITY_COLORS.lightGrayAlpha(0.5),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = MAITY_COLORS.lightGray;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = MAITY_COLORS.lightGrayAlpha(0.5);
                  }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>

            </div>

            <Button
              type="submit"
              className="w-full font-inter text-sm sm:text-base h-10 sm:h-11 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: isLogin
                  ? `linear-gradient(135deg, ${MAITY_COLORS.primary} 0%, ${MAITY_COLORS.secondary} 100%)`
                  : `linear-gradient(135deg, ${MAITY_COLORS.accent} 0%, ${MAITY_COLORS.secondary} 100%)`,
                color: '#FFFFFF',
                border: 'none',
                boxShadow: isLogin
                  ? `0 4px 20px ${MAITY_COLORS.primaryAlpha(0.3)}`
                  : `0 4px 20px ${MAITY_COLORS.accentAlpha(0.3)}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isLogin
                  ? `0 6px 30px ${MAITY_COLORS.primaryAlpha(0.5)}`
                  : `0 6px 30px ${MAITY_COLORS.accentAlpha(0.5)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isLogin
                  ? `0 4px 20px ${MAITY_COLORS.primaryAlpha(0.3)}`
                  : `0 4px 20px ${MAITY_COLORS.accentAlpha(0.3)}`;
              }}
              disabled={loading}
            >

              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}

            </Button>

          </form>

          {/* Toggle Login/Signup */}

          <div className="text-center pt-2">

            <button

              type="button"

              onClick={() => setIsLogin(!isLogin)}

              className="text-xs sm:text-sm font-inter transition-colors"
              style={{
                color: MAITY_COLORS.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = MAITY_COLORS.secondary;
                e.currentTarget.style.textShadow = `0 0 10px ${MAITY_COLORS.secondaryAlpha(0.5)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = MAITY_COLORS.primary;
                e.currentTarget.style.textShadow = 'none';
              }}

            >

              {isLogin

                ? '¿No tienes cuenta? Regístrate'

                : '¿Ya tienes cuenta? Inicia sesión'

              }

            </button>

          </div>

          {/* Back to home */}

          <div className="text-center pt-3 sm:pt-4">

            <button

              type="button"

              onClick={() => navigate('/')}

              className="text-xs sm:text-sm font-inter transition-colors"
              style={{
                color: MAITY_COLORS.lightGrayAlpha(0.5),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = MAITY_COLORS.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = MAITY_COLORS.lightGrayAlpha(0.5);
              }}

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


