import { SidebarTrigger } from "@/ui/components/ui/sidebar";
import { RoleplayProgress } from "@/features/roleplay/components/RoleplayProgress";
import LanguageSelector from "@/shared/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import "@/styles/hexagon.css";

export function MyProgress() {
  const { t } = useLanguage();

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Progreso</h1>
              <p className="text-muted-foreground">
                Rastrea tu avance y desafíos de roleplay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Progress Content */}
      <div className="p-6">
        <RoleplayProgress />
      </div>
    </main>
  );
}