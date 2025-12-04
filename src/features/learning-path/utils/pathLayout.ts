/**
 * Path Layout Utilities
 * Calculate node positions for serpentine Duolingo-style layout
 */

import type { VisualPosition } from '@maity/shared';

export interface NodePosition {
  x: number;
  y: number;
  position: VisualPosition;
}

/**
 * Calculate node position based on index
 * Creates a serpentine pattern: center -> right -> center -> left -> center...
 */
export function calculateNodePosition(
  index: number,
  containerWidth: number,
  nodeSize: number = 80
): NodePosition {
  const nodeSpacing = 140; // Vertical spacing between nodes
  const horizontalOffset = Math.min(containerWidth * 0.25, 120); // 25% from center, max 120px

  // Serpentine pattern: center -> right -> center -> left -> repeat
  const cycle = index % 4;
  let position: VisualPosition;
  let x: number;

  const centerX = containerWidth / 2;

  switch (cycle) {
    case 0:
      position = 'center';
      x = centerX;
      break;
    case 1:
      position = 'right';
      x = centerX + horizontalOffset;
      break;
    case 2:
      position = 'center';
      x = centerX;
      break;
    case 3:
      position = 'left';
      x = centerX - horizontalOffset;
      break;
    default:
      position = 'center';
      x = centerX;
  }

  return {
    x,
    y: index * nodeSpacing + 80, // 80px top padding
    position,
  };
}

/**
 * Calculate SVG path between two nodes
 */
export function calculateConnectorPath(
  from: NodePosition,
  to: NodePosition,
  nodeSize: number = 80
): string {
  const startY = from.y + nodeSize / 2;
  const endY = to.y - nodeSize / 2;
  const midY = (startY + endY) / 2;

  // Curved bezier path
  return `M ${from.x} ${startY}
          C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${endY}`;
}

/**
 * Get color class based on node color
 */
export function getNodeColorClasses(color: string): {
  bg: string;
  border: string;
  text: string;
  glow: string;
} {
  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    purple: {
      bg: 'bg-purple-500',
      border: 'border-purple-400',
      text: 'text-purple-100',
      glow: 'shadow-purple-500/50',
    },
    blue: {
      bg: 'bg-blue-500',
      border: 'border-blue-400',
      text: 'text-blue-100',
      glow: 'shadow-blue-500/50',
    },
    green: {
      bg: 'bg-green-500',
      border: 'border-green-400',
      text: 'text-green-100',
      glow: 'shadow-green-500/50',
    },
    pink: {
      bg: 'bg-pink-500',
      border: 'border-pink-400',
      text: 'text-pink-100',
      glow: 'shadow-pink-500/50',
    },
    orange: {
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-orange-100',
      glow: 'shadow-orange-500/50',
    },
    yellow: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-400',
      text: 'text-yellow-900',
      glow: 'shadow-yellow-500/50',
    },
    cyan: {
      bg: 'bg-cyan-500',
      border: 'border-cyan-400',
      text: 'text-cyan-100',
      glow: 'shadow-cyan-500/50',
    },
    slate: {
      bg: 'bg-slate-500',
      border: 'border-slate-400',
      text: 'text-slate-100',
      glow: 'shadow-slate-500/50',
    },
    gold: {
      bg: 'bg-amber-500',
      border: 'border-amber-400',
      text: 'text-amber-100',
      glow: 'shadow-amber-500/50',
    },
  };

  return colorMap[color] || colorMap.blue;
}

/**
 * Get icon component name based on string
 */
export function getNodeIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'book-open': 'BookOpen',
    mic: 'Mic',
    sparkles: 'Sparkles',
    flag: 'Flag',
    trophy: 'Trophy',
    play: 'Play',
    video: 'Video',
    'help-circle': 'HelpCircle',
    circle: 'Circle',
    check: 'Check',
    lock: 'Lock',
  };

  return iconMap[icon] || 'Circle';
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
}
