'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

/* ---------- Datos de prueba (puedes sustituirlos cuando conectes el backend) ---------- */
export const lineSample: { date: string; value: number }[] = [
  { date: 'Sem 1', value: 22 },
  { date: 'Sem 2', value: 35 },
  { date: 'Sem 3', value: 28 },
  { date: 'Sem 4', value: 41 },
  { date: 'Sem 5', value: 37 },
  { date: 'Sem 6', value: 45 },
];

/* ---------- Componente reutilizable ---------- */
export default function LineActivity({
  data = lineSample,         // usa el array anterior si no recibes props
  color = '#4F46E5',         // indigo-600 por defecto
}: {
  data?: typeof lineSample;
  color?: string;
}) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis fontSize={10} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
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
