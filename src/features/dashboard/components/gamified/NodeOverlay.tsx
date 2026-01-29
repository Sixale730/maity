import { useMemo } from 'react';
import { MountainNode } from '../../hooks/useGamifiedDashboardData';
import { NODE_COLORS, ENEMIES, getPathD } from './mountain-map-types';

interface NodeOverlayProps {
  nodes: MountainNode[];
  completedNodes: number;
}

export function NodeOverlay({ nodes, completedNodes: _completedNodes }: NodeOverlayProps) {
  const pathD = useMemo(() => getPathD(nodes), [nodes]);

  const completedPathD = useMemo(() => {
    const completed = nodes.filter(n => n.status === 'completed' || n.status === 'current');
    return getPathD(completed);
  }, [nodes]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <filter id="overlayNodeGlow">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="overlayPulseGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Skeleton path */}
      <path
        d={pathD}
        fill="none"
        stroke="#4a5568"
        strokeWidth="0.4"
        strokeDasharray="1,1"
        opacity="0.4"
      />

      {/* Completed path */}
      {completedPathD && (
        <path
          d={completedPathD}
          fill="none"
          stroke="#00f5d4"
          strokeWidth="0.5"
          opacity="0.7"
        />
      )}

      {/* Enemy labels */}
      {ENEMIES.map(enemy => {
        const node = nodes[enemy.nodeIndex];
        if (!node) return null;
        return (
          <g key={enemy.name}>
            <text
              x={node.x > 50 ? node.x - 12 : node.x + 5}
              y={node.y - 4}
              fontSize="2"
              fill="#ff6b35"
              fontWeight="bold"
              opacity="0.9"
            >
              {enemy.icon} {enemy.name}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => (
        <g key={node.index}>
          {node.status === 'current' && (
            <circle
              cx={node.x}
              cy={node.y}
              r="2.5"
              fill="none"
              stroke={NODE_COLORS.current}
              strokeWidth="0.3"
              opacity="0.5"
              filter="url(#overlayPulseGlow)"
            >
              <animate
                attributeName="r"
                values="2.5;3.5;2.5"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.1;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          <circle
            cx={node.x}
            cy={node.y}
            r="1.8"
            fill={
              node.status === 'completed'
                ? NODE_COLORS.completed
                : node.status === 'current'
                  ? NODE_COLORS.current
                  : '#1a1a2e'
            }
            stroke={NODE_COLORS[node.status]}
            strokeWidth="0.4"
            filter={node.status !== 'locked' ? 'url(#overlayNodeGlow)' : undefined}
          />

          <text
            x={node.x}
            y={node.y + 0.7}
            textAnchor="middle"
            fontSize="1.8"
            fill={node.status === 'locked' ? '#666' : '#fff'}
            fontWeight="bold"
          >
            {node.index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
