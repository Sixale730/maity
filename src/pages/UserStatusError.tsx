import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { supabase, AuthService } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import MaityLogo from '@/shared/components/MaityLogo';

export default function UserStatusError() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRetry = async () => {
    try {
      const phase = await AuthService.getMyPhase();

      switch (phase) {
        case 'ACTIVE':
          navigate('/dashboard', { replace: true });
          break;
        case 'REGISTRATION':
          navigate('/registration', { replace: true });
          break;
        case 'NO_COMPANY':
          navigate('/pending', { replace: true });
          break;
        default:
          toast({
            title: 'Estado desconocido',
            description: `Estado del usuario: ${phase}`,
            variant: 'destructive',
          });
      }
    } catch (err) {
      console.error('Error retrying my_phase:', err);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <MaityLogo />
          </div>
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle>Error de Estado del Usuario</CardTitle>
          <CardDescription>
            No se pudo verificar tu estado en la plataforma. Esto puede ser un problema temporal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Posibles causas:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Problema temporal del servidor</li>
              <li>Tu cuenta está siendo procesada</li>
              <li>Error de configuración en tu perfil</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Si el problema persiste, contacta a soporte técnico.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}