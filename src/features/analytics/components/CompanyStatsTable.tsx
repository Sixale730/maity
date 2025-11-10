import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import type { SessionsByCompany } from '@maity/shared';
import { Building2 } from 'lucide-react';

interface CompanyStatsTableProps {
  data: SessionsByCompany[];
}

export function CompanyStatsTable({ data }: CompanyStatsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Estadísticas por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Entrevistas</TableHead>
                <TableHead className="text-right">Roleplay</TableHead>
                <TableHead className="text-right">Score Promedio</TableHead>
                <TableHead className="text-right">Tasa Aprobación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                data.map((company) => (
                  <TableRow key={company.companyId}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell className="text-right">{company.interviewCount}</TableCell>
                    <TableCell className="text-right">{company.roleplayCount}</TableCell>
                    <TableCell className="text-right">
                      {company.averageScore.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {company.passRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
