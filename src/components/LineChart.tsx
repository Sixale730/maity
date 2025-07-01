'use client';

import useSWR from 'swr';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

/* fallback local – se usa antes de que llegue el fetch */
export const lineSample = [
  { date: 'Sem 1', value: 22 },
  { date: 'Sem 2', value: 35 },
  { date: 'Sem 3', value: 28 },
  { date: 'Sem 4', value: 41 },
  { date: 'Sem 5', value: 37 },
  { date: 'Sem 6', value: 45 },
];

/* fetcher genérico */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LineActivity({
  color = '#4F46E5', // indigo-600
}: {
  color?: string;
}) {
  const { data, isLoading, error } = useSWR<
    { date: string; value: number }[]
  >('/api/metrics/activity', fetcher, {
    fallbackData: lineSample,
  });

  if (error) {
    return (
      <div className="chart-placeholder">
        <span className="text-red-400 text-sm">Error al cargar datos</span>
      </div>
    );
  }

  if (isLoading && !data?.length) {
    return (
      <div className="chart-placeholder">
        <span className="text-gray-500 text-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} fontSize={10} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            color: '#000',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          labelStyle={{
          color: '#000',
          fontSize: '14px',
          fontWeight: 'bold',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
