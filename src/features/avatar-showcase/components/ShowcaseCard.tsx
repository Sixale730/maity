import { Suspense, useState, Component, ReactNode } from 'react';
import { Check, X, FileBox, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { ShowcaseCanvas } from './ShowcaseCanvas';
import {
  ProceduralAvatar,
  VOXLoaderFallback,
  OBJLoaderFallback,
  GLTFLoaderFallback,
} from './loaders';
import type { ShowcaseCardProps } from '../types/showcase.types';

/**
 * Simple Error Boundary for 3D Canvas
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

class SimpleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * Loading placeholder for 3D canvas
 */
function CanvasLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-xs text-muted-foreground">Cargando modelo...</span>
      </div>
    </div>
  );
}

/**
 * Error fallback for 3D canvas
 */
function CanvasError({ error }: { error: Error }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-lg border border-red-500/20">
      <div className="flex flex-col items-center gap-2 text-center p-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <span className="text-xs text-red-300">Error cargando modelo</span>
        <span className="text-xs text-muted-foreground max-w-[150px] truncate">
          {error.message}
        </span>
      </div>
    </div>
  );
}

/**
 * Get the appropriate avatar component based on approach type
 */
function getAvatarComponent(approach: string) {
  switch (approach) {
    case 'procedural':
      return <ProceduralAvatar />;
    case 'vox':
      // Using fallback since we don't have the actual .vox file yet
      return <VOXLoaderFallback />;
    case 'obj':
      // Using fallback since we don't have the actual .obj file yet
      return <OBJLoaderFallback />;
    case 'gltf':
      // Using fallback since we don't have the actual .glb file yet
      return <GLTFLoaderFallback />;
    default:
      return <ProceduralAvatar />;
  }
}

/**
 * Individual showcase card with 3D preview and info
 */
export function ShowcaseCard({ item, className = '' }: ShowcaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isHovered ? 'ring-2 ring-primary/50 shadow-lg' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Preview */}
      <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        <SimpleErrorBoundary fallback={(error) => <CanvasError error={error} />}>
          <Suspense fallback={<CanvasLoading />}>
            <ShowcaseCanvas
              autoRotate={!isHovered}
              enableRotation={isHovered}
              enableZoom={isHovered}
            >
              {getAvatarComponent(item.approach)}
            </ShowcaseCanvas>
          </Suspense>
        </SimpleErrorBoundary>

        {/* File size badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-xs">
            <FileBox className="w-3 h-3 mr-1" />
            {item.fileSize}
          </Badge>
        </div>

        {/* Load time badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {item.loadTime}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <CardDescription className="text-sm">{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Pros */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Ventajas</p>
          <div className="flex flex-wrap gap-1">
            {item.pros.map((pro, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-green-500/10 border-green-500/30 text-green-400"
              >
                <Check className="w-3 h-3 mr-1" />
                {pro}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cons */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Desventajas</p>
          <div className="flex flex-wrap gap-1">
            {item.cons.map((con, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-red-500/10 border-red-500/30 text-red-400"
              >
                <X className="w-3 h-3 mr-1" />
                {con}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShowcaseCard;
