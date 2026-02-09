/**
 * Recorder Sessions List
 *
 * Lists all web recorder sessions with their log counts.
 * Admin can filter by user and click to view detailed logs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, User, Clock, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Card, CardContent } from '@/ui/components/ui/card';
import { listRecorderSessions, type RecorderSession } from '@maity/shared';

interface RecorderSessionsListProps {
  onSelectSession: (session: RecorderSession) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RecorderSessionsList({ onSelectSession }: RecorderSessionsListProps) {
  const [sessions, setSessions] = useState<RecorderSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<RecorderSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listRecorderSessions(100);
      setSessions(data);
      setFilteredSessions(data);
    } catch (err) {
      console.error('[RecorderSessionsList] Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter sessions by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(
      (s) =>
        s.user_name?.toLowerCase().includes(query) ||
        s.user_email?.toLowerCase().includes(query) ||
        s.title?.toLowerCase().includes(query)
    );
    setFilteredSessions(filtered);
  }, [searchQuery, sessions]);

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
        <Button onClick={fetchSessions} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por usuario, email o título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Button onClick={fetchSessions} variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-400">
        {filteredSessions.length} de {sessions.length} sesiones
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {searchQuery ? 'No se encontraron sesiones con ese criterio' : 'No hay sesiones de grabación'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.conversation_id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onSelectSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Title and Date */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white truncate">
                        {session.title || 'Sin título'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {format(new Date(session.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                      </span>
                    </div>

                    {/* User and Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">
                          {session.user_name || session.user_email || 'Usuario desconocido'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{session.log_count} logs</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecorderSessionsList;
