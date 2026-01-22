/**
 * JourneyMap Component
 * Complete hero's journey map composition with mountains, paths, and nodes
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@maity/shared';
import type { JourneyNode as JourneyNodeType, HeroJourneyConfig } from '@maity/shared';
import { MountainBackground } from './MountainBackground';
import { JourneyPath } from './JourneyPath';
import { JourneyNode } from './JourneyNode';
import { NodeInfoPanel } from './NodeInfoPanel';

interface JourneyMapProps {
  config: HeroJourneyConfig;
  isEditing?: boolean;
  selectedNodeId?: string | null;
  onNodeClick?: (node: JourneyNodeType) => void;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  className?: string;
}

export function JourneyMap({
  config,
  isEditing = false,
  selectedNodeId = null,
  onNodeClick,
  onNodeMove,
  onNodeSelect,
  className = '',
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [draggingNode, setDraggingNode] = useState<JourneyNodeType | null>(null);
  const [hoveredNode, setHoveredNode] = useState<JourneyNodeType | null>(null);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: JourneyNodeType) => {
      if (!isEditing) {
        onNodeClick?.(node);
        setHoveredNode(node);
      } else {
        onNodeSelect?.(node.id);
      }
    },
    [isEditing, onNodeClick, onNodeSelect]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent, node: JourneyNodeType) => {
      if (!isEditing) return;
      e.preventDefault();
      setDraggingNode(node);
      onNodeSelect?.(node.id);
    },
    [isEditing, onNodeSelect]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNode || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp values between 5 and 95 to keep nodes visible
      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      onNodeMove?.(draggingNode.id, clampedX, clampedY);
    },
    [draggingNode, onNodeMove]
  );

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // Handle click on background
  const handleBackgroundClick = useCallback(() => {
    if (isEditing) {
      onNodeSelect?.(null);
    } else {
      setHoveredNode(null);
    }
  }, [isEditing, onNodeSelect]);

  // Close info panel
  const handleCloseInfoPanel = useCallback(() => {
    setHoveredNode(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden rounded-lg',
        isEditing && 'cursor-crosshair',
        draggingNode && 'cursor-grabbing',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackgroundClick}
    >
      {/* Mountain background */}
      <MountainBackground
        layers={config.mountainLayers}
        theme={config.theme}
        showSnow={config.theme === 'snow'}
      />

      {/* Path connecting nodes */}
      {containerSize.width > 0 && (
        <JourneyPath
          nodes={config.nodes}
          theme={config.theme}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />
      )}

      {/* Nodes layer */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {config.nodes.map((node) => (
          <JourneyNode
            key={node.id}
            node={node}
            theme={config.theme}
            isSelected={selectedNodeId === node.id}
            isEditing={isEditing}
            onClick={handleNodeClick}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Node info panel (when not editing) */}
      {!isEditing && hoveredNode && (
        <NodeInfoPanel
          node={hoveredNode}
          theme={config.theme}
          onClose={handleCloseInfoPanel}
        />
      )}

      {/* Edit mode indicator */}
      {isEditing && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-pink-500/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
          Modo Edición
        </div>
      )}

      {/* Grid overlay for editing */}
      {isEditing && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern
              id="grid"
              width="10%"
              height="10%"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}
    </div>
  );
}

export default JourneyMap;
