/**
 * Session Summary Component
 *
 * Displays a summary of the recording session before saving.
 */

import React from 'react';
import { cn } from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Clock, FileText, Save, Trash2, Loader2, User, Users } from 'lucide-react';

interface TranscriptSegment {
  id: string;
  text: string;
  speaker?: number;
}

interface SessionSummaryProps {
  segments: TranscriptSegment[];
  durationSeconds: number;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  className?: string;
  primarySpeaker?: number | null;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function SessionSummary({
  segments,
  durationSeconds,
  onSave,
  onDiscard,
  isSaving,
  className,
  primarySpeaker = null,
}: SessionSummaryProps) {
  const wordCount = segments.reduce((count, seg) => {
    return count + seg.text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const previewText = segments
    .slice(0, 5)
    .map((s) => s.text)
    .join(' ');

  const truncatedPreview =
    previewText.length > 300 ? previewText.slice(0, 300) + '...' : previewText;

  // Calculate speaker stats
  const speakerStats = segments.reduce((acc, seg) => {
    if (seg.speaker !== undefined) {
      if (!acc[seg.speaker]) {
        acc[seg.speaker] = { segmentCount: 0, wordCount: 0 };
      }
      acc[seg.speaker].segmentCount++;
      acc[seg.speaker].wordCount += seg.text.split(/\s+/).filter(Boolean).length;
    }
    return acc;
  }, {} as Record<number, { segmentCount: number; wordCount: number }>);

  const speakerCount = Object.keys(speakerStats).length;

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resumen de Grabación
        </CardTitle>
        <CardDescription>
          Revisa la grabación antes de guardar
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{formatDuration(durationSeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{wordCount} palabras</span>
          </div>
          <div className="text-muted-foreground">
            {segments.length} segmentos
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vista Previa</h4>
          <ScrollArea className="h-32 rounded-md border bg-muted/30 p-3">
            {truncatedPreview || (
              <span className="text-muted-foreground italic">
                No hay transcripción disponible
              </span>
            )}
          </ScrollArea>
        </div>

        {/* Participants detected */}
        {speakerCount > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participantes Detectados
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(speakerStats).map(([speakerId, stats]) => {
                const isUser = parseInt(speakerId) === primarySpeaker;
                return (
                  <div
                    key={speakerId}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                      isUser
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        isUser ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                      )}
                    >
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">
                      {isUser ? 'Tú' : `Participante ${parseInt(speakerId) + 1}`}
                    </span>
                    <span className="text-xs opacity-70">
                      {stats.wordCount} palabras
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning if empty */}
        {segments.length === 0 && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            No se detectó ninguna transcripción. ¿Deseas guardar de todas formas?
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDiscard}
          disabled={isSaving}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Descartar
        </Button>
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Compact Summary Stats
 */
interface SummaryStatsProps {
  segments: number;
  wordCount: number;
  durationSeconds: number;
  className?: string;
}

export function SummaryStats({
  segments,
  wordCount,
  durationSeconds,
  className,
}: SummaryStatsProps) {
  return (
    <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatDuration(durationSeconds)}</span>
      </div>
      <div>{wordCount} palabras</div>
      <div>{segments} segmentos</div>
    </div>
  );
}
