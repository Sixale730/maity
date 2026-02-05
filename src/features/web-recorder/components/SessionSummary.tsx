/**
 * Session Summary Component
 *
 * Displays a summary of the recording session before saving.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText, Save, Trash2, Loader2 } from 'lucide-react';

interface TranscriptSegment {
  id: string;
  text: string;
}

interface SessionSummaryProps {
  segments: TranscriptSegment[];
  durationSeconds: number;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
  className?: string;
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
