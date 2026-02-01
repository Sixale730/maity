import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Lock, Shield, Eye, UserCheck } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import {
  INDIVIDUAL_PLANS,
  BUSINESS_PLANS,
  INDIVIDUAL_COMPARISON,
  BUSINESS_COMPARISON,
} from '../../constants/pricing-data';

interface PricingProps {
  initialTab?: 'individual' | 'business';
}

const TRUST_BADGES = [
  { icon: Lock, label: 'Cifrado AES-256' },
  { icon: Shield, label: 'SOC2 Compliant' },
  { icon: Eye, label: 'Privacy First' },
  { icon: UserCheck, label: 'GDPR Ready' },
];

export const Pricing = ({ initialTab = 'individual' }: PricingProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>(initialTab);
  const [annual, setAnnual] = useState(true);
  const video = LANDING_VIDEOS.planesPrecios;

  const plans = activeTab === 'individual' ? INDIVIDUAL_PLANS : BUSINESS_PLANS;
  const comparison = activeTab === 'individual' ? INDIVIDUAL_COMPARISON : BUSINESS_COMPARISON;
  const planKeys = activeTab === 'individual' ? ['free', 'pro', 'pendant'] : ['starter', 'growth', 'enterprise'];

  return (
    <section className="py-24 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Encuentra el plan perfecto para tu nivel de ambición
            </p>
          </div>
        </FadeIn>

        {/* Tab toggle */}
        <FadeIn delay={50}>
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-[#0F0F0F] rounded-full p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'individual'
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{
                  backgroundColor: activeTab === 'individual' ? LANDING_COLORS.maityPink : 'transparent',
                }}
              >
                Personas
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  activeTab === 'business'
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{
                  backgroundColor: activeTab === 'business' ? LANDING_COLORS.maityBlue : 'transparent',
                }}
              >
                Para Empresas
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Annual/Monthly toggle */}
        <FadeIn delay={75}>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-gray-500'}`}>Mensual</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{ backgroundColor: annual ? LANDING_COLORS.maityGreen : 'rgba(255,255,255,0.2)' }}
              aria-label="Toggle annual pricing"
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ left: annual ? '30px' : '4px' }}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-gray-500'}`}>Anual</span>
            {annual && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                -20%
              </span>
            )}
          </div>
        </FadeIn>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => {
            const isHighlighted = plan.highlighted;
            const accent =
              plan.accentColor === 'pink'
                ? LANDING_COLORS.maityPink
                : plan.accentColor === 'blue'
                  ? LANDING_COLORS.maityBlue
                  : LANDING_COLORS.textMuted;
            const price = annual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <FadeIn key={plan.name} delay={i * 100 + 100}>
                <div
                  className={`rounded-3xl border p-8 relative flex flex-col h-full transition-all ${
                    isHighlighted
                      ? 'bg-[#0F0F0F] scale-[1.02] shadow-2xl'
                      : 'bg-[#0A0A0A] hover:border-white/15'
                  }`}
                  style={{
                    borderColor: isHighlighted ? `${accent}60` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {isHighlighted && 'highlightLabel' in plan && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {plan.highlightLabel}
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                  <div className="mb-6">
                    <span className="text-4xl font-black" style={{ color: isHighlighted ? accent : '#fff' }}>
                      {price}
                    </span>
                    {plan.priceSuffix && (
                      <span className="text-sm text-gray-500 ml-1">{plan.priceSuffix}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-gray-400">
                        <Check size={16} className="text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate(isHighlighted ? '/primeros-pasos' : '/contacto')}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{
                      backgroundColor: isHighlighted ? accent : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Trust badges */}
        <FadeIn delay={300}>
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2">
                  <Icon size={16} className="text-green-500" />
                  <span className="text-xs text-gray-500">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Comparison table */}
        <FadeIn delay={350}>
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-white font-bold">Característica</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="text-center py-4 px-4 text-white font-bold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, ri) => (
                    <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6 text-gray-400">{row.feature}</td>
                      {planKeys.map((key) => {
                        const val = row[key as keyof typeof row];
                        return (
                          <td key={key} className="text-center py-3 px-4">
                            {typeof val === 'boolean' ? (
                              val ? (
                                <Check size={16} className="text-green-500 mx-auto" />
                              ) : (
                                <X size={16} className="text-gray-700 mx-auto" />
                              )
                            ) : (
                              <span className="text-xs text-gray-400">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* Video */}
        <FadeIn delay={400} className="mt-16 flex justify-center">
          <VideoCard
            title={video.title}
            description={video.description}
            duration={video.duration}
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.videoUrl}
          />
        </FadeIn>
      </div>
    </section>
  );
};
