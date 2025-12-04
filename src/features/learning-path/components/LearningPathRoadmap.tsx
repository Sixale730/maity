/**
 * LearningPathRoadmap Component
 * Main roadmap visualization with serpentine path
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Progress } from '@/ui/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import {
  useLearningPath,
  useCompleteNode,
  useStartNode,
  type LearningPathNode,
} from '@maity/shared';
import { PathNode } from './PathNode';
import { PathConnector } from './PathConnector';
import { NodeDetailModal } from './NodeDetailModal';
import { calculateNodePosition } from '../utils/pathLayout';

interface LearningPathRoadmapProps {
  userId: string;
}

export function LearningPathRoadmap({ userId }: LearningPathRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [selectedNode, setSelectedNode] = useState<LearningPathNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: learningPath, isLoading, error } = useLearningPath(userId);
  const completeNodeMutation = useCompleteNode(userId);
  const startNodeMutation = useStartNode(userId);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleNodeClick = useCallback((node: LearningPathNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNode(null);
  }, []);

  const handleCompleteNode = useCallback(
    async (nodeId: string) => {
      await completeNodeMutation.mutateAsync({ nodeId });
      handleModalClose();
    },
    [completeNodeMutation, handleModalClose]
  );

  const handleStartNode = useCallback(
    async (nodeId: string) => {
      await startNodeMutation.mutateAsync(nodeId);
    },
    [startNodeMutation]
  );

  if (isLoading) {
    return <LearningPathSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="p-6">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar la ruta de aprendizaje. Por favor, intenta de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!learningPath || learningPath.nodes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No tienes una ruta asignada</h3>
          <p className="text-gray-500">
            Contacta a tu administrador para asignarte una ruta de aprendizaje.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { nodes, totalNodes, completedNodes, progressPercentage } = learningPath;

  // Calculate positions for all nodes
  const nodePositions = nodes.map((node, index) =>
    calculateNodePosition(index, containerWidth)
  );

  // Calculate total height needed
  const lastPosition = nodePositions[nodePositions.length - 1];
  const totalHeight = lastPosition ? lastPosition.y + 200 : 600;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Tu Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {completedNodes} de {totalNodes} completados
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedNodes}
                </p>
                <p className="text-xs text-gray-500">Completados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {nodes.filter((n) => n.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500">En Progreso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">
                  {nodes.filter((n) => n.status === 'locked').length}
                </p>
                <p className="text-xs text-gray-500">Bloqueados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Ruta de Aprendizaje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div
            ref={containerRef}
            className="relative overflow-x-hidden"
            style={{ height: totalHeight }}
          >
            {/* SVG Connectors */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={containerWidth}
              height={totalHeight}
            >
              {nodes.slice(0, -1).map((node, index) => {
                const fromPos = nodePositions[index];
                const toPos = nodePositions[index + 1];
                const nextNode = nodes[index + 1];

                return (
                  <PathConnector
                    key={`connector-${node.nodeId}`}
                    fromX={fromPos.x}
                    fromY={fromPos.y}
                    toX={toPos.x}
                    toY={toPos.y}
                    fromStatus={node.status}
                    toStatus={nextNode.status}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, index) => {
              const pos = nodePositions[index];
              return (
                <PathNode
                  key={node.nodeId}
                  node={node}
                  x={pos.x}
                  y={pos.y}
                  onClick={handleNodeClick}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onComplete={handleCompleteNode}
        onStart={handleStartNode}
        isCompleting={completeNodeMutation.isPending}
      />
    </div>
  );
}

function LearningPathSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
