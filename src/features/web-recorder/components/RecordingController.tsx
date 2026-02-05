/**
 * Recording Controller Component
 *
 * Main control buttons for recording (start, pause, stop).
 */

import React from 'react';
import { Button } from '@/ui/components/ui/button';
import { cn } from '@maity/shared';
import { Mic, Pause, Play, Square, Loader2 } from 'lucide-react';

type RecordingStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'saving'
  | 'completed'
  | 'error';

interface RecordingControllerProps {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function RecordingController({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  disabled,
  className,
}: RecordingControllerProps) {
  const isLoading = status === 'initializing' || status === 'processing' || status === 'saving';
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const canStart = status === 'idle' || status === 'ready' || status === 'completed';
  const canStop = isRecording || isPaused;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Main Record/Pause Button */}
      {canStart && (
        <Button
          size="lg"
          variant="default"
          className={cn(
            'w-20 h-20 rounded-full',
            'bg-destructive hover:bg-destructive/90',
            'shadow-lg hover:shadow-xl transition-all'
          )}
          onClick={onStart}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      )}

      {isRecording && (
        <>
          {/* Pause Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full"
            onClick={onPause}
            disabled={disabled}
          >
            <Pause className="w-6 h-6" />
          </Button>

          {/* Stop Button */}
          <Button
            size="lg"
            variant="destructive"
            className="w-20 h-20 rounded-full shadow-lg"
            onClick={onStop}
            disabled={disabled}
          >
            <Square className="w-8 h-8 fill-current" />
          </Button>
        </>
      )}

      {isPaused && (
        <>
          {/* Resume Button */}
          <Button
            size="lg"
            variant="default"
            className={cn(
              'w-20 h-20 rounded-full',
              'bg-destructive hover:bg-destructive/90',
              'shadow-lg animate-pulse'
            )}
            onClick={onResume}
            disabled={disabled}
          >
            <Play className="w-8 h-8 ml-1" />
          </Button>

          {/* Stop Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full"
            onClick={onStop}
            disabled={disabled}
          >
            <Square className="w-6 h-6 fill-current" />
          </Button>
        </>
      )}

      {(status === 'processing' || status === 'saving') && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            {status === 'processing' ? 'Procesando...' : 'Guardando...'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Recording Controller
 *
 * Smaller version for inline use.
 */
interface CompactControllerProps {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function CompactRecordingController({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  disabled,
  className,
}: CompactControllerProps) {
  const isLoading = status === 'initializing' || status === 'processing' || status === 'saving';
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const canStart = status === 'idle' || status === 'ready' || status === 'completed';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {canStart && (
        <Button
          size="icon"
          variant="destructive"
          onClick={onStart}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      )}

      {isRecording && (
        <>
          <Button
            size="icon"
            variant="outline"
            onClick={onPause}
            disabled={disabled}
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={onStop}
            disabled={disabled}
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </>
      )}

      {isPaused && (
        <>
          <Button
            size="icon"
            variant="destructive"
            onClick={onResume}
            disabled={disabled}
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onStop}
            disabled={disabled}
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </>
      )}

      {(status === 'processing' || status === 'saving') && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {status === 'processing' ? 'Procesando...' : 'Guardando...'}
          </span>
        </div>
      )}
    </div>
  );
}
