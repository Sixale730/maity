import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { buildTallyEmbedUrl } from "@/lib/tally";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, ArrowLeft } from "lucide-react";

/**
 * NOTAS IMPORTANTES:
 * - Este componente ya NO depende de ?company=... en la URL.
 * - Usa ?otk=<token> que te manda el backend desde /api/finalize-invite.
 * - Pasa hidden fields a Tally: auth_id y otk (se validan más tarde en el webhook).
 * - NO marca registro como completado desde el cliente (eso lo hace el webhook).
 * - Al terminar, Tally redirige a /onboarding/success donde haces poll a /api/my_status.
 */

type Company = {
  id: string;
  name: string;
  plan: string | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
};

const TALLY_FORM_ID = import.meta.env.VITE_TALLY_FORM_ID || "wQGAyA"; // o hardcodea si prefieres

const Registration: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [authId, setAuthId] = useState<string>("");

  const otk = params.get("otk") || "";

  useEffect(() => {
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otk]);

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

      // 2) OTK obligatorio (lo genera finalize-invite)
      if (!otk) {
        console.warn('[registration] missing otk token');
        navigate('/auth', { replace: true });
        return;
      }

      // 3) Traer info de usuario (propia fila). Debes tener RLS para select propio.
      const { data: me, error: meErr } = await supabase
        .from("users") // si tu tabla está bajo schema maity con RLS, ten un view/rpc; o expón vista en public.
        .select("company_id, registration_form_completed")
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

      // 4) Debe existir company asignada (la asignó finalize-invite/RPC)
      if (!me.company_id) {
        toast({
          title: "Sin empresa asignada",
          description: "Tu invitación no pudo asignarte a una empresa.",
          variant: "destructive",
        });
        navigate("/invitation-required");
        return;
      }

      // 5) Si ya completaste el registro, directo al dashboard
      if (me.registration_form_completed) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // 6) Traer datos de la empresa (usa tu RPC existente si la tabla está bajo schema maity)
      // Reemplaza por tu RPC si la usas: get_company_by_id(company_id uuid)
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

      setCompany(companyRows[0]);
    } catch (e: any) {
      console.error("[registration] init error", e);
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
    if (!authId || !otk) return "";
    return buildTallyEmbedUrl(
      TALLY_FORM_ID,
      {
        auth_id: authId,      // obligatorio
        otk,                  // obligatorio
        company_id: company?.id || "",          // opcional
        company_name: company?.name || "",      // opcional
        // email: session?.user?.email || "",    // opcional
      },
      { redirectTo: `${location.origin}/onboarding/success` }
    );
  }, [authId, otk, company]);

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

  // Estilos para fullscreen del iframe
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
