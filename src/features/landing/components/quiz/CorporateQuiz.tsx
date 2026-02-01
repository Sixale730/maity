import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Share2, Check, TrendingUp } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { RadarChart } from '../shared/RadarChart';
import { LANDING_COLORS } from '../../constants/colors';
import { CORPORATE_ARCHETYPES, CORPORATE_QUIZ_QUESTIONS } from '../../constants/quiz-data';
import type { Archetype } from '../../types/landing.types';

type Step = 'intro' | 'quiz' | 'result';

interface QuizResult {
  archetype: Archetype;
  key: string;
  percentages: { key: string; name: string; pct: number }[];
}

function getResult(answers: string[]): QuizResult {
  const counts: Record<string, number> = {};
  answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const total = answers.length;
  const percentages = sorted.map(([key, count]) => ({
    key,
    name: CORPORATE_ARCHETYPES[key].name,
    pct: Math.round((count / total) * 100),
  }));

  // Fill in any archetype with 0 answers
  Object.keys(CORPORATE_ARCHETYPES).forEach((k) => {
    if (!percentages.find((p) => p.key === k)) {
      percentages.push({ key: k, name: CORPORATE_ARCHETYPES[k].name, pct: 0 });
    }
  });

  const winnerKey = sorted[0][0];
  return { archetype: CORPORATE_ARCHETYPES[winnerKey], key: winnerKey, percentages };
}

export const CorporateQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!revealing) return;
    const timer = setTimeout(() => {
      setResult(getResult(answers));
      setStep('result');
      setRevealing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [revealing, answers]);

  const handleAnswer = (key: string) => {
    const next = [...answers, key];
    setAnswers(next);
    if (currentQ + 1 < CORPORATE_QUIZ_QUESTIONS.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setRevealing(true);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      await navigator.share({
        title: `Mi estilo: ${result.archetype.name}`,
        text: `${result.archetype.tagline} - Descubre tu estilo de liderazgo con Maity`,
        url: window.location.href,
      });
    } catch { /* user cancelled */ }
  };

  const q = CORPORATE_QUIZ_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / CORPORATE_QUIZ_QUESTIONS.length) * 100;

  // --- INTRO ---
  if (step === 'intro') {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-24">
        <FadeIn className="max-w-xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <Building2 className="w-4 h-4" style={{ color: LANDING_COLORS.maityBlue }} />
            <span className="text-sm font-medium" style={{ color: LANDING_COLORS.textMuted }}>
              Evaluación Corporativa
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
            ¿Cuál es tu estilo de{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}>
              liderazgo comunicativo
            </span>
            ?
          </h1>
          <p className="text-lg mb-8" style={{ color: LANDING_COLORS.textMuted }}>
            7 escenarios corporativos reales para identificar tu estilo de liderazgo y cómo fortalecerlo.
          </p>
          <button
            onClick={() => setStep('quiz')}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: LANDING_COLORS.maityBlue }}
          >
            Empezar Test
          </button>
        </FadeIn>
      </section>
    );
  }

  // --- REVEALING ---
  if (revealing) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${LANDING_COLORS.maityBlue} transparent ${LANDING_COLORS.maityBlue} ${LANDING_COLORS.maityBlue}` }}
          />
          <p className="text-lg" style={{ color: LANDING_COLORS.textMuted }}>Analizando tu perfil de liderazgo...</p>
        </div>
      </section>
    );
  }

  // --- QUIZ ---
  if (step === 'quiz') {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/10 mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundImage: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
            />
          </div>
          <p className="text-sm mb-6" style={{ color: LANDING_COLORS.textMuted }}>
            Pregunta {currentQ + 1} de {CORPORATE_QUIZ_QUESTIONS.length}
          </p>
          <FadeIn key={currentQ}>
            <h2 className="text-xl md:text-2xl font-bold mb-8" style={{ color: LANDING_COLORS.textMain }}>
              {q.t}
            </h2>
            <div className="space-y-3">
              {q.o.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.k)}
                  className="w-full flex items-center gap-3 text-left px-5 py-4 rounded-xl border border-white/10 transition-all hover:border-blue-500/50"
                  style={{ backgroundColor: LANDING_COLORS.bgCard, color: LANDING_COLORS.textMain }}
                >
                  <span className="flex-1">{opt.t}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  // --- RESULT ---
  if (step === 'result' && result) {
    const { archetype, percentages } = result;
    const radarData = percentages.map((p) => ({ name: p.name.split(' ')[1] || p.name, value: p.pct / 10 }));

    return (
      <section className="min-h-screen flex items-center justify-center px-6 py-24">
        <FadeIn className="max-w-2xl w-full">
          {/* Archetype badge */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
              style={{ borderColor: archetype.color, backgroundColor: `${archetype.color}15` }}
            >
              {archetype.emoji}
            </div>
            <div>
              <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>Tu estilo:</p>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: archetype.color }}>
                {archetype.name}
              </h2>
            </div>
          </div>

          <p className="text-lg font-medium mb-6" style={{ color: LANDING_COLORS.textMain }}>{archetype.tagline}</p>

          {/* Score breakdown */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 space-y-3">
              {percentages.map((p) => (
                <div key={p.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: LANDING_COLORS.textMain }}>{p.name}</span>
                    <span style={{ color: CORPORATE_ARCHETYPES[p.key].color }}>{p.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.pct}%`, backgroundColor: CORPORATE_ARCHETYPES[p.key].color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <RadarChart data={radarData} color={archetype.color} />
            </div>
          </div>

          <p className="mb-6" style={{ color: LANDING_COLORS.textMuted }}>{archetype.description}</p>

          {/* Strengths & Growth */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1bea9a' }}>
                <Check className="w-4 h-4" /> Fortalezas de liderazgo
              </p>
              <ul className="space-y-2">
                {archetype.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: LANDING_COLORS.textMain }}>
                    <span style={{ color: '#1bea9a' }}>+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#ffd93d' }}>
                <TrendingUp className="w-4 h-4" /> Áreas de crecimiento
              </p>
              <ul className="space-y-2">
                {archetype.growth.map((g, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: LANDING_COLORS.textMain }}>
                    <span style={{ color: '#ffd93d' }}>~</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Maity Plan */}
          <div className="rounded-xl p-4 border border-white/10 mb-8" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
            <p className="text-sm italic" style={{ color: LANDING_COLORS.textMuted }}>{archetype.maityPlan}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/contacto')}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
            >
              Solicitar Demo Corporativa
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Compartir Resultado
            </button>
          </div>
        </FadeIn>
      </section>
    );
  }

  return null;
};
