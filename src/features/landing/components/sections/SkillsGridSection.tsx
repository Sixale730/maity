import { Zap, Heart, DollarSign, Scale, Headphones, Smile, Flag } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';

export const SkillsGridSection = () => {
  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Domina las <span className="text-pink-500">Soft Skills</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Maity entrena las competencias críticas para el éxito profesional moderno.</p>
          </FadeIn>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { t: "Claridad y Estructura", d: "Comunica ideas de forma simple, ordenada y memorable", i: <Zap className="text-pink-500" /> },
            { t: "Empatía y Conexión", d: "Escucha activa, validación emocional, rapport", i: <Heart className="text-blue-500" /> },
            { t: "Persuasión Ética", d: "Argumenta con evidencia, historias y lógica", i: <Zap className="text-yellow-500" /> },
            { t: "Venta Consultiva", d: "Descubre necesidades, propone valor, cierra acuerdos", i: <DollarSign className="text-green-500" /> },
            { t: "Negociación", d: "Encuentra puntos medios, maneja objeciones", i: <Scale className="text-purple-500" /> },
            { t: "Servicio al Cliente", d: "Contención, resolución, seguimiento efectivo", i: <Headphones className="text-orange-500" /> },
            { t: "Manejo Emocional", d: "Mantén calma, lee el ambiente, adapta tu tono", i: <Smile className="text-pink-400" /> },
            { t: "Liderazgo Comunicativo", d: "Inspira, da feedback, alinea equipos", i: <Flag className="text-green-400" /> }
          ].map((skill, i) => (
            <FadeIn key={i} delay={i * 50} className="p-8 bg-[#0F0F0F] border border-white/5 rounded-2xl hover:border-white/20 transition-all text-center group">
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">{skill.i}</div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-2">{skill.t}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{skill.d}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
