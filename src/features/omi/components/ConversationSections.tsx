import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MessageSquare, Scale, HelpCircle, BarChart3,
  CheckCircle2, AlertTriangle, DoorOpen
} from 'lucide-react';
import type {
  Radiografia,
  PreguntasAnalisis,
  TemasAnalisis
} from '../services/omi.service';

// ─── KPI Card Component ───────────────────────────────────────────────
interface KPICardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  detail: string;
  accent: 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'orange' | 'cyan';
}

const ACCENT_BORDER: Record<string, string> = {
  red: 'border-t-red-500',
  yellow: 'border-t-yellow-500',
  green: 'border-t-green-500',
  blue: 'border-t-blue-500',
  purple: 'border-t-purple-500',
  orange: 'border-t-orange-500',
  cyan: 'border-t-cyan-500',
};

const ACCENT_TEXT: Record<string, string> = {
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  cyan: 'text-cyan-500',
};

function KPICard({ icon, number, label, detail, accent }: KPICardProps) {
  return (
    <Card
      className={`bg-[#0F0F0F] border border-white/10 border-t-[3px] ${ACCENT_BORDER[accent]} p-4 text-center hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg transition-all`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-extrabold leading-tight ${ACCENT_TEXT[accent]}`}>
        {number}
      </div>
      <div className="text-sm font-semibold mt-0.5 text-white">{label}</div>
      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
        {detail}
      </div>
    </Card>
  );
}

// ─── Section Label ───────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-8 mb-3 pl-1 flex items-center gap-2">
      <div className="h-px flex-1 bg-white/10" />
      <span>{children}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

// ─── Radiografía KPI Grid ────────────────────────────────────────────
interface RadiografiaKPIGridProps {
  radiografia: Radiografia;
  preguntas?: PreguntasAnalisis;
}

export function RadiografiaKPIGrid({ radiografia, preguntas }: RadiografiaKPIGridProps) {
  const { t } = useLanguage();

  // Determine accent color based on muletillas count
  const muletillasAccent = radiografia.muletillas_total > 50
    ? 'red'
    : radiografia.muletillas_total > 20
      ? 'yellow'
      : 'green';

  // Determine accent for ratio (1.0-1.5 is balanced)
  const ratioAccent = radiografia.ratio_habla >= 0.8 && radiografia.ratio_habla <= 1.5
    ? 'green'
    : radiografia.ratio_habla > 2
      ? 'yellow'
      : 'blue';

  // Format ratio for display
  const ratioDisplay = radiografia.ratio_habla >= 1
    ? `${radiografia.ratio_habla.toFixed(1)}x`
    : `1:${(1 / radiografia.ratio_habla).toFixed(1)}`;

  // Get top muletillas for detail
  const topMuletillas = Object.entries(radiografia.muletillas_detectadas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word, count]) => `"${word}"x${count}`)
    .join(', ');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard
        icon={<MessageSquare className="h-5 w-5 mx-auto text-current" />}
        number={String(radiografia.muletillas_total)}
        label={t('omi.muletillas')}
        detail={topMuletillas || radiografia.muletillas_frecuencia}
        accent={muletillasAccent}
      />
      <KPICard
        icon={<Scale className="h-5 w-5 mx-auto text-current" />}
        number={ratioDisplay}
        label={t('omi.talk_ratio')}
        detail={radiografia.ratio_habla >= 0.8 && radiografia.ratio_habla <= 1.5
          ? t('omi.balanced')
          : t('omi.unbalanced')}
        accent={ratioAccent}
      />
      {preguntas && (
        <KPICard
          icon={<HelpCircle className="h-5 w-5 mx-auto text-current" />}
          number={`${preguntas.total_usuario}/${preguntas.total_otros}`}
          label={t('omi.questions')}
          detail={`${t('omi.you')}: ${preguntas.total_usuario}, ${t('omi.others')}: ${preguntas.total_otros}`}
          accent="purple"
        />
      )}
      <KPICard
        icon={<BarChart3 className="h-5 w-5 mx-auto text-current" />}
        number={`${radiografia.palabras_usuario}`}
        label={t('omi.words_user')}
        detail={`${t('omi.others')}: ${radiografia.palabras_otros}`}
        accent="cyan"
      />
    </div>
  );
}

// ─── Muletillas Section ──────────────────────────────────────────────
interface MuletillasSectionProps {
  muletillas: Record<string, number>;
  total: number;
}

export function MuletillasSection({ muletillas, total }: MuletillasSectionProps) {
  const { t } = useLanguage();

  const sortedMuletillas = Object.entries(muletillas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  if (sortedMuletillas.length === 0) return null;

  const maxCount = Math.max(...sortedMuletillas.map(([, count]) => count));

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-red-400" />
        {t('omi.muletillas_detected')}
        <Badge variant="secondary" className="ml-auto bg-red-500/20 text-red-400">
          {total} total
        </Badge>
      </h4>
      <div className="space-y-2.5">
        {sortedMuletillas.map(([word, count]) => {
          const percentage = (count / maxCount) * 100;
          const isHigh = count > total * 0.2;

          return (
            <div key={word} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-24 truncate">"{word}"</span>
              <div className="flex-1 h-2.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-8 text-right ${
                isHigh ? 'text-red-400' : 'text-amber-400'
              }`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Preguntas Section ───────────────────────────────────────────────
interface PreguntasSectionProps {
  preguntas: PreguntasAnalisis;
}

export function PreguntasSection({ preguntas }: PreguntasSectionProps) {
  const { t } = useLanguage();

  const userQuestions = Array.isArray(preguntas.preguntas_usuario) ? preguntas.preguntas_usuario : [];
  const otherQuestions = Array.isArray(preguntas.preguntas_otros) ? preguntas.preguntas_otros : [];

  if (userQuestions.length === 0 && otherQuestions.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* User's questions */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-emerald-500 p-5">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          {t('omi.your_questions')}
          <Badge variant="secondary" className="ml-auto bg-emerald-500/20 text-emerald-400">
            {preguntas.total_usuario}
          </Badge>
        </h4>
        {userQuestions.length > 0 ? (
          <ul className="space-y-2">
            {userQuestions.slice(0, 5).map((pregunta, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                {pregunta}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">{t('omi.no_questions')}</p>
        )}
      </Card>

      {/* Others' questions */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-purple-500 p-5">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          {t('omi.questions_received')}
          <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-400">
            {preguntas.total_otros}
          </Badge>
        </h4>
        {otherQuestions.length > 0 ? (
          <ul className="space-y-2">
            {otherQuestions.slice(0, 5).map((pregunta, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                {pregunta}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">{t('omi.no_questions')}</p>
        )}
      </Card>
    </div>
  );
}

// ─── Temas Section ───────────────────────────────────────────────────
interface TemasSectionProps {
  temas: string[];
}

export function TemasSection({ temas }: TemasSectionProps) {
  const { t } = useLanguage();

  if (temas.length === 0) return null;

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4">{t('omi.topics')}</h4>
      <div className="flex flex-wrap gap-2">
        {temas.map((tema, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {tema}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

// ─── Acciones Section ────────────────────────────────────────────────
interface AccionesSectionProps {
  acciones: TemasAnalisis['acciones_usuario'];
}

export function AccionesSection({ acciones }: AccionesSectionProps) {
  const { t } = useLanguage();

  if (!acciones || acciones.length === 0) return null;

  const normalized = acciones.map(a =>
    typeof a === 'string' ? { descripcion: a, tiene_fecha: false } : a
  );

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4">{t('omi.your_commitments')}</h4>
      <ul className="space-y-2.5">
        {normalized.map((accion, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {accion.tiene_fecha ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className={`text-sm ${accion.tiene_fecha ? 'text-gray-300' : 'text-gray-400'}`}>
                {accion.descripcion}
              </span>
              <span className={`text-xs ml-2 ${
                accion.tiene_fecha ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                ({accion.tiene_fecha ? t('omi.with_date') : t('omi.without_date')})
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Temas Sin Cerrar Section ────────────────────────────────────────
interface TemasSinCerrarSectionProps {
  temasSinCerrar: TemasAnalisis['temas_sin_cerrar'];
}

export function TemasSinCerrarSection({ temasSinCerrar }: TemasSinCerrarSectionProps) {
  const { t } = useLanguage();

  if (!temasSinCerrar || temasSinCerrar.length === 0) return null;

  const normalized = temasSinCerrar.map(item =>
    typeof item === 'string' ? { tema: item, razon: '' } : item
  );

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <DoorOpen className="h-4 w-4 text-orange-400" />
        {t('omi.open_topics')}
        <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-400">
          {normalized.length}
        </Badge>
      </h4>
      <div className="space-y-3">
        {normalized.map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
          >
            <div className="font-medium text-sm text-orange-300">{item.tema}</div>
            {item.razon ? (
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-gray-600">{t('omi.reason')}:</span> {item.razon}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
