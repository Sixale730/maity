import { TrendingDown, TrendingUp } from 'lucide-react';
import { COLORS } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const ProblemSection = () => {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">
                El Problema
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
              La capacitación inspira. <br />
              <span className="text-gray-500">Pero el progreso ocurre cuando entrenas.</span>
            </h2>
            <p
              className="text-lg text-gray-400 mb-8 leading-relaxed border-l-2 pl-6"
              style={{ borderColor: COLORS.maityBlue }}
            >
              Sin práctica guiada, la <strong className="text-white">curva de olvido</strong> gana.
              El 70% de lo que aprendes en un curso se pierde en 24 horas. Maity convierte lo
              aprendido en evolución diaria: una rutina simple, medible y motivante.
            </p>

            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg mt-1">
                  <TrendingDown size={20} className="text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Cursos Tradicionales</h4>
                  <p className="text-xs text-gray-500">Pico alto, caída rápida</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                  <TrendingUp size={20} style={{ color: COLORS.maityGreen }} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Método Maity</h4>
                  <p className="text-xs text-gray-500">Mejora continua y sostenida</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl rounded-full" />
            <div className="bg-[#0F0F0F] p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl">
              <h3 className="text-sm font-bold text-gray-400 mb-6 tracking-wider uppercase flex justify-between">
                <span>Retención de Habilidad</span>
                <span>30 Días</span>
              </h3>
              <div className="relative h-64 w-full border-l border-b border-gray-800">
                <svg className="absolute inset-0 h-full w-full overflow-visible">
                  <path
                    d="M0,10 Q100,200 400,240"
                    fill="none"
                    stroke="#333"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <circle cx="400" cy="240" r="4" fill="#333" />
                  <text x="350" y="230" fill="#666" fontSize="10" fontWeight="bold">
                    Olvido (70%)
                  </text>
                </svg>

                <svg className="absolute inset-0 h-full w-full overflow-visible">
                  <path
                    d="M0,10 C50,10 50,50 100,40 C150,30 150,80 200,70 C250,60 250,110 300,90 C350,70 350,20 400,10"
                    fill="none"
                    stroke={COLORS.maityGreen}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(27,234,154,0.5)]"
                  />
                  <defs>
                    <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.maityGreen} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={COLORS.maityGreen} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,10 C50,10 50,50 100,40 C150,30 150,80 200,70 C250,60 250,110 300,90 C350,70 350,20 400,10 V256 H0 Z"
                    fill="url(#gradientGreen)"
                    stroke="none"
                  />
                  {[100, 200, 300].map((x, i) => (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={i === 0 ? 40 : i === 1 ? 70 : 90}
                        r="6"
                        fill="#0F0F0F"
                        stroke={COLORS.maityPink}
                        strokeWidth="2"
                      />
                    </g>
                  ))}
                  <text x="320" y="30" fill={COLORS.maityGreen} fontSize="12" fontWeight="bold">
                    Evolución Maity
                  </text>
                </svg>
                <div className="absolute -left-8 top-0 text-xs text-gray-600">100%</div>
                <div className="absolute -left-6 bottom-0 text-xs text-gray-600">0%</div>
              </div>

              <div className="mt-4 flex gap-4 justify-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-700" />
                  <span className="text-gray-500">Sin práctica</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-green-400 shadow-[0_0_10px_rgba(27,234,154,0.5)]" />
                  <span className="text-white">Con Maity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-pink-500" />
                  <span className="text-gray-500">Micro-práctica</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
