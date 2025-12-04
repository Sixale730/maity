/**
 * PathNode Component
 * Individual node in the learning path roadmap
 */

import { memo } from 'react';
import {
  BookOpen,
  Mic,
  Sparkles,
  Flag,
  Trophy,
  Play,
  Video,
  HelpCircle,
  Circle,
  Check,
  Lock,
} from 'lucide-react';
import { cn } from '@maity/shared';
import type { LearningPathNode, NodeStatus } from '@maity/shared';
import { getNodeColorClasses, formatDuration } from '../utils/pathLayout';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'book-open': BookOpen,
  mic: Mic,
  sparkles: Sparkles,
  flag: Flag,
  trophy: Trophy,
  play: Play,
  video: Video,
  'help-circle': HelpCircle,
  circle: Circle,
  check: Check,
  lock: Lock,
};

interface PathNodeProps {
  node: LearningPathNode;
  x: number;
  y: number;
  onClick: (node: LearningPathNode) => void;
}

function PathNodeComponent({ node, x, y, onClick }: PathNodeProps) {
  const isLocked = node.status === 'locked';
  const isAvailable = node.status === 'available';
  const isInProgress = node.status === 'in_progress';
  const isCompleted = node.status === 'completed';

  const colorClasses = getNodeColorClasses(node.color);
  const IconComponent = isLocked ? Lock : (ICON_MAP[node.icon] || Circle);

  const handleClick = () => {
    if (!isLocked) {
      onClick(node);
    }
  };

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Node Circle */}
      <button
        onClick={handleClick}
        disabled={isLocked}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center',
          'border-4 transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Status-based styles
          isLocked && [
            'bg-gray-300 dark:bg-gray-700',
            'border-gray-400 dark:border-gray-600',
            'cursor-not-allowed opacity-60',
          ],
          isAvailable && [
            colorClasses.bg,
            colorClasses.border,
            'cursor-pointer',
            'shadow-lg',
            colorClasses.glow,
            'animate-pulse hover:animate-none hover:scale-110',
          ],
          isInProgress && [
            colorClasses.bg,
            colorClasses.border,
            'cursor-pointer',
            'shadow-lg',
            colorClasses.glow,
            'hover:scale-105',
          ],
          isCompleted && [
            'bg-green-500',
            'border-green-400',
            'cursor-pointer',
            'shadow-lg shadow-green-500/50',
            'hover:scale-105',
          ]
        )}
      >
        {/* Icon */}
        <IconComponent
          className={cn(
            'w-8 h-8',
            isLocked && 'text-gray-500 dark:text-gray-400',
            isAvailable && colorClasses.text,
            isInProgress && colorClasses.text,
            isCompleted && 'text-white'
          )}
        />

        {/* Completed Check Badge */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}

        {/* In Progress Ring */}
        {isInProgress && (
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        )}

        {/* Score Badge (for completed scenario nodes) */}
        {isCompleted && node.score !== null && node.nodeType === 'scenario' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-md">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">
              {Math.round(node.score)}%
            </span>
          </div>
        )}
      </button>

      {/* Node Label */}
      <div className="mt-3 text-center max-w-[140px]">
        <p
          className={cn(
            'text-sm font-medium leading-tight',
            isLocked && 'text-gray-400 dark:text-gray-500',
            !isLocked && 'text-gray-800 dark:text-gray-100'
          )}
        >
          {node.title}
        </p>

        {/* Duration */}
        {node.estimatedDuration && !isLocked && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDuration(node.estimatedDuration)}
          </p>
        )}

        {/* Node Type Badge */}
        <span
          className={cn(
            'inline-block mt-1 px-2 py-0.5 rounded-full text-xs',
            node.nodeType === 'resource' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            node.nodeType === 'scenario' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            node.nodeType === 'checkpoint' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            node.nodeType === 'quiz' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            node.nodeType === 'video' && 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
          )}
        >
          {node.nodeType === 'resource' && 'Recurso'}
          {node.nodeType === 'scenario' && 'Práctica'}
          {node.nodeType === 'checkpoint' && 'Checkpoint'}
          {node.nodeType === 'quiz' && 'Quiz'}
          {node.nodeType === 'video' && 'Video'}
        </span>
      </div>
    </div>
  );
}

export const PathNode = memo(PathNodeComponent);
