import { useNavigate } from 'react-router-dom';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

const stories = [
  { name: "Ana García", role: "Gerente de Ventas, Tech Corp", quote: "Maity me ayudó a cerrar un 20% más de ventas en solo 3 meses. El feedback de IA después de cada llamada es invaluable.", metric: "+20% ventas", color: "border-pink-500" },
  { name: "David López", role: "Freelancer", quote: "La IA es brutalmente honesta y eso me encanta. Me mostró patrones de comunicación que nadie más me había señalado.", metric: "3x más clientes", color: "border-blue-500" },
  { name: "Sofía Martínez", role: "Líder de Equipo, Startup MX", quote: "Mis reuniones ahora son la mitad de largas y el doble de productivas. El equipo entero mejoró su comunicación.", metric: "-50% tiempo reuniones", color: "border-green-500" },
  { name: "Jorge Ramírez", role: "Consultor Senior", quote: "Es como tener un coach de comunicación 24/7. Me preparó para las presentaciones más importantes de mi carrera.", metric: "5 presentaciones exitosas", color: "border-purple-500" },
  { name: "Karina Barrera", role: "CEO, Asertio Capacitación", quote: "Transformamos los equipos de ventas de nuestros clientes con Maity. Los resultados son medibles desde la primera semana.", metric: "+35% rendimiento equipos", color: "border-orange-500" },
  { name: "Roberto Sánchez", role: "Director Comercial", quote: "La combinación de práctica con IA y análisis de conversaciones reales es lo que hacía falta en el mercado.", metric: "ROI 4.2x en 6 meses", color: "border-yellow-500" },
];

export const SuccessStoriesPage = () => {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-900/10 border border-yellow-500/20 mb-6">
              <Star size={16} className="text-yellow-500" />
              <span className="text-xs font-bold text-yellow-400 tracking-wider uppercase">Casos de Éxito</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Historias que <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">inspiran</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">Profesionales reales que transformaron su comunicación con Maity.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {stories.map((story, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className={`p-8 bg-[#0F0F0F] rounded-2xl border-l-4 ${story.color} hover:bg-[#141414] transition-all h-full flex flex-col`}>
                <Quote size={24} className="text-gray-700 mb-4" />
                <p className="text-gray-300 leading-relaxed mb-6 flex-grow">"{story.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{story.name}</p>
                    <p className="text-xs text-gray-500">{story.role}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <span className="text-sm font-bold text-green-400">{story.metric}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={600}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">¿Listo para escribir tu propia historia?</h2>
            <button onClick={() => navigate('/primeros-pasos')} className="inline-flex items-center gap-2 px-10 py-5 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all" style={{ backgroundColor: LANDING_COLORS.maityPink }}>
              Empieza tu transformación <ArrowRight size={20} />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
