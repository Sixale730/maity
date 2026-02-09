/**
 * Recorder Logs Viewer
 *
 * Displays all debug logs for a specific recording session.
 * Shows timestamps, log types, and details in a searchable table.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Copy, User, Clock, FileText, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { cn, getRecorderLogs, type RecorderLog, type RecorderSession, type RecorderLogType } from '@maity/shared';

interface RecorderLogsViewerProps {
  session: RecorderSession;
}

const TYPE_COLORS: Record<RecorderLogType, string> = {
  WS_OPEN: 'text-green-400',
  WS_CLOSE: 'text-red-400',
  WS_ERROR: 'text-red-400',
  DEEPGRAM: 'text-blue-400',
  SEGMENT: 'text-purple-400',
  INTERIM: 'text-gray-400',
  AUDIO: 'text-yellow-400',
  STATE: 'text-orange-400',
  ERROR: 'text-red-400',
  SAVE: 'text-green-400',
};

const TYPE_ICONS: Record<RecorderLogType, string> = {
  WS_OPEN: '\u{1F7E2}',
  WS_CLOSE: '\u{1F534}',
  WS_ERROR: '\u{1F534}',
  DEEPGRAM: '\u{1F535}',
  SEGMENT: '\u{1F7E3}',
  INTERIM: '\u{26AA}',
  AUDIO: '\u{1F7E1}',
  STATE: '\u{1F7E0}',
  ERROR: '\u{1F534}',
  SAVE: '\u{1F7E2}',
};

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  const remainingMs = ms % 1000;
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RecorderLogsViewer({ session }: RecorderLogsViewerProps) {
  const [logs, setLogs] = useState<RecorderLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<RecorderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecorderLogs(session.conversation_id);
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      console.error('[RecorderLogsViewer] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar logs');
    } finally {
      setIsLoading(false);
    }
  }, [session.conversation_id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.log_type.toLowerCase().includes(query) ||
        log.message.toLowerCase().includes(query)
    );
    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  const handleCopyLogs = useCallback(() => {
    const logsJson = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(logsJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [logs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchLogs} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Info Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">
            {session.title || 'Sin título'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{session.user_name || session.user_email || 'Usuario desconocido'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(session.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Duración: {formatDuration(session.duration_seconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{logs.length} logs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Filtrar por tipo o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={handleCopyLogs}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar JSON'}
        </Button>
        <Button onClick={fetchLogs} variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-400">
        {filteredLogs.length} de {logs.length} logs
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {searchQuery ? 'No se encontraron logs con ese criterio' : 'No hay logs para esta sesión'}
        </div>
      ) : (
        <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/10">
                <tr className="text-gray-500 text-left">
                  <th className="w-24 px-4 py-3">TIME</th>
                  <th className="w-28 px-4 py-3">TYPE</th>
                  <th className="px-4 py-3">MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={cn(
                      'border-t border-white/5 hover:bg-white/5',
                      log.log_type === 'ERROR' && 'bg-red-500/10'
                    )}
                  >
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                      {formatTime(log.timestamp_ms)}
                    </td>
                    <td className={cn('px-4 py-2 whitespace-nowrap', TYPE_COLORS[log.log_type])}>
                      <span className="mr-1">{TYPE_ICONS[log.log_type]}</span>
                      {log.log_type}
                    </td>
                    <td className="px-4 py-2 text-gray-300 break-all">
                      {log.message}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <span className="ml-2 text-gray-500">
                          {JSON.stringify(log.details)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default RecorderLogsViewer;
