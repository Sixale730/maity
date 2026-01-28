import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, ChevronDown, Minus } from 'lucide-react';
import { COLORS } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="py-24 bg-[#050505] text-[#e7e7e9]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <FadeIn>
          <h2 className="text-4xl font-bold mb-4 text-white">Elige tu plan de evolución</h2>
          <p className="text-gray-400 mb-8">
            Todos los planes incluyen 7 días gratis. Cancela cuando quieras.
          </p>

          <div className="flex justify-center items-center gap-4 mb-16 bg-[#0F0F0F] inline-flex p-1 rounded-full border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Anual{' '}
              <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                -20%
              </span>
            </button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* FREE PLAN */}
          <FadeIn delay={100} className="h-full">
            <div className="border border-white/10 rounded-xl p-8 bg-[#0F0F0F] text-left hover:border-white/20 transition-all flex flex-col h-full">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-200">MAITY FREE</h3>
                <p className="text-xs text-gray-500">Para probar y empezar</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                $0<span className="text-sm font-normal text-gray-500">/mes</span>
              </p>

              <ul className="space-y-4 mb-8 text-sm text-gray-400 flex-grow">
                <li className="flex gap-2">
                  <Check size={16} className="text-gray-500" /> 5 prácticas mensuales
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-gray-500" /> Análisis básico
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-gray-500" /> 3 escenarios básicos
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-gray-500" /> Muletillas y ritmo
                </li>
                <li className="flex gap-2 text-gray-600">
                  <X size={16} className="text-red-900" /> Sin análisis avanzado
                </li>
                <li className="flex gap-2 text-gray-600">
                  <X size={16} className="text-red-900" /> Sin escenarios personalizados
                </li>
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 rounded border border-white/20 font-bold hover:bg-white/5 transition-colors text-white mt-auto"
              >
                Empezar gratis
              </button>
            </div>
          </FadeIn>

          {/* PRO PLAN */}
          <FadeIn delay={200} className="h-full">
            <div
              className="border-2 rounded-xl p-8 shadow-xl text-left relative transform md:-translate-y-4 bg-black text-white flex flex-col h-full"
              style={{ borderColor: COLORS.maityPink }}
            >
              <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                RECOMENDADO
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-xl text-white">MAITY PRO</h3>
                <p className="text-xs text-pink-200">Para mejorar en serio</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                ${annual ? '9.99' : '12.99'}
                <span className="text-sm font-normal text-gray-400">/mes</span>
              </p>

              <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-grow">
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> <strong>Prácticas ilimitadas</strong>
                </li>
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> Análisis completo (energía, contacto
                  visual)
                </li>
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> 15+ escenarios y 10+ IAs
                </li>
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> Feedback detallado con IA
                </li>
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> Metas y Gamificación completa
                </li>
                <li className="flex gap-2">
                  <Check size={16} color={COLORS.maityPink} /> Historial ilimitado
                </li>
                <li className="flex gap-2 text-pink-400 font-bold text-xs mt-4 pt-4 border-t border-white/10">
                  <Star size={12} /> Bonus: Descuento en Wearable ($20 off)
                </li>
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 rounded font-bold transition-transform hover:scale-105 mt-auto"
                style={{ backgroundColor: COLORS.maityPink }}
              >
                Iniciar prueba (7 días gratis)
              </button>
            </div>
          </FadeIn>

          {/* WEARABLE PLAN */}
          <FadeIn delay={300} className="h-full">
            <div className="border border-blue-500/30 rounded-xl p-8 bg-[#0A0A0A] text-left hover:border-blue-500/50 transition-all flex flex-col relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="mb-4 relative z-10">
                <h3 className="font-bold text-xl text-blue-100">MAITY WEARABLE</h3>
                <p className="text-xs text-blue-400">Coaching en la vida real</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                $99<span className="text-sm font-normal text-gray-500"> pago único</span>
              </p>

              <ul className="space-y-4 mb-8 text-sm text-gray-400 flex-grow relative z-10">
                <li className="flex gap-2">
                  <Check size={16} className="text-blue-400" /> Dispositivo Maity Pendant
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-blue-400" /> Análisis de conversaciones reales
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-blue-400" /> Feedback discreto (vibración)
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-blue-400" /> Privacidad y encriptación
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="text-blue-400" /> Batería 48h + Peso ligero (~15g)
                </li>
                <li className="text-xs text-gray-500 mt-2 italic">
                  * Requiere suscripción activa (Free o Pro)
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-blue-500/50 font-bold hover:bg-blue-900/20 transition-colors text-blue-100 mt-auto relative z-10">
                Comprar
              </button>
            </div>
          </FadeIn>
        </div>

        {/* COMPARISON TABLE TOGGLE */}
        <FadeIn delay={400} className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto mb-8 transition-colors"
          >
            {showTable ? 'Ocultar comparativa detallada' : 'Ver tabla comparativa completa'}
            <ChevronDown
              size={16}
              className={`transform transition-transform ${showTable ? 'rotate-180' : ''}`}
            />
          </button>

          {showTable && (
            <div className="overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-500">
              <table className="w-full text-left text-sm text-gray-400">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 font-normal">Característica</th>
                    <th className="py-4 px-4 font-bold text-white text-center">FREE</th>
                    <th className="py-4 px-4 font-bold text-pink-500 text-center">PRO</th>
                    <th className="py-4 px-4 font-bold text-blue-400 text-center">WEARABLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { feat: 'Prácticas con IA', free: '5/mes', pro: 'Ilimitadas', wear: '—' },
                    { feat: 'Análisis básico', free: true, pro: true, wear: true },
                    { feat: 'Análisis avanzado', free: false, pro: true, wear: true },
                    { feat: 'Escenarios', free: '3', pro: '15+', wear: '—' },
                    { feat: 'Metas personalizadas', free: false, pro: true, wear: true },
                    { feat: 'Avatares', free: '1', pro: 'Todos', wear: 'Todos' },
                    { feat: 'Historial', free: '30 días', pro: 'Ilimitado', wear: 'Ilimitado' },
                    { feat: 'Conversaciones reales', free: false, pro: false, wear: true },
                    { feat: 'Feedback en tiempo real', free: false, pro: false, wear: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">{row.feat}</td>
                      <td className="py-3 px-4 text-center">
                        {row.free === true ? (
                          <Check size={16} className="mx-auto text-green-500" />
                        ) : row.free === false ? (
                          <Minus size={16} className="mx-auto text-gray-600" />
                        ) : (
                          row.free
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.pro === true ? (
                          <Check size={16} className="mx-auto text-pink-500" />
                        ) : row.pro === false ? (
                          <Minus size={16} className="mx-auto text-gray-600" />
                        ) : (
                          <span className="text-pink-500 font-bold">{row.pro}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.wear === true ? (
                          <Check size={16} className="mx-auto text-blue-400" />
                        ) : row.wear === false ? (
                          <Minus size={16} className="mx-auto text-gray-600" />
                        ) : (
                          row.wear
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* BUNDLES */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-blue-400 uppercase mb-1">Starter Pack</div>
                    <div className="text-white font-bold">Wearable + 3 meses Pro</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$129</div>
                    <div className="text-xs text-green-500">Ahorras $20</div>
                  </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-xl border border-pink-500/20 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
                  <div>
                    <div className="text-xs font-bold text-pink-500 uppercase mb-1">Año Completo</div>
                    <div className="text-white font-bold">Wearable + 12 meses Pro</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$179</div>
                    <div className="text-xs text-green-500">Ahorras $39</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
};

export default Pricing;
