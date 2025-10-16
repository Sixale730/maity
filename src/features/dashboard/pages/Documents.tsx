import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { FileText } from 'lucide-react';

export default function Documents() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Documentos
          </h1>
          <p className="text-muted-foreground">Centro de documentación y recursos</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Página en construcción</p>
      </div>
    </div>
  );
}