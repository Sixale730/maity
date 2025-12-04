/**
 * NodeDetailModal Component
 * Modal that appears when clicking a node in the learning path
 */

import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import {
  BookOpen,
  Mic,
  Flag,
  Trophy,
  ExternalLink,
  Play,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@maity/shared';
import type { LearningPathNode } from '@maity/shared';
import { formatDuration, getNodeColorClasses } from '../utils/pathLayout';

interface NodeDetailModalProps {
  node: LearningPathNode | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (nodeId: string) => void;
  onStart: (nodeId: string) => void;
  isCompleting?: boolean;
}

export function NodeDetailModal({
  node,
  isOpen,
  onClose,
  onComplete,
  onStart,
  isCompleting = false,
}: NodeDetailModalProps) {
  const navigate = useNavigate();

  if (!node) return null;

  const colorClasses = getNodeColorClasses(node.color);
  const isCompleted = node.status === 'completed';
  const isResource = node.nodeType === 'resource';
  const isScenario = node.nodeType === 'scenario';
  const isCheckpoint = node.nodeType === 'checkpoint';

  const handleResourceClick = () => {
    if (node.resourceUrl) {
      // Mark as started
      onStart(node.nodeId);
      // Open in new tab
      window.open(node.resourceUrl, '_blank');
    }
  };

  const handleResourceComplete = () => {
    onComplete(node.nodeId);
  };

  const handleScenarioStart = () => {
    // Navigate to roleplay with scenario pre-selected
    onStart(node.nodeId);
    navigate(`/roleplay?scenario=${node.scenarioCode}`);
    onClose();
  };

  const handleCheckpointComplete = () => {
    onComplete(node.nodeId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isCompleted ? 'bg-green-500' : colorClasses.bg
              )}
            >
              {isResource && <BookOpen className="w-6 h-6 text-white" />}
              {isScenario && <Mic className="w-6 h-6 text-white" />}
              {isCheckpoint && node.icon === 'trophy' && <Trophy className="w-6 h-6 text-white" />}
              {isCheckpoint && node.icon !== 'trophy' && <Flag className="w-6 h-6 text-white" />}
            </div>

            <div>
              <DialogTitle className="text-xl">{node.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    isResource && 'border-purple-300 text-purple-700 dark:text-purple-300',
                    isScenario && 'border-blue-300 text-blue-700 dark:text-blue-300',
                    isCheckpoint && 'border-yellow-300 text-yellow-700 dark:text-yellow-300'
                  )}
                >
                  {isResource && 'Recurso Educativo'}
                  {isScenario && 'Práctica de Voz'}
                  {isCheckpoint && 'Punto de Control'}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          {node.description && (
            <DialogDescription className="text-base">
              {node.description}
            </DialogDescription>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {node.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(node.estimatedDuration)}</span>
              </div>
            )}
            {isScenario && node.scenarioName && (
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{node.scenarioName}</span>
              </div>
            )}
            {isCompleted && node.score !== null && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">
                  Score: {Math.round(node.score)}%
                </span>
              </div>
            )}
            {node.attempts > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <span>Intentos: {node.attempts}</span>
              </div>
            )}
          </div>

          {/* Resource Preview */}
          {isResource && node.resourceTitle && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recurso: <span className="font-medium">{node.resourceTitle}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {/* Resource Actions */}
            {isResource && !isCompleted && (
              <>
                <Button
                  onClick={handleResourceClick}
                  className={cn(colorClasses.bg, 'hover:opacity-90')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Recurso
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResourceComplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Guardando...' : 'Marcar Completado'}
                </Button>
              </>
            )}

            {/* Scenario Actions */}
            {isScenario && !isCompleted && (
              <Button
                onClick={handleScenarioStart}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Práctica
              </Button>
            )}

            {/* Checkpoint Actions */}
            {isCheckpoint && !isCompleted && (
              <Button
                onClick={handleCheckpointComplete}
                disabled={isCompleting}
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
              >
                {isCompleting ? 'Guardando...' : 'Continuar'}
              </Button>
            )}

            {/* Completed State */}
            {isCompleted && (
              <>
                {isResource && node.resourceUrl && (
                  <Button variant="outline" onClick={handleResourceClick}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver de Nuevo
                  </Button>
                )}
                {isScenario && (
                  <Button variant="outline" onClick={handleScenarioStart}>
                    <Play className="w-4 h-4 mr-2" />
                    Practicar de Nuevo
                  </Button>
                )}
              </>
            )}

            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
