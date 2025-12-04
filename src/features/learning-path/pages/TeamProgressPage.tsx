/**
 * TeamProgressPage
 * Manager view to see team's learning path progress
 */

import { useUser } from '@/contexts/UserContext';
import { useTeamLearningProgress } from '@maity/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Progress } from '@/ui/components/ui/progress';
import { Skeleton } from '@/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Users, TrendingUp, Clock, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function TeamProgressPage() {
  const { userId, isLoading: userLoading } = useUser();
  const { data: teamProgress, isLoading, error } = useTeamLearningProgress(userId);

  if (userLoading || isLoading) {
    return <TeamProgressSkeleton />;
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">
              Error al cargar el progreso del equipo. Por favor, intenta de nuevo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teamProgress || teamProgress.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hay miembros del equipo</h3>
            <p className="text-gray-500">
              Aún no hay usuarios en tu equipo con rutas de aprendizaje asignadas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate team stats
  const avgProgress =
    teamProgress.reduce((sum, m) => sum + m.progressPercentage, 0) / teamProgress.length;
  const totalCompleted = teamProgress.reduce((sum, m) => sum + m.completedNodes, 0);
  const activeUsers = teamProgress.filter((m) => m.currentNodeTitle !== null).length;

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Progreso del Equipo
        </h1>
        <p className="text-gray-500 mt-1">
          Monitorea el avance de tu equipo en la ruta de aprendizaje
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{teamProgress.length}</p>
            <p className="text-sm text-gray-500">Miembros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{Math.round(avgProgress)}%</p>
            <p className="text-sm text-gray-500">Promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{totalCompleted}</p>
            <p className="text-sm text-gray-500">Nodos Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{activeUsers}</p>
            <p className="text-sm text-gray-500">Activos Ahora</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Detalle por Miembro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="hidden md:table-cell">En Curso</TableHead>
                <TableHead className="hidden md:table-cell">Última Actividad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamProgress.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.userName || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{member.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {member.completedNodes}/{member.totalNodes}
                        </span>
                        <span className="font-medium">{Math.round(member.progressPercentage)}%</span>
                      </div>
                      <Progress value={member.progressPercentage} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.currentNodeTitle ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {member.currentNodeTitle}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.lastActivity ? (
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(member.lastActivity), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamProgressSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamProgressPage;
