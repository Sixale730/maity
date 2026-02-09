import { meetingData } from "../data";
import {
  EmotionRadarChart,
  ObjetivoChart,
  MuletillasChart,
  ParticipacionChart,
  ComparacionChart,
  TimelineChart,
} from "../components/MeetingCharts";
import {
  SectionLabel,
  HeaderSection,
  ResumenHero,
  KPIGrid,
  EmotionProfiles,
  ScoreBars,
  InsightsGrid,
  PatronCard,
  HallazgosSection,
  RecomendacionesSection,
  FortalezasSection,
  JsonCollapsible,
} from "../components/MeetingSections";

export default function MeetingAnalysisPage() {
  return (
    <div className="bg-[#050505] min-h-screen max-w-5xl mx-auto space-y-6 pb-12 px-4">
      <HeaderSection data={meetingData} />

      <SectionLabel>Capa 1 — Resumen</SectionLabel>
      <ResumenHero data={meetingData} />

      <SectionLabel>Radiografía Rápida</SectionLabel>
      <KPIGrid />

      <SectionLabel>Perfil Emocional por Persona</SectionLabel>
      <EmotionProfiles data={meetingData} />

      <ScoreBars />

      <SectionLabel>Lo Que Quizás No Notaste</SectionLabel>
      <InsightsGrid data={meetingData} />

      {/* Charts — full width for readability */}
      <EmotionRadarChart data={meetingData} />
      <ObjetivoChart data={meetingData} />
      <MuletillasChart data={meetingData} />
      <ParticipacionChart />
      <ComparacionChart data={meetingData} />
      <TimelineChart data={meetingData} />

      <SectionLabel>Patrón Detectado</SectionLabel>
      <PatronCard data={meetingData} />

      <SectionLabel>Capa 2 — Hallazgos Detallados</SectionLabel>
      <HallazgosSection data={meetingData} />

      <SectionLabel>Top 3 Recomendaciones</SectionLabel>
      <RecomendacionesSection />

      <SectionLabel>Fortalezas a Mantener</SectionLabel>
      <FortalezasSection />

      <SectionLabel>Capa 3 — Datos para Dashboard</SectionLabel>
      <JsonCollapsible data={meetingData} />

      <div className="text-center py-8 text-muted-foreground text-sm">
        Generado por el Prompt de Análisis de Comunicación v3 &bull; Reunión de
        negocio {meetingData.meta.fecha}
      </div>
    </div>
  );
}
