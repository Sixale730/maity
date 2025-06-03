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

export const deliveriesData = [
  { tarea: 'Tarea #1', entregas: 310 },
  { tarea: 'Tarea #2', entregas: 80 },
  { tarea: 'Tarea #3', entregas: 267 },
  { tarea: 'Tarea #4', entregas: 573 },
];

export default function DeliveriesBar({
  data = deliveriesData,
}: {
  data?: typeof deliveriesData;
}) {
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
