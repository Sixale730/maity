import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import type { WheelRadarPoint } from '@maity/shared';

interface WheelRadarChartProps {
  data: WheelRadarPoint[];
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: 250, md: 350, lg: 450 };

export function WheelRadarChart({ data, size = 'md' }: WheelRadarChartProps) {
  const { t } = useLanguage();

  const chartData = data.map(d => ({
    area: t(d.label_key),
    [t('wheel_of_life.current')]: d.current,
    [t('wheel_of_life.desired')]: d.desired,
  }));

  return (
    <ResponsiveContainer width="100%" height={SIZE_MAP[size]}>
      <RadarChart data={chartData} outerRadius="70%">
        <PolarGrid stroke="#2a2a3e" />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: '#6b7280', fontSize: 9 }}
          tickCount={6}
        />
        <Radar
          name={t('wheel_of_life.current')}
          dataKey={t('wheel_of_life.current')}
          stroke="#00f5d4"
          fill="#00f5d4"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name={t('wheel_of_life.desired')}
          dataKey={t('wheel_of_life.desired')}
          stroke="#f15bb5"
          fill="#f15bb5"
          fillOpacity={0.1}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
