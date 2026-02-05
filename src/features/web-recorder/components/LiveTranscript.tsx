/**
 * Live Transcript Component
 *
 * Displays real-time transcription with auto-scroll and highlighting.
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptSegment {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp?: string;
}

interface LiveTranscriptProps {
  segments: TranscriptSegment[];
  interimText?: string;
  className?: string;
  maxHeight?: string;
  showTimestamps?: boolean;
}

export function LiveTranscript({
  segments,
  interimText,
  className,
  maxHeight = '300px',
  showTimestamps = false,
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, interimText]);

  const isEmpty = segments.length === 0 && !interimText;

  return (
    <ScrollArea
      className={cn(
        'w-full rounded-lg border bg-muted/30 p-4',
        className
      )}
      style={{ maxHeight }}
    >
      <div ref={scrollRef} className="space-y-2">
        {isEmpty && (
          <p className="text-muted-foreground text-center py-8 italic">
            Las transcripciones aparecerán aquí mientras hablas...
          </p>
        )}

        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className={cn(
              'transition-opacity duration-300',
              index === segments.length - 1 && !interimText
                ? 'bg-primary/10 rounded px-2 py-1 -mx-2'
                : ''
            )}
          >
            {showTimestamps && segment.timestamp && (
              <span className="text-xs text-muted-foreground mr-2">
                [{segment.timestamp}]
              </span>
            )}
            <span className="text-foreground">{segment.text}</span>
          </div>
        ))}

        {interimText && (
          <div className="text-muted-foreground italic animate-pulse">
            {interimText}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

/**
 * Compact Transcript Display
 *
 * Shows only the latest transcript line.
 */
interface CompactTranscriptProps {
  latestText?: string;
  interimText?: string;
  className?: string;
}

export function CompactTranscript({
  latestText,
  interimText,
  className,
}: CompactTranscriptProps) {
  const displayText = interimText || latestText;

  if (!displayText) {
    return (
      <div className={cn('text-muted-foreground italic text-sm', className)}>
        Esperando audio...
      </div>
    );
  }

  return (
    <div
      className={cn(
        'text-sm line-clamp-2',
        interimText ? 'text-muted-foreground italic' : 'text-foreground',
        className
      )}
    >
      {displayText}
    </div>
  );
}

/**
 * Transcript Word Count
 *
 * Shows statistics about the transcript.
 */
interface TranscriptStatsProps {
  segments: TranscriptSegment[];
  className?: string;
}

export function TranscriptStats({ segments, className }: TranscriptStatsProps) {
  const totalWords = segments.reduce((count, seg) => {
    return count + seg.text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const totalChars = segments.reduce((count, seg) => {
    return count + seg.text.length;
  }, 0);

  return (
    <div className={cn('flex gap-4 text-xs text-muted-foreground', className)}>
      <span>{segments.length} segmentos</span>
      <span>{totalWords} palabras</span>
      <span>{totalChars} caracteres</span>
    </div>
  );
}
