import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MaityLogo from "@/components/MaityLogo";
import { Clock, AlertTriangle } from "lucide-react";

const Pending = () => {
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
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="font-geist text-2xl">
            Cuenta en Proceso
          </CardTitle>
          <CardDescription className="font-inter">
            Tu cuenta está siendo activada. Te notificaremos cuando esté lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Estado de la cuenta</p>
                <p>
                  Tu cuenta está en proceso de activación. Este proceso puede tomar hasta 24 horas. 
                  Recibirás una notificación por correo electrónico cuando tu cuenta esté lista para usar.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToHome}
              className="font-inter"
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;