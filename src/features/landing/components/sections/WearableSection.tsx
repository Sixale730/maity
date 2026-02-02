import { Mic, Bluetooth, Battery, Thermometer, Smartphone, Shield, HardDrive } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';
import type { ReactNode } from 'react';

interface WearableSectionProps {
  setView: (view: string) => void;
}

interface Spec {
  icon: ReactNode;
  label: string;
  color: string;
}

export const WearableSection = ({ setView }: WearableSectionProps) => {
  const specs: Spec[] = [
    { icon: <Mic size={18} />, label: 'Microfono + speaker de alta fidelidad', color: LANDING_COLORS.maityPink },
    { icon: <Bluetooth size={18} />, label: 'Bluetooth Low Energy 5.0', color: LANDING_COLORS.maityBlue },
    { icon: <Battery size={18} />, label: '16 horas de bateria', color: LANDING_COLORS.maityGreen },
    { icon: <Thermometer size={18} />, label: 'Solo 35 gramos', color: '#ff8c42' },
    { icon: <Smartphone size={18} />, label: 'Companion App (iOS / Android)', color: '#9b4dca' },
    { icon: <Shield size={18} />, label: 'Procesamiento local — sin grabacion', color: '#06b6d4' },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/10 border border-blue-500/20 mb-6">
              <HardDrive size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-300 tracking-wide uppercase">
                Hardware
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Maity <span style={{ color: LANDING_COLORS.maityBlue }}>Wearable</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Un dispositivo que escucha tus conversaciones reales (con tu consentimiento) y te
              da feedback en tiempo real. Privacidad total: procesa localmente y no almacena
              audio.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-xl border border-white/5"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${spec.color}20` }}
                  >
                    <div style={{ color: spec.color }}>{spec.icon}</div>
                  </div>
                  <span className="text-sm text-gray-300">{spec.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView('demo-calendar')}
              className="px-8 py-4 rounded-full font-bold text-white shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              style={{
                background: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})`,
              }}
            >
              <HardDrive size={18} /> Reservar Wearable
            </button>
          </FadeIn>

          <FadeIn delay={200} className="relative">
            <div className="bg-[#0F0F0F] rounded-3xl border border-white/10 p-12 text-center">
              <div
                className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center"
                style={{
                  backgroundColor: `${LANDING_COLORS.maityBlue}15`,
                  border: `2px solid ${LANDING_COLORS.maityBlue}30`,
                }}
              >
                <HardDrive size={48} style={{ color: LANDING_COLORS.maityBlue }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Maity Pendant</h3>
              <p className="text-gray-500 text-sm mb-6">
                Tu coach de comunicacion — siempre contigo
              </p>
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">35g</p>
                  <p className="text-[10px] text-gray-600 uppercase">Peso</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">16h</p>
                  <p className="text-[10px] text-gray-600 uppercase">Bateria</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">BLE 5</p>
                  <p className="text-[10px] text-gray-600 uppercase">Conexion</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
