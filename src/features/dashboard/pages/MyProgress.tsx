import { RoleplayProgress } from "@/features/roleplay/components/RoleplayProgress";
import "@/styles/hexagon.css";

export function MyProgress() {

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Progreso</h1>
            <p className="text-muted-foreground">
              Rastrea tu avance y desafíos de roleplay
            </p>
          </div>
        </div>
      </div>

      {/* Progress Content */}
      <RoleplayProgress />
    </div>
  );
}