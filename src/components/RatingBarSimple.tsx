'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function RatingBarSimple({
  data,
  color = '#6366f1',
}: {
  data: number[];
  color?: string;
}) {
  const chartData = data.map((rating, i) => ({
    tarea: i + 1,
    rating: typeof rating === 'number' && !isNaN(rating) ? rating : 0, // Aquí el fix
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
        <XAxis
          dataKey="tarea"
          stroke="#4B5563"
          label={{ value: 'Tarea', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          stroke="#4B5563"
        />
        <Tooltip
          formatter={(v: number) => `${v.toFixed(1)} estrellas`}
          labelFormatter={(label) => `Tarea #${label}`}
        />
        <Bar dataKey="rating" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
