// src/app/usuarios/page.tsx

import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './usuario.css';
import dynamic from 'next/dynamic';
import { getGradesArray, getDeliveries, getUsersPerformance } from '@/lib/airtableCharts';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Componentes de gráficos
const RatingBar = dynamic(() => import('@/components/RatingBar'));
const DeliveriesBar = dynamic(() => import('@/components/DeliveriesBar'));
const Histogram = dynamic(() => import('@/components/Histogram'));
const LineActivity = dynamic(() => import('@/components/LineChart'));
const UsersChartList = dynamic(() => import('@/components/UsersChartList'));

export const metadata: Metadata = {
  title: 'Usuarios | Maity',
};

/* ——— Tarjeta KPI reutilizable ——— */
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

/* ——— Placeholder de gráfico reutilizable ——— */
function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="chart-placeholder">
      <span className="text-sm text-gray-500">[ {label} ]</span>
    </div>
  );
}

export default async function Usuarios() {
  // Protección de ruta
  const user = await getUser();
  if (!user) redirect('/auth/login');

  // Carga de datos después de validar usuario
  const grades = await getGradesArray();
  const deliveriesRaw = await getDeliveries();
  const usersData = await getUsersPerformance();
  const submissions = deliveriesRaw.map((d) => d.entregas);
  const totalEntregas = submissions.reduce((acc, val) => acc + val, 0);
  const avgScore = (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1);

  return (
    <main
      className={`${inter.variable} bg-gray-900 p-4 sm:p-6 md:p-8 text-gray-100`}
    >
      {/* ---------- ENCABEZADO ---------- */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Resumen por empresa</h1>
      </header>

      {/* ---------- KPIs ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Indicadores clave</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Calificación Promedio"
            value={
              <>
                {avgScore}{' '}
                <span className="text-xl text-gray-400">estrellas</span>
              </>
            }
            hint="+0.1 vs periodo anterior"
            accent="green"
          />

          <KpiCard
            title="Total Tareas Entregadas"
            value={totalEntregas.toLocaleString()}
            hint="En 1500 asignadas"
          />

          <KpiCard
            title="Promedio Tareas/Empleado"
            value={(totalEntregas / usersData.length).toFixed(1)}
            hint="de 10 tareas totales"
          />

          <KpiCard
            title="% Empleados Activos"
            value="92 %"
            hint="-3 % vs periodo anterior"
            accent="red"
          />
        </div>
      </section>

      {/* ---------- DESEMPEÑO INDIVIDUAL ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Desempeño individual</h2>

        <div className="bg-gray-800 rounded p-4">
          <UsersChartList data={usersData} />
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="mt-12 border-t border-gray-700 py-4 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Tu Plataforma de Cursos. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
