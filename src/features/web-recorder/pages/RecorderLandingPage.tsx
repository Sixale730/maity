/**
 * Recorder Landing Page
 *
 * Introduction and instructions for the web recorder.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Mic, Smartphone, Wifi, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isAudioCaptureSupported, isIOSSafari } from '../lib/audioCapture';

export function RecorderLandingPage() {
  const navigate = useNavigate();
  const isSupported = isAudioCaptureSupported();
  const isIOS = isIOSSafari();

  const handleStart = () => {
    navigate('/recorder/session');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Grabadora Maity</h1>
          <p className="text-muted-foreground">
            Graba y transcribe conversaciones desde tu navegador
          </p>
        </div>

        {/* Browser Support Check */}
        {!isSupported && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">
                    Navegador no soportado
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu navegador no soporta grabación de audio.
                    Por favor usa Safari en iOS o Chrome/Firefox en desktop.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS Safari Tips */}
        {isIOS && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Consejos para iOS
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Para mejor experiencia en iPhone/iPad:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mantén la pantalla encendida durante la grabación</li>
                <li>Conecta a WiFi para mejor velocidad</li>
                <li>Agrega a pantalla de inicio para modo app</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Características</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Transcripción en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Pausar y reanudar grabación</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Análisis de comunicación con IA</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Sincronización con tu cuenta Maity</span>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requisitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-muted-foreground" />
              <span>Permiso de micrófono</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-muted-foreground" />
              <span>Conexión a internet estable</span>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          disabled={!isSupported}
        >
          <Mic className="w-5 h-5 mr-2" />
          Comenzar a Grabar
        </Button>

        {/* Back link */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecorderLandingPage;
