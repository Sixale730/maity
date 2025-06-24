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
import { useState } from 'react';

type Row = { tarea: string; rating: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const empresas = ['Todas', 'Merza', 'Basañez', 'Asertio'];

export default function RatingBar() {
  const [empresa, setEmpresa] = useState('Todas')
  /* SWR llama a tu endpoint (“metrics/ratings”) y cachea  */
  const { data, isLoading, error } = useSWR<Row[]>(
    `/api/metrics/ratings?empresa=${empresa !== 'Todas' ? empresa : ''}`,
    fetcher
  );

  
 return (
    <>
      <div className="mb-4">
        <label className="text-sm mr-2">Empresa:</label>
        <select
          onChange={(e) => setEmpresa(e.target.value)}
          value={empresa}
          className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
        >
          {empresas.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="chart-placeholder">
          <span className="text-red-400 text-sm">Error al cargar datos</span>
        </div>
      )}

      {isLoading || !data?.length ? (
        <div className="chart-placeholder">
          <span className="text-gray-500 text-sm">Cargando…</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="tarea"
              stroke="#9CA3AF"
              label={{
                position: 'insideBottom',
                offset: -5,
                content: () => (
                  <text
                    x="50%"
                    y="100%"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Número de tarea
                  </text>
                ),
              }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              stroke="#9CA3AF"
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}`}
              labelFormatter={(label) => `Tarea #${label}`}
            />
            <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
}
