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
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="tarea"
          stroke="#9CA3AF"
          label={{ value: 'Tarea', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          stroke="#9CA3AF"
        />
        <Tooltip
          formatter={(v: number) => `${v.toFixed(1)} estrellas`}
          labelFormatter={(label) => `Tarea #${label}`}
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
        <Bar dataKey="rating" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
