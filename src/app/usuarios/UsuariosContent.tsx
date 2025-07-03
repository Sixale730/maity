'use client';

import { useState } from 'react';
import UsersChartList from '@/components/UsersChartList';

function KpiCard({
  title,
  value,
  hint,
  accent,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  accent?: 'green' | 'red' | 'gray';
}) {
  const hintColor =
    accent === 'green'
      ? 'text-green-400'
      : accent === 'red'
      ? 'text-red-400'
      : 'text-gray-400';

  return (
    <div className="kpi-card">
      <h3 className="card-title">{title}</h3>
      <p className="kpi-value">{value}</p>
      {hint && <p className={`mt-1 text-xs ${hintColor}`}>{hint}</p>}
    </div>
  );
}

export default function UsuariosContent({
  inter,
  grades,
  deliveriesRaw,
  usersData,
}: {
  inter: any;
  grades: number[];
  deliveriesRaw: { entregas: number }[];
  usersData: {
    nombre: string;
    empresa: string;
    calificaciones: number[];
  }[];
}) {
  
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('Todas');
  const submissions = deliveriesRaw.map((d) => d.entregas);
  const totalEntregas = submissions.reduce((acc, val) => acc + val, 0);
  const avgScore = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);
  const empresas = Array.from(new Set(usersData.map(u => u.empresa)));

  return (
    <main className={`${inter.variable} bg-gray-900 p-4 sm:p-6 md:p-8 text-gray-100`}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Resumen por empresa</h1>
      </header>

      {/* Filtro de empresa */}
      <div className="mb-6">
        <label className="block text-sm mb-1">Empresa:</label>
        <select
          className="text-black p-2 rounded w-full sm:w-60"
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
        >
          <option value="Todas">Todas</option>
          {empresas.map((empresa) => (
            <option key={empresa} value={empresa}>{empresa}</option>
          ))}
        </select>
      </div>

    {/* KPIs */}
    {/* ---------- KPIs ---------- */}
    <section className="mb-8">
    <h2 className="section-title">Indicadores clave</h2>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de empleados por empresa */}
        <KpiCard
        title="Total empleados"
        value={usersData.filter(u => empresaSeleccionada === 'Todas' || u.empresa === empresaSeleccionada).length}
        hint={empresaSeleccionada === 'Todas' ? 'Todas las empresas' : `Solo ${empresaSeleccionada}`}
        />

        {/* Empleado con mejor desempeño */}
        <KpiCard
        title="Mejor desempeño"
        value={
            (() => {
            const filtrados = empresaSeleccionada === 'Todas'? usersData: usersData.filter(u => u.empresa === empresaSeleccionada);
            const mejor = filtrados.reduce((top, actual) => {
            const topProm = top.calificaciones.length > 0 ? top.calificaciones.reduce((a, b) => a + b, 0) / top.calificaciones.length : 0;
            const actualProm = actual.calificaciones.length > 0 ? actual.calificaciones.reduce((a, b) => a + b, 0) / actual.calificaciones.length : 0;
            return actualProm > topProm ? actual : top;
            }, filtrados[0]);
            return mejor?.nombre || '—';
        })()}
        hint="Promedio más alto"
        accent="green"
        />

        {/* Empleado con más tareas entregadas */}
        <KpiCard
        title="Más tareas entregadas"
        value={(() => {
            const filtrados = empresaSeleccionada === 'Todas' ? usersData : usersData.filter(u => u.empresa === empresaSeleccionada);
            const top = filtrados.reduce((prev, curr) =>
            curr.calificaciones.length > prev.calificaciones.length ? curr : prev,
            filtrados[0]
            );

            return top?.nombre || '—';
        })()}
        hint="Mayor número de entregas"
        accent="green"
        />

        {/* Empresa con mayor promedio */}
        <KpiCard
        title="Empresa con mejor promedio"
        value={(() => {
            const empresas = [...new Set(usersData.map(u => u.empresa))];
            const promedios = empresas.map((empresa) => {
            const califs = usersData.filter(u => u.empresa === empresa).flatMap(u => u.calificaciones);
            const prom = califs.length > 0
                ? califs.reduce((a, b) => a + b, 0) / califs.length
                : 0;
            return { empresa, promedio: prom };
            });

            const mejor = promedios.reduce((max, actual) =>
            actual.promedio > max.promedio ? actual : max,
            promedios[0]
            );

            return mejor.empresa || '—';
        })()}
        hint="Basado en calificaciones"
        accent="green"
        />
    </div>
    </section>


      {/* Desempeño individual */}
      <section className="mb-8">
        <h2 className="section-title">Desempeño individual</h2>
        <div className="bg-gray-800 rounded p-4">
          <UsersChartList
            data={usersData}
            empresaSeleccionada={empresaSeleccionada}
          />
        </div>
      </section>
    </main>
  );
}
