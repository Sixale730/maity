/**
 * Audio Visualizer Component
 *
 * Displays animated bars based on audio input level.
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  level: number; // 0-1
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({
  level,
  isActive = true,
  barCount = 5,
  className,
}: AudioVisualizerProps) {
  // Generate bar heights based on level
  const bars = useMemo(() => {
    const heights: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Create a wave-like pattern
      const offset = Math.sin((i / barCount) * Math.PI);
      const baseHeight = 0.2 + offset * 0.3;
      const dynamicHeight = isActive ? level * (0.3 + offset * 0.4) : 0;
      heights.push(Math.min(1, baseHeight + dynamicHeight));
    }
    return heights;
  }, [level, isActive, barCount]);

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 h-12',
        className
      )}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            'w-1.5 rounded-full transition-all duration-75',
            isActive
              ? 'bg-primary'
              : 'bg-muted-foreground/30'
          )}
          style={{
            height: `${height * 100}%`,
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Circular Audio Visualizer
 *
 * Alternative visualizer with circular waveform.
 */
interface CircularVisualizerProps {
  level: number; // 0-1
  isActive?: boolean;
  size?: number;
  className?: string;
}

export function CircularVisualizer({
  level,
  isActive = true,
  size = 120,
  className,
}: CircularVisualizerProps) {
  const pulseScale = isActive ? 1 + level * 0.15 : 1;
  const innerSize = size * 0.7;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer pulse ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-transform duration-75',
          isActive ? 'bg-primary/20' : 'bg-muted/20'
        )}
        style={{
          transform: `scale(${pulseScale})`,
        }}
      />

      {/* Middle ring */}
      <div
        className={cn(
          'absolute rounded-full transition-transform duration-100',
          isActive ? 'bg-primary/30' : 'bg-muted/30'
        )}
        style={{
          width: innerSize * 1.2,
          height: innerSize * 1.2,
          transform: `scale(${1 + level * 0.1})`,
        }}
      />

      {/* Inner circle */}
      <div
        className={cn(
          'absolute rounded-full flex items-center justify-center',
          isActive ? 'bg-primary' : 'bg-muted'
        )}
        style={{
          width: innerSize,
          height: innerSize,
        }}
      >
        {/* Microphone icon or status */}
        <svg
          className="w-8 h-8 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </div>
    </div>
  );
}
