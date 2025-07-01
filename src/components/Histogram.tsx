'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

/** --------
 * Recibe un arreglo de números crudos; los agrupa en “bins” y
 * dibuja el histograma.
 *  props:
 *    data:       number[]      ← valores (calificaciones, entregas, etc.)
 *    bins?:      number        ← cantidad de barras (por defecto 10)
 *    color?:     string        ← color tailwind/hex de las barras
 * 
 * 
 * -------- */


export default function Histogram({
  data,
  bins = 10,
  color = '#6366F1', // Indigo-500
}: {
  data: number[];
  bins?: number;
  color?: string;
}) {
  if (!data.length) return null;

  /* ---- agrupado simple en bins ---- */
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = (max - min) / bins;

  const counts = Array(bins).fill(0);
  data.forEach((v) => {
    const i = Math.min(
      bins - 1,
      Math.floor((v - min) / step) // bin al que pertenece
    );
    counts[i]++;
  });

  const histData = counts.map((c, i) => ({
    range: `${(min + i * step).toFixed(1)}-${(min + (i + 1) * step).toFixed(
      1
    )}`,
    count: c,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={histData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="range"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
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
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
