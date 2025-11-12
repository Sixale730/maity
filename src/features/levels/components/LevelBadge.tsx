/**
 * LevelBadge Component
 * Displays a user's level badge with icon, name, and color
 */

import { getLevelInfo } from '../utils/levelHelpers';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export function LevelBadge({
  level,
  size = 'md',
  showDescription = false,
  className = ''
}: LevelBadgeProps) {
  const levelInfo = getLevelInfo(level);

  const sizeClasses = {
    sm: {
      icon: 'text-2xl',
      name: 'text-sm',
      container: 'gap-2',
    },
    md: {
      icon: 'text-4xl',
      name: 'text-lg',
      container: 'gap-3',
    },
    lg: {
      icon: 'text-6xl',
      name: 'text-2xl',
      container: 'gap-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${classes.container} ${className}`}>
      <div className={`${classes.icon}`}>
        {levelInfo.icon}
      </div>
      <div className="text-center">
        <div className={`font-bold ${levelInfo.color} ${classes.name}`}>
          {levelInfo.name}
        </div>
        {showDescription && (
          <p className="text-sm text-gray-600 mt-2">
            {levelInfo.description}
          </p>
        )}
      </div>
    </div>
  );
}
