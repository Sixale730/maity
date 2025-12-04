/**
 * PathConnector Component
 * SVG lines connecting nodes in the learning path
 */

import { memo } from 'react';
import type { NodeStatus } from '@maity/shared';

interface PathConnectorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromStatus: NodeStatus;
  toStatus: NodeStatus;
  nodeSize?: number;
}

function PathConnectorComponent({
  fromX,
  fromY,
  toX,
  toY,
  fromStatus,
  toStatus,
  nodeSize = 80,
}: PathConnectorProps) {
  // Calculate start and end points (center of nodes)
  const startY = fromY + nodeSize / 2 + 10; // Below the from node
  const endY = toY - nodeSize / 2 - 10; // Above the to node
  const midY = (startY + endY) / 2;

  // Determine line style based on status
  const isCompleted = fromStatus === 'completed';
  const isActive = fromStatus === 'completed' && toStatus !== 'locked';
  const isLocked = toStatus === 'locked';

  // Create curved bezier path
  const path = `M ${fromX} ${startY}
                C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${endY}`;

  return (
    <g>
      {/* Background line (gray) */}
      <path
        d={path}
        fill="none"
        stroke={isLocked ? '#9CA3AF' : '#E5E7EB'}
        strokeWidth={4}
        strokeLinecap="round"
        className="dark:stroke-gray-700"
      />

      {/* Foreground line (colored when completed) */}
      {isCompleted && (
        <path
          d={path}
          fill="none"
          stroke="#22C55E"
          strokeWidth={4}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}

      {/* Active pulse effect */}
      {isActive && !isCompleted && (
        <path
          d={path}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="8 8"
          className="animate-pulse"
        />
      )}
    </g>
  );
}

export const PathConnector = memo(PathConnectorComponent);
