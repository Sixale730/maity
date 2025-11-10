import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import type { SessionsByProfile, SessionsByScenario } from '@maity/shared';
import { UserCircle, FileText } from 'lucide-react';

interface ProfileScenarioStatsProps {
  profiles: SessionsByProfile[];
  scenarios: SessionsByScenario[];
}

export function ProfileScenarioStats({
  profiles,
  scenarios,
}: ProfileScenarioStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Profiles stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Sesiones</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Aprobación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay datos
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.profileId}>
                      <TableCell className="font-medium">
                        {profile.profileName}
                      </TableCell>
                      <TableCell className="text-right">
                        {profile.sessionCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {profile.averageScore.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {profile.passRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Por Escenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escenario</TableHead>
                  <TableHead className="text-right">Sesiones</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Aprobación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay datos
                    </TableCell>
                  </TableRow>
                ) : (
                  scenarios.map((scenario) => (
                    <TableRow key={scenario.scenarioId}>
                      <TableCell className="font-medium">
                        {scenario.scenarioName}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.sessionCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.averageScore.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {scenario.passRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
