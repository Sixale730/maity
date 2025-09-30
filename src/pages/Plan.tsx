import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Target } from 'lucide-react';

export default function Plan() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8" />
            Mi Plan
          </h1>
          <p className="text-muted-foreground">Tu plan actual y opciones de mejora</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}