import { useState } from 'react';
import { DollarSign, Clock, Zap } from 'lucide-react';
import { FadeIn } from '../FadeIn';

export const ROICalculator = () => {
  const [employees, setEmployees] = useState(100);
  const hourlyRate = 25;
  const hoursSavedPerMonth = 4;

  const monthlySavings = employees * hoursSavedPerMonth * hourlyRate;
  const yearlySavings = monthlySavings * 12;
  const productivityGain = Math.floor(employees * 0.15);

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-green-500/10 rounded-full mb-4">
            <DollarSign size={20} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Calculadora de ROI</h2>
          <p className="text-gray-400">Estima el impacto de Maity en tu organización.</p>
        </div>

        <FadeIn>
          <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[100px]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Número de Empleados
                </label>
                <div className="text-5xl font-bold text-white mb-6 font-mono">{employees}</div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10</span>
                  <span>500</span>
                  <span>1000+</span>
                </div>
                <p className="text-xs text-gray-500 mt-8 leading-relaxed">
                  *Cálculo basado en un ahorro promedio de 4 horas/mes por empleado y un costo hora
                  promedio de $25 USD.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-[#141414] p-6 rounded-xl border border-green-500/20">
                  <div className="text-sm text-green-400 mb-1 flex items-center gap-2">
                    <DollarSign size={16} /> Ahorro Anual Estimado
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    ${yearlySavings.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                      <Clock size={14} /> Horas Ahorradas
                    </div>
                    <div className="text-xl font-bold text-white">
                      {(employees * hoursSavedPerMonth * 12).toLocaleString()}h/año
                    </div>
                  </div>
                  <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-purple-400 mb-1 flex items-center gap-2">
                      <Zap size={14} /> Productividad
                    </div>
                    <div className="text-xl font-bold text-white">Eq. a {productivityGain} FTEs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ROICalculator;
