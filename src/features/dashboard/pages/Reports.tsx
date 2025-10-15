import React from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { PieChart } from 'lucide-react';

export default function Reports() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="w-8 h-8" />
            Reportes
          </h1>
          <p className="text-muted-foreground">Informes y reportes detallados</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}