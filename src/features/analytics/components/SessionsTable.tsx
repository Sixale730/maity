import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import type { SessionListItem } from '@maity/shared';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SessionsTableProps {
  sessions: SessionListItem[];
  onSessionClick?: (session: SessionListItem) => void;
}

export function SessionsTable({ sessions, onSessionClick }: SessionsTableProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Sin evaluar</Badge>;
    if (score >= 80) return <Badge className="bg-green-600">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-blue-600">Bueno</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">Regular</Badge>;
    return <Badge className="bg-red-600">Bajo</Badge>;
  };

  const getPassedIcon = (passed: boolean | null) => {
    if (passed === null) return <Clock className="h-4 w-4 text-gray-400" />;
    if (passed) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Perfil/Escenario</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No hay sesiones disponibles
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow
                key={session.id}
                className={onSessionClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onSessionClick?.(session)}
              >
                <TableCell>
                  <Badge variant={session.type === 'interview' ? 'default' : 'secondary'}>
                    {session.type === 'interview' ? 'Entrevista' : 'Roleplay'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{session.userName}</TableCell>
                <TableCell>{session.companyName || '-'}</TableCell>
                <TableCell>
                  {session.type === 'roleplay'
                    ? `${session.profileName} - ${session.scenarioName}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getScoreBadge(session.score)}
                    {session.type === 'roleplay' && getPassedIcon(session.passed)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{session.status}</Badge>
                </TableCell>
                <TableCell>{formatDuration(session.duration)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(session.startedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
