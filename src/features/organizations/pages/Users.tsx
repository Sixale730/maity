import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Users as UsersIcon } from 'lucide-react';

export default function Users() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UsersIcon className="w-8 h-8" />
            Usuarios
          </h1>
          <p className="text-muted-foreground">Gestión de usuarios de la plataforma</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}