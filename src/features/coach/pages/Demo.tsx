import React from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Play, MapIcon } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { usePlatformTour } from '@/contexts/PlatformTourContext';
import { MAITY_COLORS } from '@maity/shared';

export default function Demo() {
  const { restartTour } = usePlatformTour();

  const handleStartTour = () => {
    console.log('[Demo] Start tour button clicked');
    restartTour();
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Play className="w-8 h-8" />
            Demo
          </h1>
          <p className="text-muted-foreground">Herramientas para demostración de la plataforma</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Tour Card */}
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${MAITY_COLORS.primary}20` }}
            >
              <MapIcon
                className="w-8 h-8"
                style={{ color: MAITY_COLORS.primary }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Tour Guiado de la Plataforma</h2>
              <p className="text-muted-foreground mb-6">
                Inicia el recorrido interactivo que muestra todas las secciones principales de Maity.
                Perfecto para demos con clientes o para recordar las funcionalidades clave.
              </p>
              <Button
                onClick={handleStartTour}
                className="gap-2"
                style={{
                  backgroundColor: MAITY_COLORS.primary,
                  color: 'white',
                }}
              >
                <MapIcon className="w-4 h-4" />
                Iniciar Tour de la Plataforma
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Consejos para Demos</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>El tour se adapta automáticamente según el rol del usuario (Admin, Manager o User)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Puedes reiniciar el tour cuantas veces necesites desde esta página</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>El tour muestra las secciones principales con descripciones claras</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Los usuarios nuevos verán el tour automáticamente en su primer inicio de sesión</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
