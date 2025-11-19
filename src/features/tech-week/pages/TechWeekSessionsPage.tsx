import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { TechWeekService, supabase } from '@maity/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Pink theme colors for Tech Week
const PINK_COLORS = {
  primary: '#FF69B4',
  secondary: '#FF85C1',
  light: '#FFF0F5',
};

interface TechWeekSession {
  id: string;
  user_id: string;
  score: number | null;
  passed: boolean | null;
  status: string;
  transcript: string | null;
  duration_seconds: number | null;
  created_at: string;
  ended_at: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function TechWeekSessionsPage() {
  const navigate = useNavigate();
  const { userProfile, isAdmin } = useUser();
  const [sessions, setSessions] = useState<TechWeekSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [userProfile, isAdmin]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userProfile?.auth_id) {
        setError('Usuario no autenticado');
        return;
      }

      let sessionsData;

      if (isAdmin) {
        // Admin sees all sessions
        sessionsData = await TechWeekService.getAllSessions();
      } else {
        // Regular user sees only their sessions
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', userProfile.auth_id)
          .single();

        if (!userData?.id) {
          setError('No se pudo obtener el ID del usuario');
          return;
        }

        sessionsData = await TechWeekService.getSessions(userData.id);
      }

      setSessions(sessionsData || []);

    } catch (err) {
      console.error('Error fetching Tech Week sessions:', err);
      setError('Ocurrió un error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, passed: boolean | null) => {
    if (status === 'completed' && passed !== null) {
      if (passed) {
        return (
          <Badge
            className="text-white"
            style={{ backgroundColor: '#22c55e' }}
          >
            Aprobado
          </Badge>
        );
      } else {
        return (
          <Badge
            className="text-white"
            style={{ backgroundColor: '#ef4444' }}
          >
            No Aprobado
          </Badge>
        );
      }
    } else if (status === 'in_progress') {
      return (
        <Badge
          className="text-white"
          style={{ backgroundColor: '#eab308' }}
        >
          En Progreso
        </Badge>
      );
    } else if (status === 'abandoned') {
      return (
        <Badge
          className="text-white"
          style={{ backgroundColor: '#6b7280' }}
        >
          Abandonado
        </Badge>
      );
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="h-12 w-12 animate-spin mx-auto mb-4"
            style={{ color: PINK_COLORS.primary }}
          />
          <p className="text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={fetchSessions}
            style={{ backgroundColor: PINK_COLORS.primary }}
            className="text-white hover:opacity-90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalSessions = sessions.length;
  const passedSessions = sessions.filter(s => s.passed === true).length;
  const passRate = totalSessions > 0 ? Math.round((passedSessions / totalSessions) * 100) : 0;
  const sessionsWithScore = sessions.filter(s => s.score !== null);
  const averageScore = sessionsWithScore.length > 0
    ? Math.round(sessionsWithScore.reduce((acc, s) => acc + (s.score || 0), 0) / sessionsWithScore.length)
    : null;
  const totalMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tech-week')}
                className="hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: PINK_COLORS.primary }}>
                  Historial de Sesiones
                </h1>
                <p className="text-sm text-gray-400">
                  {isAdmin ? 'Tech Week - Todas las sesiones' : 'Tech Week - Revisa tu progreso'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/tech-week')}
              style={{ backgroundColor: PINK_COLORS.primary }}
              className="text-white hover:opacity-90"
            >
              Nueva Práctica
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">
                  Total Sesiones
                </CardTitle>
                <Target className="h-4 w-4" style={{ color: PINK_COLORS.primary }} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-white">{totalSessions}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">
                  Aprobadas
                </CardTitle>
                <Trophy className="h-4 w-4" style={{ color: PINK_COLORS.primary }} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-white">{passedSessions}</div>
                <p className="text-xs text-gray-500">{passRate}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">
                  Promedio
                </CardTitle>
                <TrendingUp className="h-4 w-4" style={{ color: PINK_COLORS.primary }} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-white">
                  {averageScore !== null ? averageScore : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">
                  Tiempo Total
                </CardTitle>
                <Clock className="h-4 w-4" style={{ color: PINK_COLORS.primary }} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-white">{totalMinutes} min</div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Sesiones Recientes</h2>

            {sessions.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <Trophy
                    className="h-12 w-12 mx-auto mb-4"
                    style={{ color: PINK_COLORS.primary }}
                  />
                  <p className="text-lg font-medium text-white mb-2">
                    No hay sesiones registradas
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Comienza tu primera práctica de Tech Week
                  </p>
                  <Button
                    onClick={() => navigate('/tech-week')}
                    style={{ backgroundColor: PINK_COLORS.primary }}
                    className="text-white hover:opacity-90"
                  >
                    Iniciar Práctica
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
                    onClick={() => navigate(`/tech-week/sessions/${session.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-sm font-semibold text-white">
                              {isAdmin && session.user
                                ? (session.user.name || session.user.email || 'Usuario')
                                : 'Tech Week - Práctica'
                              }
                            </h3>
                            {getStatusBadge(session.status, session.passed)}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(session.created_at), "d MMM yyyy", { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.duration_seconds)}
                            </div>
                            {session.score !== null && (
                              <div className="flex items-center gap-1">
                                <span>Score:</span>
                                <span
                                  className="font-bold"
                                  style={{ color: getScoreColor(session.score) }}
                                >
                                  {session.score}/100
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tech-week/sessions/${session.id}`);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
