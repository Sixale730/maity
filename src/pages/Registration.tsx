import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

/**
 * NOTAS IMPORTANTES:
 * - La fase del usuario se valida vía RPC my_phase().
 * - El usuario debe tener company_id asignado en maity.users; si no, se redirige a /pending.
 * - Se genera un link especial de Tally con OTK y hidden fields.
 */

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

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

      // 3) Generar link de Tally con OTK
      setRedirecting(true);

      const response = await fetch('/api/tally-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[registration] Failed to generate Tally link:", error);

        if (error.error === 'ALREADY_COMPLETED') {
          navigate("/dashboard", { replace: true });
          return;
        }

        if (error.error === 'NO_COMPANY') {
          navigate("/pending", { replace: true });
          return;
        }

        toast({
          title: "Error",
          description: "No se pudo generar el enlace al formulario.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const { url: tallyUrl } = await response.json();
      console.log('[Registration] Redirecting to Tally form...');

      // Redirect to Tally form
      window.location.href = tallyUrl;
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

  const handleBackToHome = () => navigate("/");

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              {redirecting ? "Redirigiendo al formulario..." : "Verificando datos..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This shouldn't normally be shown as we redirect to Tally
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Preparando formulario</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Serás redirigido al formulario de registro en un momento...
          </p>
          <Button onClick={handleBackToHome} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;
