'use client';
import { useState } from 'react';
import RatingBarSimple from './RatingBarSimple';

type UserPerformance = {
  nombre: string;
  empresa: string;
  calificaciones: number[];
};

export default function UsersChartList({ data }: { data: UserPerformance[] }) {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('Todas');

  // Obtener lista única de empresas
  const empresas = Array.from(new Set(data.map(u => u.empresa)));

  // Filtrar por empresa si se selecciona una
  const filtrados = empresaSeleccionada === 'Todas'
    ? data
    : data.filter(u => u.empresa === empresaSeleccionada);

  // Función para calcular el promedio en escala 0-100
  const calcularPromedio = (calificaciones: number[]) => {
    if (calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, val) => acc + val, 0);
    const promedioEstrellas = suma / calificaciones.length;
    return Math.round(promedioEstrellas * 20); // Convertir a escala de 0-100
  };

  return (
    <div className="space-y-6">
      {/* Filtro por empresa */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Empresa:</label>
        <select
          className="text-black p-2 rounded"
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
        >
          <option value="Todas">Todas</option>
          {empresas.map((empresa) => (
            <option key={empresa} value={empresa}>{empresa}</option>
          ))}
        </select>
      </div>

      {/* Tarjetas por usuario */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((u) => {
          const promedio = calcularPromedio(u.calificaciones);
          return (
            <div key={`${u.nombre}-${u.empresa}`} className="p-4 rounded bg-gray-800 min-h-[280px]">
              <h3 className="font-semibold mb-1 text-lg">{u.nombre}</h3>
              <p className="text-sm text-gray-300 mb-3">Promedio: <strong>{promedio}</strong>/100</p>
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
