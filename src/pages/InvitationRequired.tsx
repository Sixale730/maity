import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react';
import { MaityLogo } from '@/shared/components/MaityLogo';

const InvitationRequired = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MaityLogo variant="full" size="lg" />
          </div>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="font-geist text-2xl">
            Invitación Requerida
          </CardTitle>
          <CardDescription className="font-inter">
            Necesitas un enlace de invitación válido para acceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Para acceder a Maity, necesitas un enlace de invitación válido 
                enviado por el administrador de tu organización.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">¿Qué hacer?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Contacta al administrador de tu organización</li>
                <li>• Solicita un enlace de invitación válido</li>
                <li>• Accede a través del enlace proporcionado</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={handleBackToHome} 
                variant="outline" 
                className="w-full font-inter"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationRequired;