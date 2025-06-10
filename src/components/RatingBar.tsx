'use client';

import useSWR from 'swr';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

type Row = { tarea: string; rating: number };

/* fetcher genérico -------------------------------------------------- */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RatingBar() {
  /* SWR llama a tu endpoint (“metrics/ratings”) y cachea  */
  const { data, isLoading, error } = useSWR<Row[]>(
    '/api/metrics/ratings',
    fetcher
  );

  if (error) {
    return (
      <div className="chart-placeholder">
        <span className="text-red-400 text-sm">Error al cargar datos</span>
      </div>
    );
  }

  if (isLoading || !data?.length) {
    return (
      <div className="chart-placeholder">
        <span className="text-gray-500 text-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="tarea" stroke="#9CA3AF" />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          stroke="#9CA3AF"
        />
        <Tooltip />
        <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
