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
 * - El formulario de Tally recibe auth_id y company info como hidden fields.
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
      const { data: statusData } = await supabase.rpc('my_status');

      if (!statusData) {
        console.error("[registration] my_status returned no data");
        navigate("/user-status-error", { replace: true });
        return;
      }

      const userStatus = statusData[0];
      console.log("[registration] User status:", userStatus);

      if (userStatus.registration_form_completed) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (!userStatus.company_id) {
        navigate("/pending", { replace: true });
        return;
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

      const companyRecord = companyRows[0] as Company;
      setCompany(companyRecord);
      console.log('[Registration] Company loaded:', companyRecord);
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
    console.log('[Registration] Building iframe src with:', {
      authId,
      companyId: company?.id,
      companyName: company?.name,
      tallyFormId: TALLY_FORM_ID
    });

    if (!authId || !company?.id) {
      console.log('[Registration] Missing required data for iframe');
      return "";
    }
    if (typeof window === 'undefined') return "";

    const url = buildTallyEmbedUrl(
      TALLY_FORM_ID,
      {
        auth_id: authId,
        company_id: company.id,
        company_name: company.name || "",
      },
      { redirectTo: `${window.location.origin}/onboarding/success` }
    );

    console.log('[Registration] Built Tally URL:', url);
    return url;
  }, [authId, company]);

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
