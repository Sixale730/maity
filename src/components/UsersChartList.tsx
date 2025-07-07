'use client';
import { useState } from 'react';
import RatingBarSimple from './RatingBarSimple';

type UserPerformance = {
  nombre: string;
  empresa: string;
  calificaciones: number[];
};

export default function UsersChartList({
  data,
  empresaSeleccionada,
}: {
  data: UserPerformance[];
  empresaSeleccionada: string;
}) {
  const [ordenPromedio, setOrdenPromedio] = useState<'none' | 'asc' | 'desc'>('none');
  const [ordenTareas, setOrdenTareas] = useState<'none' | 'asc' | 'desc'>('none');

  // Función para calcular el promedio en escala 0-100
  const calcularPromedio = (calificaciones: number[]) => {
    if (calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, val) => acc + val, 0);
    const promedioEstrellas = suma / calificaciones.length;
    return Math.round(promedioEstrellas * 20); // Convertir a escala de 0-100
  };

  // Devuelve clases de Tailwind para el color del texto del promedio
  const obtenerColorTextoPromedio = (promedio: number) => {
    if (promedio >= 80) return 'text-green-400';
    if (promedio >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Filtrar por empresa
  let filtrados = empresaSeleccionada === 'Todas'
    ? [...data]
    : data.filter(u => u.empresa === empresaSeleccionada);

  // Orden por promedio
  if (ordenPromedio !== 'none') {
    filtrados.sort((a, b) => {
      const pa = calcularPromedio(a.calificaciones);
      const pb = calcularPromedio(b.calificaciones);
      return ordenPromedio === 'asc' ? pa - pb : pb - pa;
    });
  }

  // Orden por número de tareas entregadas
  if (ordenTareas !== 'none') {
    filtrados.sort((a, b) => {
      const ta = a.calificaciones.length;
      const tb = b.calificaciones.length;
      return ordenTareas === 'asc' ? ta - tb : tb - ta;
    });
  }

  return (
    <div className="space-y-6">
      {/* Filtros internos */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orden por promedio */}
        <div>
          <label className="block text-sm mb-1">Ordenar por promedio:</label>
          <select
            className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
            value={ordenPromedio}
            onChange={(e) => setOrdenPromedio(e.target.value as any)}
          >
            <option value="none">Sin orden</option>
            <option value="desc">Mayor a menor</option>
            <option value="asc">Menor a mayor</option>
          </select>
        </div>

        {/* Orden por tareas entregadas */}
        <div>
          <label className="block text-sm mb-1">Ordenar por entregas:</label>
          <select
            className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1"
            value={ordenTareas}
            onChange={(e) => setOrdenTareas(e.target.value as any)}
          >
            <option value="none">Sin orden</option>
            <option value="desc">Más entregas primero</option>
            <option value="asc">Menos entregas primero</option>
          </select>
        </div>
      </div>

      {/* Tarjetas por usuario */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((u) => {
          const promedio = calcularPromedio(u.calificaciones);
          return (
            <div key={`${u.nombre}-${u.empresa}`} className="p-4 rounded bg-gray-800 min-h-[280px]">
              <h3 className="font-semibold mb-1 text-lg">{u.nombre}</h3>
              <p className="text-sm text-gray-300 mb-3">
                Promedio:{' '}
                <strong className={obtenerColorTextoPromedio(promedio)}>
                  {promedio}
                </strong>
                /100{' — '}
                <span className="text-xs text-gray-400">
                  {u.calificaciones.length} tareas
                </span>
              </p>
              <div className="w-full" style={{ height: 200 }}>
                <RatingBarSimple data={u.calificaciones} color="#3B82F6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
