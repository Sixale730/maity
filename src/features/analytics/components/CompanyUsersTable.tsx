import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/ui/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/components/ui/collapsible';
import type { CompanyWithUsers, UserWithSessions, SessionDetail } from '@maity/shared';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyUsersTableProps {
  companies: CompanyWithUsers[];
}

export function CompanyUsersTable({ companies }: CompanyUsersTableProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set()
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreBadge = (score: number | null, passed: boolean | null) => {
    if (score === null) return <Badge variant="outline">Sin evaluar</Badge>;

    const passedIcon = passed === true
      ? <CheckCircle2 className="h-3 w-3 inline mr-1" />
      : passed === false
      ? <XCircle className="h-3 w-3 inline mr-1" />
      : <Clock className="h-3 w-3 inline mr-1" />;

    if (score >= 80) return <Badge className="bg-green-600">{passedIcon}{score.toFixed(0)}</Badge>;
    if (score >= 60) return <Badge className="bg-blue-600">{passedIcon}{score.toFixed(0)}</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-600">{passedIcon}{score.toFixed(0)}</Badge>;
    return <Badge className="bg-red-600">{passedIcon}{score.toFixed(0)}</Badge>;
  };

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones por Empresa y Usuario</CardTitle>
          <CardDescription>
            Vista detallada de todas las sesiones de roleplay organizadas por empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No hay datos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Sesiones por Empresa y Usuario
        </CardTitle>
        <CardDescription>
          Vista detallada de todas las sesiones de roleplay organizadas por empresa y
          usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((company) => (
            <Collapsible
              key={company.companyId}
              open={expandedCompanies.has(company.companyId)}
              onOpenChange={() => toggleCompany(company.companyId)}
            >
              <Card className="border-2">
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {expandedCompanies.has(company.companyId) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <CardTitle className="text-lg">
                              {company.companyName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {company.totalUsers} usuarios · {company.totalSessions}{' '}
                              sesiones
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-right">
                            <p className="font-semibold">
                              {company.averageScore.toFixed(1)}
                            </p>
                            <p className="text-muted-foreground">Score promedio</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {company.passRate.toFixed(1)}%
                            </p>
                            <p className="text-muted-foreground">Aprobación</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {company.users.map((user) => (
                        <Collapsible
                          key={user.userId}
                          open={expandedUsers.has(user.userId)}
                          onOpenChange={() => toggleUser(user.userId)}
                        >
                          <Card>
                            <CollapsibleTrigger asChild>
                              <div className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader className="py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        {expandedUsers.has(user.userId) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium text-sm">
                                          {user.userName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {user.userEmail}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                      <div className="text-right">
                                        <p className="font-semibold">
                                          {user.totalSessions}
                                        </p>
                                        <p className="text-muted-foreground">
                                          Sesiones
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold">
                                          {user.averageScore.toFixed(1)}
                                        </p>
                                        <p className="text-muted-foreground">Score</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold">
                                          {user.passRate.toFixed(1)}%
                                        </p>
                                        <p className="text-muted-foreground">
                                          Aprobación
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="rounded-md border mt-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Escenario</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Duración</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {user.sessions.map((session) => (
                                        <TableRow key={session.sessionId}>
                                          <TableCell className="text-xs">
                                            {formatDistanceToNow(
                                              new Date(session.startedAt),
                                              {
                                                addSuffix: true,
                                                locale: es,
                                              }
                                            )}
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            <Badge variant="outline">
                                              {session.profileName}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            {session.scenarioName}
                                          </TableCell>
                                          <TableCell>
                                            {getScoreBadge(
                                              session.score,
                                              session.passed
                                            )}
                                          </TableCell>
                                          <TableCell className="text-xs">
                                            {formatDuration(session.duration)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
