import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, Download, Rocket, Mail, ArrowRight, CreditCard, Shield, Lock, Monitor, Smartphone as SmartphoneIcon, Clock, Star, TrendingUp } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';
import { supabase, resolveBaseOrigin, getAppUrl } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';

export const PrimerosPasosPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOAuthSignup = async (provider: 'google' | 'azure') => {
    setLoading(true);
    const appUrl = getAppUrl();
    const baseOrigin = resolveBaseOrigin(appUrl);
    const redirectTarget = new URL('/auth/callback', baseOrigin).toString();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectTarget },
      });
      if (error) throw error;
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message ?? 'No se pudo conectar con el proveedor.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    navigate(`/auth?email=${encodeURIComponent(email.trim())}&mode=signup`);
  };

  const steps = [
    { num: 1, label: 'Crea tu cuenta', icon: <UserPlus size={16} /> },
    { num: 2, label: 'Descarga la app', icon: <Download size={16} /> },
    { num: 3, label: 'Tu primer reto', icon: <Rocket size={16} /> }
  ];

  const platforms = [
    { name: 'Windows', icon: <Monitor size={32} />, label: '.exe', available: true },
    { name: 'macOS', icon: <Monitor size={32} />, label: '.dmg', available: true },
    { name: 'iOS App', icon: <SmartphoneIcon size={32} />, label: 'App Store', available: false },
    { name: 'Android', icon: <SmartphoneIcon size={32} />, label: 'Google Play', available: false }
  ];

  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-900/10 border border-pink-500/20 mb-6">
              <Sparkles size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">Primeros Pasos</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
              Empieza tu{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}>
                evolución
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Crea tu cuenta y descarga Maity en menos de 2 minutos</p>
          </div>
        </FadeIn>

        {/* Step Indicator */}
        <FadeIn delay={100}>
          <div className="flex items-center justify-center gap-0 mb-20 max-w-lg mx-auto">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${step.num === 1 ? 'border-pink-500 bg-pink-500/20 text-pink-400' : 'border-white/10 bg-[#0F0F0F] text-gray-500'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold ${step.num === 1 ? 'text-pink-400' : 'text-gray-600'}`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && <div className="h-px w-full bg-white/10 -mt-6 mx-1" />}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Step 1: Create Account */}
        <FadeIn delay={200}>
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h2 className="text-2xl font-bold text-white">Crea tu cuenta gratis</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl">
                <form onSubmit={handleEmailSignup} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all text-lg" style={{ background: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}>
                    Crear cuenta gratis <ArrowRight size={20} />
                  </button>
                </form>
                <div className="my-5 flex items-center justify-between text-xs text-gray-600">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="px-3">O continúa con</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => handleOAuthSignup('google')} disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Google</button>
                  <button type="button" onClick={() => handleOAuthSignup('azure')} disabled={loading} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Microsoft</button>
                </div>
                <p className="mt-5 text-center text-xs text-gray-500">
                  ¿Ya tienes cuenta? <button onClick={() => navigate('/auth')} className="text-pink-500 hover:text-pink-400 font-bold ml-1">Inicia sesión</button>
                </p>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-4">
                {[
                  { icon: <CreditCard size={20} />, title: 'Sin tarjeta de crédito', desc: 'Empieza sin compromiso financiero' },
                  { icon: <Shield size={20} />, title: '7 días gratis', desc: 'Prueba todas las funciones Pro' },
                  { icon: <Lock size={20} />, title: 'Control total de tus datos', desc: 'Tú decides qué se graba y qué se analiza' }
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 flex-shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 border border-white/5 rounded-xl text-center mt-2">
                  <p className="text-xs text-gray-500">Más de <span className="text-white font-bold">10,000</span> profesionales ya entrenan con Maity</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Step 2: Download */}
        <FadeIn delay={300}>
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-sm border border-white/10">2</div>
              <h2 className="text-2xl font-bold text-white">Descarga Maity</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {platforms.map((plat, i) => (
                <div key={i} className={`p-8 bg-[#0F0F0F] border rounded-2xl transition-all group cursor-pointer text-center ${plat.available ? 'border-white/10 hover:border-pink-500 hover:bg-pink-500/5' : 'border-white/5 opacity-60'}`}>
                  <div className="text-gray-400 group-hover:text-pink-500 transition-colors mb-6 flex justify-center">{plat.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{plat.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 group-hover:text-pink-400">{plat.available ? plat.label : 'Próximamente'}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Step 3: First Challenge */}
        <FadeIn delay={400}>
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-sm border border-white/10">3</div>
              <h2 className="text-2xl font-bold text-white">Completa tu primer reto</h2>
            </div>
            <div className="p-8 bg-gradient-to-r from-pink-900/10 to-blue-900/10 border border-pink-500/10 rounded-2xl text-center max-w-2xl">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <Rocket size={28} className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3 minutos para empezar</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Tu primer reto te dará 25 puntos de experiencia e iniciará tu racha. Solo necesitas una conversación grabada o una práctica rápida con IA.</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500"><Clock size={14} className="text-pink-400" /><span>3-5 min</span></div>
                <div className="flex items-center gap-2 text-gray-500"><Star size={14} className="text-yellow-400" /><span>+25 XP</span></div>
                <div className="flex items-center gap-2 text-gray-500"><TrendingUp size={14} className="text-green-400" /><span>Inicia tu racha</span></div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Social Proof */}
        <FadeIn delay={500}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[{ value: '+10k', label: 'Horas Entrenadas' }, { value: '94%', label: 'Aprobación' }, { value: '3.5x', label: 'ROI Promedio' }, { value: '15+', label: 'Países' }].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Privacy Footer */}
        <FadeIn delay={600}>
          <div className="p-6 border border-white/5 rounded-2xl bg-[#0A0A0A] max-w-2xl mx-auto">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0"><Lock size={24} /></div>
              <div>
                <h4 className="font-bold text-white">Privacidad Total</h4>
                <p className="text-sm text-gray-500">Tus datos nunca salen de tu dispositivo sin tu permiso explícito. Cifrado end-to-end.</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
