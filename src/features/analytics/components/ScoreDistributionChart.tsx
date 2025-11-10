import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import type { ScoreDistribution } from '@maity/shared';
import { BarChart3 } from 'lucide-react';

interface ScoreDistributionChartProps {
  data: ScoreDistribution[];
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribución de Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.range} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.range}</span>
                <span className="text-muted-foreground">{item.count} sesiones</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
