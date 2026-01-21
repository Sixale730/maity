/**
 * JourneyNode Component
 * Individual node on the hero's journey map with visual states
 */

import { cn } from '@/lib/utils';
import type { JourneyNode as JourneyNodeType, JourneyTheme } from '@maity/shared';
import { JOURNEY_THEME_COLORS } from '@maity/shared';
import { Lock, Check } from 'lucide-react';

interface JourneyNodeProps {
  node: JourneyNodeType;
  theme: JourneyTheme;
  isSelected?: boolean;
  isEditing?: boolean;
  onClick?: (node: JourneyNodeType) => void;
  onDragStart?: (e: React.MouseEvent, node: JourneyNodeType) => void;
}

/**
 * Get visual styles based on node status
 */
function getNodeStyles(status: JourneyNodeType['status'], colors: typeof JOURNEY_THEME_COLORS.snow) {
  switch (status) {
    case 'completed':
      return {
        bg: colors.nodeCompleted,
        border: colors.nodeCompleted,
        shadow: `0 0 20px ${colors.nodeCompleted}40`,
        iconColor: '#1a1a2e',
        opacity: 1,
      };
    case 'current':
      return {
        bg: colors.nodeCurrent,
        border: colors.nodeCurrent,
        shadow: `0 0 30px ${colors.nodeCurrent}60, 0 0 60px ${colors.nodeCurrent}30`,
        iconColor: '#ffffff',
        opacity: 1,
        pulse: true,
      };
    case 'available':
      return {
        bg: colors.nodeAvailable,
        border: colors.nodeAvailable,
        shadow: `0 0 15px ${colors.nodeAvailable}30`,
        iconColor: '#1a1a2e',
        opacity: 1,
      };
    case 'locked':
    default:
      return {
        bg: colors.nodeLocked,
        border: '#666',
        shadow: 'none',
        iconColor: '#999',
        opacity: 0.6,
      };
  }
}

/**
 * Get size based on node type
 */
function getNodeSize(type: JourneyNodeType['type']) {
  switch (type) {
    case 'boss':
      return { size: 64, iconSize: 28 };
    case 'checkpoint':
      return { size: 56, iconSize: 24 };
    default:
      return { size: 48, iconSize: 20 };
  }
}

export function JourneyNode({
  node,
  theme,
  isSelected = false,
  isEditing = false,
  onClick,
  onDragStart,
}: JourneyNodeProps) {
  const colors = JOURNEY_THEME_COLORS[theme];
  const styles = getNodeStyles(node.status, colors);
  const { size, iconSize } = getNodeSize(node.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(node);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing && onDragStart) {
      e.preventDefault();
      onDragStart(e, node);
    }
  };

  return (
    <div
      className={cn(
        'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer',
        'transition-all duration-200 ease-out',
        isEditing && 'cursor-move',
        isSelected && 'ring-4 ring-white ring-opacity-50 rounded-full'
      )}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        zIndex: node.status === 'current' ? 20 : 10,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Glow effect for current node */}
      {styles.pulse && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            width: size,
            height: size,
            backgroundColor: colors.nodeCurrent,
            opacity: 0.3,
          }}
        />
      )}

      {/* Main node circle */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'transition-transform duration-200 hover:scale-110',
          styles.pulse && 'animate-pulse'
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: styles.bg,
          borderWidth: 3,
          borderColor: styles.border,
          borderStyle: 'solid',
          boxShadow: styles.shadow,
          opacity: styles.opacity,
        }}
      >
        {/* Status indicator */}
        {node.status === 'locked' ? (
          <Lock
            size={iconSize}
            style={{ color: styles.iconColor }}
            className="opacity-70"
          />
        ) : node.status === 'completed' ? (
          <div className="relative">
            <span style={{ fontSize: iconSize }} className="opacity-50">
              {node.icon}
            </span>
            <div
              className="absolute -top-1 -right-1 rounded-full p-0.5"
              style={{ backgroundColor: colors.nodeCompleted }}
            >
              <Check size={12} color="#1a1a2e" strokeWidth={3} />
            </div>
          </div>
        ) : (
          <span style={{ fontSize: iconSize }}>{node.icon}</span>
        )}
      </div>

      {/* Node title */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
          'text-xs font-medium text-center px-2 py-1 rounded',
          node.status === 'locked' ? 'opacity-50' : 'opacity-100'
        )}
        style={{
          top: size + 8,
          color: colors.text,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          maxWidth: 120,
        }}
      >
        {node.title}
      </div>

      {/* Type indicator badge */}
      {node.type === 'boss' && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: colors.nodeCurrent,
            color: colors.text,
          }}
        >
          BOSS
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditing && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: colors.nodeCurrent }}
        />
      )}
    </div>
  );
}

export default JourneyNode;
