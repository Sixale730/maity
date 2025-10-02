import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar, Clock, Trophy, Target, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VoiceSession {
  id: string;
  session_id: string;
  user_id: string;
  profile_name: string;
  scenario_name: string;
  scenario_code: string;
  difficulty_level: number;
  score: number | null;
  passed: boolean | null;
  min_score_to_pass: number | null;
  processed_feedback: any;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}

export function SessionsHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Use RPC function to get sessions with all details
      const { data, error: fetchError } = await supabase
        .rpc('get_user_sessions_history', { p_auth_id: user.id });

      if (fetchError) {
        console.error('Error fetching sessions:', fetchError);
        setError('No se pudieron cargar las sesiones');
        return;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, passed: boolean | null) => {
    if (status === 'completed' && passed !== null) {
      if (passed) {
        return <Badge className="bg-green-500">Aprobado</Badge>;
      } else {
        return <Badge className="bg-red-500">No Aprobado</Badge>;
      }
    } else if (status === 'in_progress') {
      return <Badge className="bg-yellow-500">En Progreso</Badge>;
    } else if (status === 'abandoned') {
      return <Badge className="bg-gray-500">Abandonado</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  const getDifficultyBadge = (level: number) => {
    const difficulties = {
      1: { label: 'Fácil', color: 'bg-green-100 text-green-800' },
      2: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
      3: { label: 'Difícil', color: 'bg-orange-100 text-orange-800' },
      4: { label: 'Muy Difícil', color: 'bg-red-100 text-red-800' },
      5: { label: 'Experto', color: 'bg-purple-100 text-purple-800' }
    };
    const difficulty = difficulties[level as keyof typeof difficulties] || difficulties[1];
    return <Badge className={difficulty.color}>{difficulty.label}</Badge>;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchSessions} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 space-y-3 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Sesiones</h1>
            <p className="text-sm text-muted-foreground">
              Revisa tu progreso y resultados
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/roleplay')} size="sm">
          Nueva Práctica
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium">Total Sesiones</CardTitle>
            <Target className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium">Aprobadas</CardTitle>
            <Trophy className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">
              {sessions.filter(s => s.passed === true).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {sessions.length > 0
                ? `${Math.round((sessions.filter(s => s.passed === true).length / sessions.length) * 100)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium">Promedio</CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">
              {sessions.filter(s => s.score).length > 0
                ? Math.round(
                    sessions.filter(s => s.score).reduce((acc, s) => acc + (s.score || 0), 0) /
                    sessions.filter(s => s.score).length
                  )
                : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium">Tiempo Total</CardTitle>
            <Clock className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">
              {Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60)} min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Sesiones Recientes</h2>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium">No hay sesiones registradas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Comienza tu primera práctica de roleplay
              </p>
              <Button onClick={() => navigate('/roleplay')} size="sm" className="mt-3">
                Iniciar Práctica
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold">
                          {session.scenario_name || 'Sesión de Práctica'}
                        </h3>
                        {getStatusBadge(session.status, session.passed)}
                        {getDifficultyBadge(session.difficulty_level)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.started_at), "d MMM", { locale: es })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration_seconds)}
                        </div>
                        <div>
                          <span className="font-medium">{session.profile_name}</span>
                        </div>
                      </div>

                      {session.score !== null && (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Score: </span>
                            <span className={`text-base font-bold ${getScoreColor(session.score)}`}>
                              {session.score}/100
                            </span>
                          </div>
                        </div>
                      )}

                      {session.processed_feedback?.feedback && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs line-clamp-2">
                          {session.processed_feedback.feedback}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/sessions/${session.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}