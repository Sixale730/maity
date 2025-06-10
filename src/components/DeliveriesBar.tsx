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

/* ---------- fallback / formato de los datos ---------- */
export const deliveriesData = [
  { tarea: 'Tarea #1', entregas: 310 },
  { tarea: 'Tarea #2', entregas: 80 },
  { tarea: 'Tarea #3', entregas: 267 },
  { tarea: 'Tarea #4', entregas: 573 },
];

type Row = { tarea: string; entregas: number };
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ---------- componente ---------- */
export default function DeliveriesBar() {
  const { data, isLoading, error } = useSWR<Row[]>(
    '/api/metrics/deliveries',
    fetcher,
    // { fallbackData: deliveriesData }          // si falla usa mock
  );

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
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="tarea" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip />
        <Bar dataKey="entregas" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
