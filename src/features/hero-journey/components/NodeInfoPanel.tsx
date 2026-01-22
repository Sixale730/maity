/**
 * NodeInfoPanel Component
 * Displays detailed information about a selected node
 */

import { X, Lock, CheckCircle2, Circle, Star } from 'lucide-react';
import { cn } from '@maity/shared';
import type { JourneyNode, JourneyTheme } from '@maity/shared';
import { JOURNEY_THEME_COLORS } from '@maity/shared';
import { Button } from '@/ui/components/ui/button';

interface NodeInfoPanelProps {
  node: JourneyNode;
  theme: JourneyTheme;
  onClose: () => void;
  onAction?: (nodeId: string) => void;
}

/**
 * Get status icon and label
 */
function getStatusInfo(status: JourneyNode['status']) {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        label: 'Completado',
        color: 'text-green-400',
      };
    case 'current':
      return {
        icon: Star,
        label: 'En Progreso',
        color: 'text-pink-400',
      };
    case 'available':
      return {
        icon: Circle,
        label: 'Disponible',
        color: 'text-yellow-400',
      };
    case 'locked':
    default:
      return {
        icon: Lock,
        label: 'Bloqueado',
        color: 'text-gray-400',
      };
  }
}

/**
 * Get type label
 */
function getTypeLabel(type: JourneyNode['type']) {
  switch (type) {
    case 'checkpoint':
      return 'Punto de Control';
    case 'scenario':
      return 'Escenario';
    case 'resource':
      return 'Recurso';
    case 'boss':
      return 'Desafío Boss';
    default:
      return type;
  }
}

export function NodeInfoPanel({
  node,
  theme,
  onClose,
  onAction,
}: NodeInfoPanelProps) {
  const colors = JOURNEY_THEME_COLORS[theme];
  const statusInfo = getStatusInfo(node.status);
  const StatusIcon = statusInfo.icon;

  const canStart = node.status === 'available' || node.status === 'current';

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80',
        'bg-black/80 backdrop-blur-lg rounded-xl border border-white/10',
        'p-4 z-30 animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: colors.mountainFront }}
          >
            <span className="text-2xl">{node.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{node.title}</h3>
            <p className="text-xs text-gray-400">{getTypeLabel(node.type)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Description */}
      {node.description && (
        <p className="text-sm text-gray-300 mb-4">{node.description}</p>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <StatusIcon size={16} className={statusInfo.color} />
        <span className={cn('text-sm font-medium', statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      {/* Progress bar for boss nodes */}
      {node.type === 'boss' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progreso requerido</span>
            <span>100%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: node.status === 'locked' ? '0%' : '100%',
                backgroundColor: colors.pathLine,
              }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      {onAction && (
        <Button
          onClick={() => onAction(node.id)}
          disabled={!canStart}
          className={cn(
            'w-full',
            canStart
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
              : 'bg-gray-600 cursor-not-allowed'
          )}
        >
          {node.status === 'completed'
            ? 'Ver Resultados'
            : node.status === 'current'
            ? 'Continuar'
            : node.status === 'available'
            ? 'Comenzar'
            : 'Bloqueado'}
        </Button>
      )}

      {/* Locked message */}
      {node.status === 'locked' && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Completa los nodos anteriores para desbloquear
        </p>
      )}
    </div>
  );
}

export default NodeInfoPanel;
