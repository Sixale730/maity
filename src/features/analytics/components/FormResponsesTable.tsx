/**
 * FormResponsesTable Component
 * Displays self-assessment (autoevaluación) data by company
 * Shows 6 competency scores and overall average
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import { Badge } from '@/ui/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFormResponsesAnalytics } from '@/features/analytics/hooks/useFormResponsesAnalytics';
import type { FormResponseAnalytics } from '@/features/analytics/hooks/useFormResponsesAnalytics';

interface FormResponsesTableProps {
  companyId?: string;
}

export function FormResponsesTable({ companyId }: FormResponsesTableProps) {
  const { data: responses = [], isLoading, error } = useFormResponsesAnalytics({ companyId });

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 4.5) return 'default'; // Green (Excelente)
    if (score >= 3.5) return 'secondary'; // Blue (Bueno)
    if (score >= 2.5) return 'outline'; // Yellow (Regular)
    return 'destructive'; // Red (Bajo)
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 4.5) return 'Excelente';
    if (score >= 3.5) return 'Bueno';
    if (score >= 2.5) return 'Regular';
    return 'Bajo';
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Error al cargar autoevaluaciones: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Autoevaluaciones</h3>
          <p className="text-sm text-muted-foreground">
            {responses.length} {responses.length === 1 ? 'respuesta' : 'respuestas'}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="text-center">Claridad</TableHead>
              <TableHead className="text-center">Adaptación</TableHead>
              <TableHead className="text-center">Persuasión</TableHead>
              <TableHead className="text-center">Estructura</TableHead>
              <TableHead className="text-center">Propósito</TableHead>
              <TableHead className="text-center">Empatía</TableHead>
              <TableHead className="text-center">Promedio</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  Cargando autoevaluaciones...
                </TableCell>
              </TableRow>
            ) : responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No hay autoevaluaciones disponibles
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response: FormResponseAnalytics) => (
                <TableRow key={response.user_id}>
                  <TableCell className="font-medium">{response.user_name}</TableCell>
                  <TableCell className="text-muted-foreground">{response.user_email}</TableCell>
                  <TableCell>{response.company_name || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.claridad_avg)}>
                      {response.claridad_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.adaptacion_avg)}>
                      {response.adaptacion_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.persuasion_avg)}>
                      {response.persuasion_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.estructura_avg)}>
                      {response.estructura_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.proposito_avg)}>
                      {response.proposito_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.empatia_avg)}>
                      {response.empatia_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getScoreBadgeVariant(response.overall_avg)} className="font-semibold">
                      {response.overall_avg.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(response.submitted_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
