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
  invitation_source?: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to handle company invitations using company slug
  const handleCompanyInvitation = async (companySlug: string, userId: string, userEmail: string) => {
    if (!companySlug) {
      // No company specified, just provision the user normally
      await supabase.rpc('provision_user');
      return { success: true, shouldRedirectToRegistration: false, needsConfirmation: false };
    }

    try {
      console.log('🏢 Processing company invitation with sync:', {
        companySlug,
        userId,
        userEmail
      });
      
      // Use the new handle_user_company_invitation function
      const { data: result, error } = await supabase.rpc('handle_user_company_invitation', {
        user_auth_id: userId,
        user_email: userEmail,
        company_slug: companySlug,
        invitation_source: window.location.href,
        force_assign: false // Don't force assign, let it handle conflicts
      });

      if (error) {
        throw error;
      }

      const invitationResult = result as unknown as InvitationResult;
      console.log('✅ Company invitation result:', invitationResult);

      if (invitationResult.success) {
        if (invitationResult.action === 'ASSIGNED' || invitationResult.action === 'NO_CHANGE') {
          return { 
            success: true, 
            shouldRedirectToRegistration: true, 
            needsConfirmation: false,
            companyName: invitationResult.company_name 
          };
        }
      } else if (invitationResult.action === 'CONFIRMATION_REQUIRED') {
        // Store conflict data for the confirmation page
        const conflictData = {
          current_company: invitationResult.current_company,
          target_company: invitationResult.target_company,
          invitation_source: invitationResult.invitation_source
        };
        sessionStorage.setItem('invitation_conflict', JSON.stringify(conflictData));
        
        return { 
          success: true, 
          shouldRedirectToRegistration: false, 
          needsConfirmation: true,
          conflictData
        };
      }

      // Fallback for any other case
      console.log('Falling back to normal provision due to unexpected result:', invitationResult);
      await supabase.rpc('provision_user');
      return { success: true, shouldRedirectToRegistration: false, needsConfirmation: false };
      
    } catch (error: any) {
      console.error('❌ Error processing company invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la invitación de empresa. Continuando con registro normal.",
        variant: "destructive",
      });
      // Fallback to normal provision
      await supabase.rpc('provision_user');
      return { success: true, shouldRedirectToRegistration: false, needsConfirmation: false };
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    // Get return URL from query params - support both returnTo and returnUrl
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || urlParams.get('returnUrl');
    const company = urlParams.get('company');

    // Helper function to get redirect URL
    const getRedirectUrl = () => {
      if (returnTo) {
        return decodeURIComponent(returnTo);
      }
      if (company) {
        return `/registration?company=${company}`;
      }
      return '/dashboard'; // Default if no company specified
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Handle company invitation first
        const companySlug = urlParams.get('company');
        if (companySlug) {
          const invitationResult = await handleCompanyInvitation(
            companySlug, 
            session.user.id, 
            session.user.email || ''
          );
          
          if (invitationResult.needsConfirmation) {
            // User needs to confirm company change
            navigate('/invitation-confirm');
            return;
          }
          
          if (invitationResult.shouldRedirectToRegistration) {
            // User was successfully assigned to company, go directly to registration
            window.location.href = getRedirectUrl();
            return;
          }
        }
        
        const { data: status } = await supabase.rpc('my_status' as any);
        if (status === 'ACTIVE') {
          window.location.href = getRedirectUrl();
        } else if (status === 'PENDING' || status === 'SUSPENDED') {
          navigate('/pending');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === 'SIGNED_IN') {
        // Handle company invitation first
        const companySlug = urlParams.get('company');
        if (companySlug) {
          const invitationResult = await handleCompanyInvitation(
            companySlug, 
            session.user.id, 
            session.user.email || ''
          );
          
          if (invitationResult.needsConfirmation) {
            // User needs to confirm company change
            navigate('/invitation-confirm');
            return;
          }
          
          if (invitationResult.shouldRedirectToRegistration) {
            // User was successfully assigned to company, go directly to registration
            window.location.href = getRedirectUrl();
            return;
          }
        }
        
        const { data: status } = await supabase.rpc('my_status' as any);
        if (status === 'ACTIVE') {
          window.location.href = getRedirectUrl();
        } else if (status === 'PENDING' || status === 'SUSPENDED') {
          navigate('/pending');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get return URL from query params - support both returnTo and returnUrl
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || urlParams.get('returnUrl');
    const company = urlParams.get('company');

    // Helper function to get redirect URL
    const getRedirectUrl = () => {
      if (returnTo) {
        return decodeURIComponent(returnTo);
      }
      if (company) {
        return `${window.location.origin}/registration?company=${company}`;
      }
      return `${window.location.origin}/dashboard`; // Default if no company specified
    };

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Handle company invitation first if company parameter exists
        const urlParams = new URLSearchParams(window.location.search);
        const companySlug = urlParams.get('company');
        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data.user;
        
        if (companySlug && user) {
          const invitationResult = await handleCompanyInvitation(
            companySlug, 
            user.id, 
            user.email || ''
          );
          
          if (invitationResult.needsConfirmation) {
            // User needs to confirm company change
            navigate('/invitation-confirm');
            return;
          }
          
          if (invitationResult.shouldRedirectToRegistration) {
            // User was successfully assigned to company, go directly to registration
            window.location.href = getRedirectUrl();
            return;
          }
        }
        
        // Check user status after handling invitation
        const { data: status } = await supabase.rpc('my_status' as any);
        if (status === 'ACTIVE') {
          window.location.href = getRedirectUrl();
          return;
        } else if (status === 'PENDING' || status === 'SUSPENDED') {
          navigate('/pending');
          return;
        }
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente.",
        });
      } else {
        // Sign up flow - get company parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const companyId = urlParams.get('company');
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getRedirectUrl()
          }
        });
        if (error) throw error;
        
        // After successful signup, provision user with company if company parameter exists
        if (companyId) {
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const invitationResult = await handleCompanyInvitation(
                companyId, 
                userData.user.id, 
                userData.user.email || email
              );
              
              if (invitationResult.success) {
                console.log('User provisioned successfully with company:', companyId);
                if (invitationResult.companyName) {
                  toast({
                    title: "¡Asignado a empresa!",
                    description: `Has sido asignado a ${invitationResult.companyName}`,
                  });
                }
              }
            }
          } catch (provisionErr) {
            console.error('Provision error:', provisionErr);
          }
        }
        
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu correo para confirmar tu cuenta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(true);
    
    // Get return URL from query params - support both returnTo and returnUrl  
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || urlParams.get('returnUrl');
    const company = urlParams.get('company');
    
    // Helper function to get redirect URL
    const getRedirectUrl = () => {
      if (returnTo) {
        return decodeURIComponent(returnTo);
      }
      if (company) {
        return `${window.location.origin}/registration?company=${company}`;
      }
      return `${window.location.origin}/dashboard`; // Default if no company specified
    };
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo conectar con el proveedor.",
        variant: "destructive",
      });
      setLoading(false);
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
                placeholder="••••••••"
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