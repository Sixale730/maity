/**
 * Recording Timer Component
 *
 * Displays elapsed recording time in MM:SS format.
 */

import React from 'react';
import { cn } from '@maity/shared';

interface RecordingTimerProps {
  seconds: number;
  isPaused?: boolean;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function RecordingTimer({ seconds, isPaused, className }: RecordingTimerProps) {
  return (
    <div
      className={cn(
        'font-mono text-4xl font-bold tabular-nums tracking-wider',
        isPaused ? 'text-muted-foreground animate-pulse' : 'text-foreground',
        className
      )}
    >
      {formatTime(seconds)}
    </div>
  );
}
