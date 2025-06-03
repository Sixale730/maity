'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Ejemplo de datos – cámbialos por los que traigas de Airtable */
export const ratingData = [
  { tarea: 'Tarea #1', rating: 5.5 },
  { tarea: 'Tarea #2', rating: 4.4 },
  { tarea: 'Tarea #3', rating: 9.7 },
  { tarea: 'Tarea #4', rating: 6.8 },
];

export default function RatingBar({
  data = ratingData,
}: {
  data?: typeof ratingData;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="tarea" stroke="#9CA3AF" />
        <YAxis domain={[0, 5]} stroke="#9CA3AF" ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
        <Tooltip />
        <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
