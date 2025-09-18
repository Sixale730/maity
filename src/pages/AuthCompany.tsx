import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resolveBaseOrigin } from "@/lib/urlHelpers";
import { useNavigate } from "react-router-dom";
import MaityLogo from "@/components/MaityLogo";
import { persistCompanyId, getPersistedCompanyId, isValidUUID } from "@/lib/companyPersistence";
import { getAppUrl } from "@/lib/appUrl";

interface CompanyRecord {
  id: string;
  name: string;
}

interface LinkUserCompanyResult {
  success?: boolean;
  message?: string;
}

const AuthCompany: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isCompanyIdValid, setIsCompanyIdValid] = useState(true);
  const [showMissingCompanyWarning, setShowMissingCompanyWarning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const appUrl = getAppUrl();
  const baseOrigin = resolveBaseOrigin(appUrl);

  const linkUserToCompany = async (userId: string, targetCompanyId: string) => {
    if (!targetCompanyId || !isValidUUID(targetCompanyId)) {
      throw new Error('No se encontro un company_id valido para vincular.');
    }

    console.log('[AC-4] RPC link_user_company_by_company_id -> company_id=' + targetCompanyId);
    const rpcArgs = {
      company_id: targetCompanyId,
      user_auth_id: userId,
    } as const;

    const { data, error } = await supabase.rpc('link_user_company_by_company_id', rpcArgs);

    const result = parseLinkUserCompanyResult(data);
    if (error || !result?.success) {
      console.error('[AC-4][ERROR] RPC fallo', error ?? result);
      throw new Error(result?.message ?? 'No se pudo vincular tu usuario con la empresa.');
    }

    const { error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError) {
      console.log('[AC-5] Sesion refrescada tras enlace');
    } else {
      console.warn('[AC-5] No se pudo refrescar la sesion', refreshError);
    }

    toast({
      title: 'Autenticacion completada',
      description: 'Tu cuenta se asocio correctamente a la empresa.',
    });

    console.log('[AC-6] Redirigiendo a /dashboard');
    navigate('/dashboard', { replace: true });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryCompanyId = params.get("company_id") ?? params.get("company");
    const rawCompanyId = (queryCompanyId || "").trim();
    console.log(`[AC-1] Querystring leido: company_id=${rawCompanyId || "vacio"}`);

    const persistedCompanyId = getPersistedCompanyId();
    if (!rawCompanyId && persistedCompanyId) {
      console.log(`[AC-1] company_id recuperado de persistencia: ${persistedCompanyId}`);
    }

    const candidateId = rawCompanyId || persistedCompanyId || "";

    if (candidateId && isValidUUID(candidateId)) {
      setCompanyId(candidateId);
      setIsCompanyIdValid(true);
      setShowMissingCompanyWarning(false);
      persistCompanyId(candidateId);

      supabase
        .rpc("get_company_by_id", { company_id: candidateId })
        .then(({ data, error }) => {
          if (error) {
            console.error("[AC-1][ERROR] get_company_by_id", error);
            return;
          }

          if (Array.isArray(data) && data.length > 0) {
            const record = data[0] as CompanyRecord;
            setCompanyName(record?.name ?? "");
          } else {
            console.warn("[AC-1][WARN] company_id valido pero sin registro", { candidateId });
            setCompanyName("");
          }
        })
        .catch((error) => {
          console.error("[AC-1][ERROR] get_company_by_id:exception", error);
        });
    } else {
      setCompanyId("");
      setCompanyName("");
      setIsCompanyIdValid(false);
      setShowMissingCompanyWarning(true);

      const warningLog = candidateId
        ? "[AC-2] Advertencia: company_id invalido - bloqueando botones"
        : "[AC-2] Advertencia: company_id ausente - bloqueando botones";
      console.log(warningLog);
    }
  }, []);

  const hasValidCompanyId = Boolean(companyId && isCompanyIdValid);
  const disableAuthActions = loading || !hasValidCompanyId;

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!hasValidCompanyId) {
      toast({
        title: "Company ID requerido",
        description: "Necesitas un company_id valido para continuar.",
        variant: "destructive",
      });
      return;
    }

    console.log("[AC-3] Lanzando login (email) -> redirect=callback");

    setLoading(true);
    const callbackUrl = new URL('/auth/callback', baseOrigin).toString();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callbackUrl,
            data: {
              company_id: companyId,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Registro enviado",
          description: "Revisa tu correo para confirmar la cuenta.",
        });
      }
    } catch (error) {
      console.error('[AC-3][ERROR] Email login failed', error);
      const description = getErrorMessage(error) || 'No se pudo completar la solicitud.';
      toast({
        title: 'Error de autenticacion',
        description,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "azure") => {
    if (!hasValidCompanyId) {
      toast({
        title: "Company ID requerido",
        description: "Necesitas un company_id valido para continuar.",
        variant: "destructive",
      });
      return;
    }

    persistCompanyId(companyId);
    setLoading(true);

    const redirectUrl = new URL('/auth/callback', baseOrigin);
    redirectUrl.searchParams.set('company_id', companyId);

    console.log(`[AC-3] Lanzando login (provider=${provider}) -> redirect=${redirectUrl.toString()}`);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl.toString(),
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('[AC-3][ERROR] OAuth login failed', error);
      const description = getErrorMessage(error) || `No se pudo continuar con ${provider}.`;
      toast({
        title: 'Error de autenticacion',
        description,
        variant: 'destructive',
      });
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
            {isLogin ? "Iniciar Sesion" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="font-inter">
            {companyName
              ? `Acceso exclusivo para ${companyName}`
              : "Ingresa tus credenciales para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name" className="font-inter">Empresa</Label>
            <Input
              id="company-name"
              value={companyName || "Empresa no identificada"}
              readOnly
              className="font-inter"
            />
          </div>

          {showMissingCompanyWarning && (
            <div className="flex items-start space-x-2 rounded-lg border border-destructive bg-destructive/10 p-3">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                Este enlace necesita un company_id valido para continuar.
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-inter"
              onClick={() => handleOAuthLogin("google")}
              disabled={disableAuthActions}
            >
              Continuar con Google
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-inter"
              onClick={() => handleOAuthLogin("azure")}
              disabled={disableAuthActions}
            >
              Continuar con Microsoft
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-inter">
                O continua con email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={disableAuthActions}
                className="font-inter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-inter">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={disableAuthActions}
                className="font-inter"
              />
            </div>
            <Button type="submit" className="w-full font-inter" disabled={disableAuthActions}>
              {loading ? "Cargando..." : isLogin ? "Iniciar Sesion" : "Crear Cuenta"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="text-sm text-primary hover:underline font-inter"
            >
              {isLogin ? "No tienes cuenta? Registrate" : "Ya tienes cuenta? Inicia sesion"}
            </button>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:underline font-inter"
            >
              Volver al inicio
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCompany;











