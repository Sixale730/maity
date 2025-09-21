import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { buildTallyEmbedUrl } from "@/lib/tally";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

/**
 * NOTAS IMPORTANTES:
 * - La fase del usuario se valida vía RPC my_phase().
 * - El usuario debe tener company_id asignado en maity.users; si no, se redirige a /pending.
 * - El token de registro (otk) se obtiene del resultado de my_phase() o de futuras fuentes internas.
 * - El formulario de Tally recibe auth_id y otk como hidden fields; el webhook valida el resto.
 */

type Company = {
  id: string;
  name: string;
  plan: string | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
};

const TALLY_FORM_ID = import.meta.env.VITE_TALLY_FORM_ID || "wQGAyA";

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [authId, setAuthId] = useState<string>("");
  const [registrationToken, setRegistrationToken] = useState<string>("");

  useEffect(() => {
    void init();
  }, []);

  const init = async () => {
    try {
      // 1) Sesión obligatoria
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const returnTo = encodeURIComponent(window.location.href);
        navigate(`/auth?returnTo=${returnTo}`);
        return;
      }
      setAuthId(session.user.id);

      // 2) Verificar fase actual del usuario
      const { data: phaseData, error: phaseError } = await supabase.rpc("my_phase");
      if (phaseError) {
        console.error("[registration] my_phase error", phaseError);
        navigate("/auth", { replace: true });
        return;
      }

      const extractField = (value: unknown, field: string) => {
        if (typeof value === "string" || value == null) return undefined;
        if (Array.isArray(value)) {
          return (value[0] as Record<string, unknown> | undefined)?.[field];
        }
        return (value as Record<string, unknown>)[field];
      };

      const phaseRaw =
        typeof phaseData === "string"
          ? phaseData
          : (extractField(phaseData, "phase") as string | undefined);

      const phase = String(phaseRaw || "").toUpperCase();

      if (phase === "ACTIVE") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (phase === "NO_COMPANY") {
        navigate("/pending", { replace: true });
        return;
      }

      if (phase !== "REGISTRATION") {
        navigate("/auth", { replace: true });
        return;
      }

      const phaseToken = extractField(phaseData, "registration_token")
        ?? extractField(phaseData, "otk")
        ?? extractField(phaseData, "token");
      if (phaseToken) {
        setRegistrationToken(String(phaseToken));
      }

      // 3) Traer info de usuario (propia fila) para validar company y estado del formulario
      const { data: me, error: meErr } = await supabase
        .from("users")
        .select("company_id, registration_form_completed")
        .eq("auth_id", session.user.id)
        .single();

      if (meErr || !me) {
        console.error("[registration] meErr", meErr);
        toast({
          title: "Error",
          description: "No se pudo obtener tu perfil.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (!me.company_id) {
        navigate("/pending", { replace: true });
        return;
      }

      if (me.registration_form_completed) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // 4) Traer datos de la empresa
      const { data: companyRows, error: compErr } = await supabase.rpc("get_company_by_id", {
        company_id: me.company_id,
      });

      if (compErr || !companyRows || companyRows.length === 0) {
        console.error("[registration] company error", compErr);
        toast({
          title: "Empresa no encontrada o inactiva",
          description: "Contacta a tu administrador.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const companyRecord = companyRows[0] as Company & { registration_token?: string | null };
      setCompany(companyRecord);
      if (companyRecord?.registration_token) {
        setRegistrationToken(current => current || String(companyRecord.registration_token));
      }
    } catch (error) {
      console.error("[registration] init error", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el registro.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const iframeSrc = useMemo(() => {
    if (!authId || !registrationToken || !company?.id) return "";
    if (typeof window === 'undefined') return "";

    return buildTallyEmbedUrl(
      TALLY_FORM_ID,
      {
        auth_id: authId,
        otk: registrationToken,
        company_id: company.id,
        company_name: company.name || "",
      },
      { redirectTo: `${window.location.origin}/onboarding/success` }
    );
  }, [authId, registrationToken, company]);

  const handleBackToHome = () => navigate("/");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando datos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registrationToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invitación requerida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              No encontramos un token de registro activo. Abre el enlace de invitación más reciente o contacta a tu administrador.
            </p>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Empresa no encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              La empresa especificada no existe o no está activa.
            </p>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          html, body, #root { height: 100%; }
          body { margin: 0; overflow: hidden; }
          iframe { position: fixed; inset: 0; border: 0; width: 100%; height: 100%; }
        `}
      </style>

      {!iframeSrc ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Cargando formulario…</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
              Espera un momento…
            </CardContent>
          </Card>
        </div>
      ) : (
        <iframe title="Registro / Diagnóstico" src={iframeSrc} />
      )}
    </>
  );
};

export default Registration;
