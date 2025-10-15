import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-muted-foreground">Ajustes y preferencias de la cuenta</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}