/**
 * Live Transcript Component
 *
 * Displays real-time transcription with auto-scroll, highlighting and speaker diarization.
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@maity/shared';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { User, Users } from 'lucide-react';

interface TranscriptSegment {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp?: string;
  speaker?: number;
}

interface LiveTranscriptProps {
  segments: TranscriptSegment[];
  interimText?: string;
  className?: string;
  maxHeight?: string;
  showTimestamps?: boolean;
  primarySpeaker?: number | null;
  showSpeakers?: boolean;
}

// Speaker colors for visual differentiation
const SPEAKER_COLORS = [
  { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30' },
  { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/30' },
  { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/30' },
  { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500/30' },
];

export function LiveTranscript({
  segments,
  interimText,
  className,
  maxHeight = '300px',
  showTimestamps = false,
  primarySpeaker = null,
  showSpeakers = false,
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smart auto-scroll: only scroll if user is near the bottom
  // This prevents interrupting the user when they scroll up to read previous content
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Check if user is near the bottom (within 150px)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments]); // Only trigger on final segments, not interim updates

  const isEmpty = segments.length === 0 && !interimText;

  const getSpeakerColor = (speaker: number | undefined) => {
    if (speaker === undefined) return SPEAKER_COLORS[0];
    return SPEAKER_COLORS[speaker % SPEAKER_COLORS.length];
  };

  const getSpeakerLabel = (speaker: number | undefined) => {
    if (speaker === undefined) return '';
    if (speaker === primarySpeaker) return 'Tú';
    return `P${speaker + 1}`;
  };

  const isUser = (speaker: number | undefined) => speaker === primarySpeaker;

  return (
    <ScrollArea
      className={cn(
        'w-full rounded-lg border bg-muted/30 p-4',
        className
      )}
      style={{ maxHeight }}
    >
      <div ref={scrollRef} className="space-y-3">
        {isEmpty && (
          <p className="text-muted-foreground text-center py-8 italic">
            Las transcripciones aparecerán aquí mientras hablas...
          </p>
        )}

        {segments.map((segment, index) => {
          const speakerColor = getSpeakerColor(segment.speaker);
          const speakerLabel = getSpeakerLabel(segment.speaker);
          const userSpeaker = isUser(segment.speaker);

          return (
            <div
              key={segment.id}
              className={cn(
                'transition-opacity duration-300 flex gap-3',
                index === segments.length - 1 && !interimText
                  ? 'bg-primary/10 rounded px-2 py-1.5 -mx-2'
                  : ''
              )}
            >
              {showSpeakers && segment.speaker !== undefined && (
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center',
                      userSpeaker ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    )}
                  >
                    {userSpeaker ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Users className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      userSpeaker ? 'text-emerald-500' : speakerColor.text
                    )}
                  >
                    {speakerLabel}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {showTimestamps && segment.timestamp && (
                  <span className="text-xs text-muted-foreground mr-2">
                    [{segment.timestamp}]
                  </span>
                )}
                <span className="text-foreground">{segment.text}</span>
              </div>
            </div>
          );
        })}

        {interimText && (
          <div className="text-muted-foreground italic animate-pulse flex gap-3">
            {showSpeakers && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground animate-pulse" />
              </div>
            )}
            <span className="flex-1">{interimText}</span>
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
  showSpeakerCount?: boolean;
}

export function TranscriptStats({ segments, className, showSpeakerCount = false }: TranscriptStatsProps) {
  const totalWords = segments.reduce((count, seg) => {
    return count + seg.text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const totalChars = segments.reduce((count, seg) => {
    return count + seg.text.length;
  }, 0);

  // Count unique speakers
  const uniqueSpeakers = new Set(
    segments
      .filter((seg) => seg.speaker !== undefined)
      .map((seg) => seg.speaker)
  ).size;

  return (
    <div className={cn('flex gap-4 text-xs text-muted-foreground', className)}>
      <span>{segments.length} segmentos</span>
      <span>{totalWords} palabras</span>
      {showSpeakerCount && uniqueSpeakers > 0 && (
        <span>{uniqueSpeakers} participante{uniqueSpeakers !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
