import { Boxes, Lightbulb, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/components/ui/alert';
import { ShowcaseGrid } from '../components';
import { SHOWCASE_ITEMS, SHOWCASE_INFO } from '../data/showcase-data';

/**
 * Avatar Showcase Page
 * Compares different voxel avatar rendering approaches
 * Admin-only access
 */
export function AvatarShowcasePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border/40 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Boxes className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{SHOWCASE_INFO.title}</h1>
            <p className="text-sm text-muted-foreground">
              {SHOWCASE_INFO.description}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Recommendation alert */}
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-200">
              <strong>Recomendacion:</strong> {SHOWCASE_INFO.recommendation}
            </AlertDescription>
          </Alert>

          {/* Info alert */}
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Interaccion:</strong> Pasa el mouse sobre cada tarjeta para
              pausar la rotacion automatica y controlar manualmente el modelo 3D.
            </AlertDescription>
          </Alert>

          {/* Showcase Grid */}
          <ShowcaseGrid items={SHOWCASE_ITEMS} />

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
              <span>Ventajas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
              <span>Desventajas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-500/20 border border-slate-500/30" />
              <span>Tamano de archivo / Tiempo de carga</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground">
            Los modelos mostrados son ejemplos procedurales. Para ver modelos
            reales, descarga los assets de{' '}
            <a
              href="https://kenney.nl/assets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kenney.nl
            </a>
            {' '}o{' '}
            <a
              href="https://ephtracy.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MagicaVoxel
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

export default AvatarShowcasePage;
