import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { TrendingUp, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { InterviewRubric } from '@maity/shared';

interface InterviewRubricCardProps {
  title: string;
  rubric: InterviewRubric;
}

const rubricTitles: Record<string, string> = {
  claridad: 'Claridad',
  adaptacion: 'Adaptación',
  persuasion: 'Persuasión',
  estructura: 'Estructura',
  proposito: 'Propósito',
  empatia: 'Empatía',
};

const getScoreColor = (score: number) => {
  if (score >= 4) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
  if (score === 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
  return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
};

const getScoreLabel = (score: number) => {
  if (score >= 4) return 'Excelente';
  if (score === 3) return 'Bueno';
  if (score === 2) return 'En desarrollo';
  return 'Necesita atención';
};

export function InterviewRubricCard({ title, rubric }: InterviewRubricCardProps) {
  const displayTitle = rubricTitles[title] || title;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {displayTitle}
          </CardTitle>
          <Badge className={`${getScoreColor(rubric.score)} border`}>
            {rubric.score}/5 - {getScoreLabel(rubric.score)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Analysis */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rubric.analysis}
          </p>
        </div>

        {/* Strengths */}
        {rubric.strengths && rubric.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Fortalezas
            </div>
            <ul className="space-y-1.5 ml-6">
              {rubric.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-foreground list-disc">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {rubric.areas_for_improvement && rubric.areas_for_improvement.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-500">
              <TrendingUp className="h-4 w-4" />
              Áreas de mejora
            </div>
            <ul className="space-y-1.5 ml-6">
              {rubric.areas_for_improvement.map((area, idx) => (
                <li key={idx} className="text-sm text-foreground list-disc">
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
