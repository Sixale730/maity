import React, { useState } from 'react';
import { Check, Lock, Shield, Eye, UserCheck } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import { INDIVIDUAL_COMPARISON_CATEGORIES, BUSINESS_COMPARISON_CATEGORIES } from '../../constants/pricing-data';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';

interface PricingProps {
  initialTab?: 'individual' | 'business';
  setView: (view: string) => void;
}

export const Pricing = ({ initialTab = 'individual', setView }: PricingProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [annual, setAnnual] = useState(true);

  return (
    <section className="py-24 bg-[#050505] text-[#e7e7e9]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Elige tu plan de evolución</h2>
          <p className="text-gray-400 mb-12">Escala tu potencial según tus metas.</p>

          <div className="flex justify-center mb-12">
            <div className="bg-[#0F0F0F] p-1 rounded-full border border-white/10 flex">
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'individual' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                Personas
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'business' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                Para Empresas
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mb-16 px-4 py-2 bg-[#0A0A0A] inline-flex rounded-full border border-white/5">
            <span className={`text-xs ${!annual ? 'text-white font-bold' : 'text-gray-500'}`}>Mensual</span>
            <div
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full bg-[#1A1A1A] relative border border-white/10 cursor-pointer transition-colors"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${annual ? 'right-1 bg-green-500' : 'left-1 bg-gray-600'}`}></div>
            </div>
            <span className={`text-xs ${annual ? 'text-white font-bold' : 'text-gray-500'}`}>Anual <span className="text-green-500 ml-1">(-20%)</span></span>
          </div>
        </FadeIn>

        {activeTab === 'individual' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeIn delay={100} className="flex flex-col h-full">
              <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left hover:border-white/20 transition-all flex flex-col h-full group">
                <h3 className="font-bold text-xl text-white mb-2">Explorador</h3>
                <p className="text-3xl font-bold text-white mb-1">Gratis</p>
                <p className="text-xs text-gray-500 mb-6">Para siempre, sin tarjeta</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-gray-700" /> 5 conversaciones/mes</li>
                  <li className="flex gap-3"><Check size={16} className="text-gray-700" /> 1200 min audio/mes</li>
                  <li className="flex gap-3"><Check size={16} className="text-gray-700" /> Dashboard básico</li>
                  <li className="flex gap-3"><Check size={16} className="text-gray-700" /> 1 reto diario</li>
                </ul>
                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                  Empezar Gratis
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={200} className="flex flex-col h-full">
              <div className="p-8 bg-black border-2 border-pink-500 rounded-3xl text-left shadow-2xl shadow-pink-500/10 flex flex-col h-full relative transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">Más Popular</div>
                <h3 className="font-bold text-xl text-white mb-2">Escalador</h3>
                <p className="text-3xl font-bold text-white mb-1">${annual ? '15' : '19'}<span className="text-sm font-normal text-gray-500"> USD/mes</span></p>
                <p className="text-xs text-gray-500 mb-6">{annual ? 'Facturado anualmente ($180/año)' : 'Facturado mensual'}</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-300 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> <strong>50 conversaciones/mes</strong></li>
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Acceso a ChatGPT ilimitado</li>
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Conexión a calendario</li>
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Dashboard avanzado</li>
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> 3 retos diarios + misiones</li>
                  <li className="flex gap-3"><Check size={16} className="text-pink-500" /> 5 simulaciones IA/mes</li>
                </ul>
                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold hover:scale-[1.02] transition-all shadow-lg shadow-pink-500/20">
                  Suscribirse ahora
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={300} className="flex flex-col h-full">
              <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left hover:border-blue-500/30 transition-all flex flex-col h-full">
                <h3 className="font-bold text-xl text-blue-400 mb-2">Guía</h3>
                <p className="text-3xl font-bold text-white mb-1">${annual ? '23' : '29'}<span className="text-sm font-normal text-gray-500"> USD/mes</span></p>
                <p className="text-xs text-gray-500 mb-6">{annual ? 'Facturado anualmente ($276/año)' : 'Facturado mensual'}</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Conversaciones ilimitadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Recordatorios con IA</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Tips personalizados</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Simulaciones IA ilimitadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Jefes de montaña</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Exportar datos</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Soporte prioritario + chat</li>
                </ul>
                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/10 transition-all">
                  Comenzar Guía
                </button>
              </div>
            </FadeIn>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeIn delay={100} className="flex flex-col h-full">
              <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left flex flex-col h-full">
                <h3 className="font-bold text-xl text-white mb-2">Equipo</h3>
                <p className="text-3xl font-bold text-white mb-1">${annual ? '29' : '35'}<span className="text-sm font-normal text-gray-500"> USD/usuario/mes</span></p>
                <p className="text-xs text-gray-500 mb-6">Mínimo 5 usuarios</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Coach IA 24/7</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Conversaciones ilimitadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> 30 simulaciones IA/usuario/mes</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Dashboard equipo</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Integraciones básicas</li>
                </ul>
                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                  Iniciar Piloto
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={200} className="flex flex-col h-full">
              <div className="p-8 bg-black border-2 border-blue-600 rounded-3xl text-left shadow-2xl shadow-blue-500/10 flex flex-col h-full relative transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">Mejor Valor</div>
                <h3 className="font-bold text-xl text-white mb-2">Organización</h3>
                <p className="text-3xl font-bold text-white mb-1">{annual ? '$39' : 'Solo Anual'}<span className="text-sm font-normal text-gray-500">{annual ? ' USD/usuario/mes' : ''}</span></p>
                <p className="text-xs text-gray-500 mb-6">Mínimo 25 usuarios</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-300 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> 2 sesiones coach real/trimestre</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Dashboard RH/Talent</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Simulaciones ilimitadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> SSO + Integraciones avanzadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> CSM compartido</li>
                </ul>
                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:scale-[1.02] transition-all">
                  Hablar con Ventas
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={300} className="flex flex-col h-full">
              <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left flex flex-col h-full">
                <h3 className="font-bold text-xl text-white mb-2">Enterprise</h3>
                <p className="text-3xl font-bold text-white mb-1">{annual ? '$49+' : 'Solo Anual'}<span className="text-sm font-normal text-gray-500">{annual ? ' USD/usuario/mes' : ''}</span></p>
                <p className="text-xs text-gray-500 mb-6">100+ usuarios</p>
                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Coach dedicado + sesiones ilimitadas</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Analítica predictiva + ROI</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> SOC 2, GDPR, HIPAA</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> CSM dedicado + 50hrs consultoría</li>
                  <li className="flex gap-3"><Check size={16} className="text-blue-500" /> SLA 30min + onboarding dedicado</li>
                </ul>
                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                  Pedir Cotización
                </button>
              </div>
            </FadeIn>
          </div>
        )}

        {/* Trust Badges */}
        <FadeIn delay={350}>
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-xs text-gray-500">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <Lock size={12} className="text-green-500" /> Cifrado AES-256
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <Shield size={12} className="text-blue-500" /> Sin tarjeta para plan gratuito
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <Eye size={12} className="text-pink-500" /> Cancela cuando quieras
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <UserCheck size={12} className="text-purple-500" /> GDPR Compliant
            </div>
          </div>
        </FadeIn>

        {/* Comparison Table */}
        <FadeIn delay={400}>
          <div className="mt-20 max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">Compara los planes</h3>
            <p className="text-gray-500 text-sm mb-8">Todo lo que incluye cada versión</p>

            {activeTab === 'individual' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-4 text-gray-400 font-medium w-1/3">Característica</th>
                      <th className="py-4 px-4 text-center text-white font-bold">Explorador</th>
                      <th className="py-4 px-4 text-center text-pink-400 font-bold">Escalador</th>
                      <th className="py-4 px-4 text-center text-blue-400 font-bold">Guía</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    {INDIVIDUAL_COMPARISON_CATEGORIES.map((category, categoryIndex) => (
                      <React.Fragment key={`category-${categoryIndex}`}>
                        <tr className="bg-white/[0.03]">
                          <td colSpan={4} className="py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider">
                            <span className="mr-2">{category.emoji}</span>
                            {category.name}
                          </td>
                        </tr>
                        {category.rows.map((row, rowIndex) => (
                          <tr key={`row-${categoryIndex}-${rowIndex}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 text-gray-300 pl-8">{row.feature}</td>
                            {(['explorador', 'escalador', 'guia'] as const).map((plan) => (
                              <td key={plan} className="py-3.5 px-4 text-center">
                                {row[plan] === true ? (
                                  <Check size={16} className={`mx-auto ${plan === 'escalador' ? 'text-pink-500' : plan === 'guia' ? 'text-blue-500' : 'text-green-500'}`} />
                                ) : row[plan] === false ? (
                                  <span className="text-gray-700">—</span>
                                ) : (
                                  <span className={plan === 'escalador' ? 'text-pink-400' : plan === 'guia' ? 'text-blue-400' : ''}>{row[plan] as string}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4 px-4 text-gray-400 font-medium w-1/3">Característica</th>
                      <th className="py-4 px-4 text-center text-white font-bold">Equipo</th>
                      <th className="py-4 px-4 text-center text-blue-400 font-bold">Organización</th>
                      <th className="py-4 px-4 text-center text-white font-bold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    {BUSINESS_COMPARISON_CATEGORIES.map((category, categoryIndex) => (
                      <React.Fragment key={`business-category-${categoryIndex}`}>
                        <tr className="bg-white/[0.03]">
                          <td colSpan={4} className="py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider">
                            <span className="mr-2">{category.emoji}</span>
                            {category.name}
                          </td>
                        </tr>
                        {category.rows.map((row, rowIndex) => (
                          <tr key={`business-row-${categoryIndex}-${rowIndex}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 text-gray-300 pl-8">{row.feature}</td>
                            {(['equipo', 'organizacion', 'enterprise'] as const).map((plan) => (
                              <td key={plan} className="py-3.5 px-4 text-center">
                                {row[plan] === true ? (
                                  <Check size={16} className={`mx-auto ${plan === 'organizacion' ? 'text-blue-500' : 'text-green-500'}`} />
                                ) : row[plan] === false ? (
                                  <span className="text-gray-700">—</span>
                                ) : (
                                  <span className={plan === 'organizacion' ? 'text-blue-400' : ''}>{row[plan] as string}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FadeIn>

        <div className="max-w-xl mx-auto mt-12">
          <VideoCard
            title={LANDING_VIDEOS.planesPrecios.title}
            description={LANDING_VIDEOS.planesPrecios.description}
            duration={LANDING_VIDEOS.planesPrecios.duration}
            thumbnailUrl={LANDING_VIDEOS.planesPrecios.thumbnailUrl}
            videoUrl={LANDING_VIDEOS.planesPrecios.videoUrl}
            variant="inline"
            accentColor={LANDING_COLORS.maityPink}
          />
        </div>
      </div>
    </section>
  );
};
