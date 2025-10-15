import React from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Trophy } from 'lucide-react';

export default function Achievements() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Mis Logros
          </h1>
          <p className="text-muted-foreground">Tus logros y reconocimientos</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}