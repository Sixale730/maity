/**
 * JourneyPath Component
 * SVG path connecting nodes with Bezier curves and status-based styling
 */

import { useMemo } from 'react';
import type { JourneyNode, JourneyTheme } from '@maity/shared';
import { JOURNEY_THEME_COLORS } from '@maity/shared';

interface JourneyPathProps {
  nodes: JourneyNode[];
  theme: JourneyTheme;
  containerWidth: number;
  containerHeight: number;
}

interface PathSegment {
  path: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  fromNode: JourneyNode;
  toNode: JourneyNode;
}

/**
 * Generate a smooth Bezier curve between two points
 */
function generateCurvePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  // Calculate control points for smooth S-curve
  const midY = (y1 + y2) / 2;
  const dx = Math.abs(x2 - x1);
  const curvature = Math.min(dx * 0.5, 50);

  // Create S-curve effect
  const cp1x = x1;
  const cp1y = y1 + (midY - y1) * 0.8;
  const cp2x = x2;
  const cp2y = y2 - (y2 - midY) * 0.8;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

/**
 * Determine segment status based on connected nodes
 */
function getSegmentStatus(
  fromNode: JourneyNode,
  toNode: JourneyNode
): PathSegment['status'] {
  // If both completed, segment is completed
  if (fromNode.status === 'completed' && toNode.status === 'completed') {
    return 'completed';
  }
  // If from is completed and to is current, show as current
  if (fromNode.status === 'completed' && toNode.status === 'current') {
    return 'current';
  }
  // If from is completed and to is available, show as available
  if (fromNode.status === 'completed' && toNode.status === 'available') {
    return 'available';
  }
  // If from is current and to is anything, show as available
  if (fromNode.status === 'current') {
    return 'available';
  }
  // Default to locked
  return 'locked';
}

/**
 * Get path styles based on segment status
 */
function getPathStyles(status: PathSegment['status'], colors: typeof JOURNEY_THEME_COLORS.snow) {
  switch (status) {
    case 'completed':
      return {
        stroke: colors.pathLine,
        strokeWidth: 4,
        strokeDasharray: 'none',
        opacity: 1,
        glow: true,
      };
    case 'current':
      return {
        stroke: colors.nodeCurrent,
        strokeWidth: 4,
        strokeDasharray: '8 4',
        opacity: 1,
        glow: true,
        animate: true,
      };
    case 'available':
      return {
        stroke: colors.nodeAvailable,
        strokeWidth: 3,
        strokeDasharray: '6 6',
        opacity: 0.8,
        glow: false,
      };
    case 'locked':
    default:
      return {
        stroke: colors.nodeLocked,
        strokeWidth: 2,
        strokeDasharray: '4 8',
        opacity: 0.4,
        glow: false,
      };
  }
}

export function JourneyPath({
  nodes,
  theme,
  containerWidth,
  containerHeight,
}: JourneyPathProps) {
  const colors = JOURNEY_THEME_COLORS[theme];

  // Sort nodes by y position (bottom to top)
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => b.y - a.y),
    [nodes]
  );

  // Generate path segments between consecutive nodes
  const pathSegments = useMemo<PathSegment[]>(() => {
    if (sortedNodes.length < 2) return [];

    return sortedNodes.slice(0, -1).map((fromNode, index) => {
      const toNode = sortedNodes[index + 1];
      const x1 = (fromNode.x / 100) * containerWidth;
      const y1 = (fromNode.y / 100) * containerHeight;
      const x2 = (toNode.x / 100) * containerWidth;
      const y2 = (toNode.y / 100) * containerHeight;

      return {
        path: generateCurvePath(x1, y1, x2, y2),
        status: getSegmentStatus(fromNode, toNode),
        fromNode,
        toNode,
      };
    });
  }, [sortedNodes, containerWidth, containerHeight]);

  if (pathSegments.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      {/* Gradient and filter definitions */}
      <defs>
        {/* Glow filter */}
        <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor={colors.pathLine} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Current path animation */}
        <style>
          {`
            @keyframes dash-animation {
              to {
                stroke-dashoffset: -24;
              }
            }
            .animate-dash {
              animation: dash-animation 1s linear infinite;
            }
          `}
        </style>
      </defs>

      {/* Render path segments */}
      {pathSegments.map((segment, index) => {
        const styles = getPathStyles(segment.status, colors);
        return (
          <g key={`segment-${index}`}>
            {/* Background glow */}
            {styles.glow && (
              <path
                d={segment.path}
                fill="none"
                stroke={styles.stroke}
                strokeWidth={styles.strokeWidth + 6}
                strokeLinecap="round"
                opacity={0.2}
                filter="url(#path-glow)"
              />
            )}
            {/* Main path */}
            <path
              d={segment.path}
              fill="none"
              stroke={styles.stroke}
              strokeWidth={styles.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={styles.strokeDasharray}
              opacity={styles.opacity}
              className={styles.animate ? 'animate-dash' : ''}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default JourneyPath;
