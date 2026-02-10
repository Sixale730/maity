import { Button } from "@/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/ui/card";
import MaityLogo from "@/shared/components/MaityLogo";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthService, AutojoinService } from "@maity/shared";
import { Loader2 } from "lucide-react";

const Pending = () => {
  const navigate = useNavigate();
  const [isCheckingAutojoin, setIsCheckingAutojoin] = useState(true);
  const [autojoinAttempted, setAutojoinAttempted] = useState(false);

  // Auto-retry autojoin when page loads
  // This handles the case where a user registered before the domain was enabled
  useEffect(() => {
    const retryAutojoin = async () => {
      try {
        console.log('[Pending] Checking if autojoin is now available...');
        const session = await AuthService.getSession();

        if (session?.user.email) {
          const result = await AutojoinService.tryAutojoinByDomain(session.user.email);

          if (AutojoinService.isSuccessful(result)) {
            console.log('[Pending] ✅ Autojoin successful! Redirecting to dashboard...', {
              company_name: result.company_name,
              domain: result.domain
            });
            // Autojoin successful - redirect to gamified dashboard v2
            navigate('/gamified-dashboard-v2', { replace: true });
            return;
          } else if (AutojoinService.userAlreadyHasCompany(result)) {
            console.log('[Pending] User already has company, redirecting to dashboard...');
            // User already has company - redirect to gamified dashboard v2
            navigate('/gamified-dashboard-v2', { replace: true });
            return;
          } else if (AutojoinService.noMatchingDomain(result)) {
            console.log('[Pending] No matching domain for autojoin - showing pending page');
            // No autojoin available - show pending message
          } else {
            console.log('[Pending] Autojoin failed:', result.error);
          }
        }
      } catch (error) {
        console.error('[Pending] Error retrying autojoin:', error);
      } finally {
        setIsCheckingAutojoin(false);
        setAutojoinAttempted(true);
      }
    };

    // Only retry once per page load
    if (!autojoinAttempted) {
      retryAutojoin();
    }
  }, [navigate, autojoinAttempted]);

  // Show loading state while checking autojoin
  if (isCheckingAutojoin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground font-inter">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <MaityLogo variant="full" size="md" className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-geist">Cuenta pendiente de activación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-inter">
            Para activar tu cuenta, necesitas el enlace de invitación de tu empresa. Contacta a tu administrador para obtener el enlace y completar la activación.
          </p>
          <Button variant="outline" onClick={() => navigate('/', { replace: true })} className="font-inter">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;
