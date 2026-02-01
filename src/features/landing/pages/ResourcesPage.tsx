import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Newspaper, Video, Podcast, ArrowLeft, Clock, Mail, ArrowRight } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';
import { RESOURCES, RESOURCE_CATEGORIES } from '../constants/resources-data';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  Newspaper,
  Video,
  Podcast,
};

export const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const filtered = activeCategory === 'Todos'
    ? RESOURCES
    : RESOURCES.filter(r => r.c === activeCategory);

  const handleSubscribe = () => {
    if (email) setSubscribed(true);
  };

  return (
    <section className="pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-8 text-sm hover:text-white transition-colors"
            style={{ color: LANDING_COLORS.textMuted }}
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
            Centro de Recursos
          </h1>
          <p className="text-lg mb-8 max-w-2xl" style={{ color: LANDING_COLORS.textMuted }}>
            Guias, articulos y contenido para mejorar tu comunicacion profesional.
          </p>
        </FadeIn>

        {/* Category tabs */}
        <FadeIn delay={100}>
          <div className="flex flex-wrap gap-2 mb-10">
            {RESOURCE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? 'text-white border-transparent'
                    : 'border-white/10 hover:bg-white/5'
                }`}
                style={{
                  ...(activeCategory === cat
                    ? { backgroundColor: LANDING_COLORS.maityPink }
                    : { color: LANDING_COLORS.textMuted }),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Resource cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {filtered.map((resource, i) => {
            const IconComp = ICON_MAP[resource.icon] || BookOpen;
            return (
              <FadeIn key={resource.t} delay={i * 50}>
                <div
                  className={`flex items-start gap-4 p-5 rounded-xl border-l-4 border border-white/5 ${resource.color}`}
                  style={{ backgroundColor: LANDING_COLORS.bgCard }}
                >
                  <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
                    <IconComp className="w-5 h-5" style={{ color: LANDING_COLORS.textMuted }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm" style={{ color: LANDING_COLORS.textMain }}>
                        {resource.t}
                      </h3>
                      {resource.ready ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                          Disponible
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                          Proximamente
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-2" style={{ color: LANDING_COLORS.textMuted }}>
                      {resource.d}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: LANDING_COLORS.textMuted }}>
                        <Clock className="w-3 h-3" /> {resource.time}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10" style={{ color: LANDING_COLORS.textMuted }}>
                        {resource.c}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Newsletter CTA */}
        <FadeIn>
          <div
            className="rounded-2xl border border-white/10 p-8 text-center"
            style={{ backgroundColor: LANDING_COLORS.bgCard }}
          >
            <Mail className="w-8 h-8 mx-auto mb-4" style={{ color: LANDING_COLORS.maityPink }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: LANDING_COLORS.textMain }}>
              Recibe contenido exclusivo
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: LANDING_COLORS.textMuted }}>
              Suscribete a nuestro newsletter semanal con tips, guias y recursos sobre comunicacion e IA.
            </p>
            {subscribed ? (
              <p className="text-sm font-medium" style={{ color: LANDING_COLORS.maityGreen }}>
                Listo. Te enviamos un correo de confirmacion.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm outline-none focus:border-white/30"
                  style={{ color: LANDING_COLORS.textMain }}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={!email}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: LANDING_COLORS.maityPink }}
                >
                  Suscribirme <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
