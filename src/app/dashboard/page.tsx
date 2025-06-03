// src/app/dashboard/page.tsx
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './dashboard.css';
import dynamic from 'next/dynamic';

// ⬇️  Importaciones dinámicas de Recharts (solo en el cliente)
const RatingBar     = dynamic(() => import('@/components/RatingBar'));
const DeliveriesBar = dynamic(() => import('@/components/DeliveriesBar'));
const Histogram     = dynamic(() => import('@/components/Histogram'));
const LineActivity = dynamic(() => import('@/components/LineChart'));


export const metadata: Metadata = {
  title: 'Dashboard | Maity',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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

export default function Dashboard() {
  return (
    <main
      className={`${inter.variable} bg-gray-900 p-4 sm:p-6 md:p-8 text-gray-100`}
    >
      {/* ---------- ENCABEZADO ---------- */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Resumen del curso: Desarrollo de liderazgo Q2
        </h1>
      </header>

      {/* ---------- KPIs ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Indicadores clave</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Calificación Promedio"
            value={
              <>
                4.2 <span className="text-xl text-gray-400">estrellas</span>
              </>
            }
            hint="+0.1 vs periodo anterior"
            accent="green"
          />

          <KpiCard
            title="Total Tareas Entregadas"
            value="1 230"
            hint="En 1500 asignadas"
          />

          <KpiCard
            title="Promedio Tareas/Empleado"
            value="8.5"
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

      {/* ---------- RENDIMIENTO EN TAREAS ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Rendimiento en tareas</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="kpi-card">
            <h3 className="card-title mb-4 text-center">
              Calificación promedio por tarea
            </h3>
            {/* <ChartPlaceholder label="Gráfico de Barras: Calificación Promedio por Tarea" /> */}
            <RatingBar/>
          </div>

          <div className="kpi-card">
            <h3 className="card-title mb-4 text-center">
              Participación por tarea (Nº Entregas)
            </h3>
            {/* <ChartPlaceholder label="Gráfico de Barras: Nº Entregas por Tarea" /> */}
            <DeliveriesBar/>
          </div>
        </div>
      </section>

      {/* ---------- DESEMPEÑO DEL GRUPO ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Desempeño del grupo</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="kpi-card">
            <h3 className="card-title mb-4 text-center">
              Distribución de calificaciones del grupo
            </h3>
            <ChartPlaceholder label="Histograma: Distribución de Calificaciones" />
            {/* <Histogram/> */}
          </div>

          <div className="kpi-card">
            <h3 className="card-title mb-4 text-center">
              Distribución del avance del grupo
            </h3>
            <ChartPlaceholder label="Histograma: Tareas Entregadas" />
          </div>
        </div>
      </section>

      {/* ---------- TENDENCIAS DE ACTIVIDAD ---------- */}
      <section className="mb-8">
        <h2 className="section-title">Tendencias de actividad</h2>

        <div className="kpi-card">
          <h3 className="card-title mb-4 text-center">
            Actividad del curso a lo largo del tiempo
          </h3>
          {/* <ChartPlaceholder label="Gráfico de Líneas: Tareas Entregadas por Semana/Día" /> */}
          <LineActivity/>
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
