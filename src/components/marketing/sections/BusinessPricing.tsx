import { useState } from 'react';
import { Briefcase, Check, ChevronDown, Minus, Plus } from 'lucide-react';
import { COLORS } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const BusinessPricing = () => {
  const [annual, setAnnual] = useState(true);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="py-24 bg-[#050505] text-[#e7e7e9] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <FadeIn>
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4">
            <Briefcase size={24} className="text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">Planes Corporativos</h2>
          <p className="text-gray-400 mb-8">Soluciones escalables para equipos de alto rendimiento.</p>

          <div className="flex justify-center items-center gap-4 mb-16 bg-[#0F0F0F] inline-flex p-1 rounded-full border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Anual{' '}
              <span className="text-[10px] font-bold bg-green-500 text-black px-1.5 py-0.5 rounded">
                -10%
              </span>
            </button>
          </div>
        </FadeIn>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* STARTER */}
          <FadeIn delay={100} className="h-full">
            <div className="border border-white/10 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-blue-500/50 transition-all flex flex-col h-full">
              <div className="mb-4">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-bold text-xl text-white">STARTER</h3>
                <p className="text-xs text-gray-500">Equipos pequeños (5-20)</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                ${annual ? '19' : '22'}
                <span className="text-sm font-normal text-gray-500">/user/mes</span>
              </p>

              <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                <li className="flex gap-2">
                  <Check size={14} className="text-blue-500" /> Prácticas ilimitadas
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-blue-500" /> 15+ escenarios
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-blue-500" /> Dashboard básico admin
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-blue-500" /> Análisis de equipo
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-blue-500" /> 1 grupo unificado
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-white/20 font-bold hover:bg-white/5 transition-colors text-white mt-auto text-sm">
                Empezar prueba
              </button>
            </div>
          </FadeIn>

          {/* TEAM */}
          <FadeIn delay={200} className="h-full">
            <div className="border-2 border-green-500/50 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-green-500 transition-all flex flex-col relative h-full">
              <div className="absolute top-0 right-0 bg-green-600 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                GROWTH
              </div>
              <div className="mb-4">
                <div className="text-2xl mb-2">⭐</div>
                <h3 className="font-bold text-xl text-white">TEAM</h3>
                <p className="text-xs text-green-400">Crecimiento (21-100)</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                ${annual ? '39' : '45'}
                <span className="text-sm font-normal text-gray-500">/user/mes</span>
              </p>

              <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                <li className="flex gap-2 text-white">
                  <Check size={14} className="text-green-500" /> <strong>Todo de Starter +</strong>
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-green-500" /> Builder escenarios custom
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-green-500" /> Programas de training
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-green-500" /> Manager dashboard
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-green-500" /> AI Insights & Grupos
                </li>
              </ul>
              <button
                className="w-full py-3 rounded font-bold transition-colors text-black mt-auto text-sm"
                style={{ backgroundColor: COLORS.maityGreen }}
              >
                Empezar prueba
              </button>
            </div>
          </FadeIn>

          {/* BUSINESS */}
          <FadeIn delay={300} className="h-full">
            <div className="border border-purple-500/30 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-purple-500/50 transition-all flex flex-col h-full">
              <div className="mb-4">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-bold text-xl text-white">BUSINESS</h3>
                <p className="text-xs text-purple-400">Organizaciones (101-500)</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">
                ${annual ? '59' : '69'}
                <span className="text-sm font-normal text-gray-500">/user/mes</span>
              </p>

              <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                <li className="flex gap-2 text-white">
                  <Check size={14} className="text-purple-500" /> <strong>Todo de Team +</strong>
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-purple-500" /> SSO/SAML & API Completa
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-purple-500" /> Integraciones CRM/LMS
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-purple-500" /> Branding completo
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-purple-500" /> Dedicated CSM & SLA
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-purple-500/50 font-bold hover:bg-purple-900/20 transition-colors text-white mt-auto text-sm">
                Agendar demo
              </button>
            </div>
          </FadeIn>

          {/* ENTERPRISE */}
          <FadeIn delay={400} className="h-full">
            <div className="border border-yellow-500/30 rounded-xl p-6 bg-[#0A0A0A] text-left hover:border-yellow-500/50 transition-all flex flex-col relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="mb-4 relative z-10">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-bold text-xl text-yellow-100">ENTERPRISE</h3>
                <p className="text-xs text-yellow-500">Custom (500+)</p>
              </div>
              <p className="text-3xl font-bold mb-6 text-white">Custom</p>

              <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow relative z-10">
                <li className="flex gap-2 text-white">
                  <Check size={14} className="text-yellow-500" /> <strong>Todo de Business +</strong>
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-yellow-500" /> Pricing por volumen
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-yellow-500" /> White-label total
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-yellow-500" /> On-premise option
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="text-yellow-500" /> Custom AI training
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-yellow-500/50 font-bold hover:bg-yellow-900/20 transition-colors text-yellow-100 mt-auto relative z-10 text-sm">
                Contactar ventas
              </button>
            </div>
          </FadeIn>
        </div>

        {/* ENTERPRISE TABLE TOGGLE */}
        <FadeIn delay={500}>
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setShowTable(!showTable)}
              className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto mb-8 transition-colors"
            >
              {showTable ? 'Ocultar comparativa técnica' : 'Ver tabla de características completa'}
              <ChevronDown
                size={16}
                className={`transform transition-transform ${showTable ? 'rotate-180' : ''}`}
              />
            </button>

            {showTable && (
              <div className="overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-500">
                <table className="w-full text-left text-xs md:text-sm text-gray-400">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-2 font-normal">Característica</th>
                      <th className="py-4 px-2 font-bold text-white text-center">STARTER</th>
                      <th className="py-4 px-2 font-bold text-green-400 text-center">TEAM</th>
                      <th className="py-4 px-2 font-bold text-purple-400 text-center">BUSINESS</th>
                      <th className="py-4 px-2 font-bold text-yellow-400 text-center">CUSTOM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { feat: 'Usuarios', s: '5-20', t: '21-100', b: '101-500', c: '500+' },
                      { feat: 'Prácticas', s: 'Ilimitadas', t: 'Ilimitadas', b: 'Ilimitadas', c: 'Ilimitadas' },
                      { feat: 'Escenarios', s: '15+ Pre', t: 'Builder Custom', b: 'Builder Custom', c: 'Diseño a medida' },
                      { feat: 'Programas Training', s: false, t: true, b: true, c: true },
                      { feat: 'Dashboard Admin', s: 'Básico', t: 'Manager View', b: 'Avanzado', c: 'Custom BI' },
                      { feat: 'AI Insights', s: false, t: true, b: true, c: 'Custom Models' },
                      { feat: 'SSO/SAML', s: false, t: false, b: true, c: true },
                      { feat: 'API & Webhooks', s: false, t: false, b: true, c: true },
                      { feat: 'Integraciones', s: 'Calendar', t: '+ Zoom/Teams', b: '+ CRM/LMS', c: 'Custom ERP' },
                      { feat: 'Branding', s: false, t: 'Logo', b: 'Completo', c: 'White-label' },
                      { feat: 'Soporte', s: '48h', t: '24h', b: 'Prioritario', c: 'Dedicado' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2 text-white">{row.feat}</td>
                        <td className="py-3 px-2 text-center">
                          {row.s === true ? (
                            <Check size={14} className="mx-auto text-blue-500" />
                          ) : row.s === false ? (
                            <Minus size={14} className="mx-auto text-gray-600" />
                          ) : (
                            row.s
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {row.t === true ? (
                            <Check size={14} className="mx-auto text-green-500" />
                          ) : row.t === false ? (
                            <Minus size={14} className="mx-auto text-gray-600" />
                          ) : (
                            row.t
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {row.b === true ? (
                            <Check size={14} className="mx-auto text-purple-500" />
                          ) : row.b === false ? (
                            <Minus size={14} className="mx-auto text-gray-600" />
                          ) : (
                            row.b
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {row.c === true ? (
                            <Check size={14} className="mx-auto text-yellow-500" />
                          ) : row.c === false ? (
                            <Minus size={14} className="mx-auto text-gray-600" />
                          ) : (
                            row.c
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ADD-ONS */}
                <div className="mt-12 text-left bg-[#141414] p-6 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                    <Plus size={16} /> Add-ons Opcionales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Wearables para equipo (10+)</span>
                      <span className="text-white font-bold">$79/u</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Wearables bulk (50+)</span>
                      <span className="text-white font-bold">$59/u</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Contenido Custom (Diseño instruccional)</span>
                      <span className="text-white font-bold">$2k - $8k</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Training Presencial (Día)</span>
                      <span className="text-white font-bold">$3,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default BusinessPricing;
