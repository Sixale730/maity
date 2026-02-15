import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useDeleteConversation } from '../hooks/useDeleteConversation';
import { useReanalyzeConversation } from '../hooks/useReanalyzeConversation';
import { OmiConversation, getOmiConversation, getOmiTranscriptSegments } from '../services/omi.service';
import {
  SectionLabel,
  MuletillasSection,
  PreguntasSection,
  TemasSection,
  AccionesSection,
  TemasSinCerrarSection
} from './ConversationSections';
import {
  OmiHeaderSection,
  OmiResumenHero,
  OmiKPIGrid,
  OmiScoreBars,
  OmiFortalezasSection,
  OmiAreasSection,
  OmiPatronesSection,
  OmiInsightsSection,
  TranscriptSection,
} from './OmiAnalysisSections';

interface OmiConversationDetailProps {
  conversation: OmiConversation;
  onBack: () => void;
}

export function OmiConversationDetail({ conversation: initialConversation, onBack }: OmiConversationDetailProps) {
  const { t } = useLanguage();
  const { isAdmin } = useUser();
  const deleteConversation = useDeleteConversation();
  const reanalyzeConversation = useReanalyzeConversation();

  // Fetch fresh conversation data (will update after reanalysis)
  const { data: freshConversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['omi-conversation', initialConversation.id],
    queryFn: () => getOmiConversation(initialConversation.id),
    initialData: initialConversation,
  });

  // Use fresh data if available, otherwise fall back to initial
  const conversation = freshConversation || initialConversation;

  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['omi-segments', initialConversation.id],
    queryFn: () => getOmiTranscriptSegments(initialConversation.id),
  });

  const feedback = conversation.communication_feedback;
  const hasRadiografia = feedback?.radiografia;
  const hasPreguntas = feedback?.preguntas;
  const hasTemas = feedback?.temas;
  const hasScores = feedback && (feedback.overall_score !== undefined || feedback.clarity !== undefined);
  const hasStrengths = feedback?.strengths && feedback.strengths.length > 0;
  const hasAreas = feedback?.areas_to_improve && feedback.areas_to_improve.length > 0;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button + Delete */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {/* Reanalyze Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reanalyzeConversation.mutate(conversation.id)}
                disabled={reanalyzeConversation.isPending}
                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reanalyzeConversation.isPending ? 'animate-spin' : ''}`} />
                {reanalyzeConversation.isPending ? t('common.processing') : t('omi.reanalyze')}
              </Button>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('omi.delete_conversation')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('omi.delete_conversation_description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteConversation.mutate(conversation.id, {
                        onSuccess: () => onBack(),
                      });
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Header - centered title + metadata */}
        <OmiHeaderSection conversation={conversation} />

        {/* Overview text */}
        {conversation.overview && (
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            {conversation.overview}
          </p>
        )}

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="analysis">{t('omi.tab_analysis')}</TabsTrigger>
            <TabsTrigger value="transcript">{t('omi.tab_transcript')}</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            {/* Resumen Hero - gauge + score + description */}
            {feedback?.overall_score !== undefined && (
              <>
                <SectionLabel>{t('omi.summary_section')}</SectionLabel>
                <OmiResumenHero feedback={feedback} />
              </>
            )}

            {/* Radiografía KPIs - 8 cards grid */}
            {(hasRadiografia || hasPreguntas || hasTemas) && (
              <>
                <SectionLabel>{t('omi.quick_radiography')}</SectionLabel>
                <OmiKPIGrid
                  radiografia={feedback?.radiografia}
                  preguntas={feedback?.preguntas}
                  temas={feedback?.temas}
                />
              </>
            )}

            {/* Communication Metrics - Score Bars */}
            {hasScores && (feedback.clarity !== undefined || feedback.structure !== undefined || feedback.empatia !== undefined || feedback.vocabulario !== undefined || feedback.objetivo !== undefined) && (
              <>
                <SectionLabel>{t('omi.communication_metrics')}</SectionLabel>
                <OmiScoreBars feedback={feedback} />
              </>
            )}

            {/* Muletillas Section */}
            {hasRadiografia && feedback.radiografia!.muletillas_total > 0 && (
              <>
                <SectionLabel>{t('omi.muletillas_section')}</SectionLabel>
                <MuletillasSection
                  muletillas={feedback.radiografia!.muletillas_detectadas}
                  total={feedback.radiografia!.muletillas_total}
                />
              </>
            )}

            {/* Preguntas Section */}
            {hasPreguntas && (
              <>
                <SectionLabel>{t('omi.questions_section')}</SectionLabel>
                <PreguntasSection preguntas={feedback.preguntas!} />
              </>
            )}

            {/* Temas Section */}
            {hasTemas && feedback.temas!.temas_tratados.length > 0 && (
              <>
                <SectionLabel>{t('omi.topics_section')}</SectionLabel>
                <TemasSection temas={feedback.temas!.temas_tratados} />
              </>
            )}

            {/* Acciones Section */}
            {hasTemas && feedback.temas!.acciones_usuario?.length > 0 && (
              <>
                <SectionLabel>{t('omi.commitments_section')}</SectionLabel>
                <AccionesSection acciones={feedback.temas!.acciones_usuario} />
              </>
            )}

            {/* Temas Sin Cerrar Section */}
            {hasTemas && feedback.temas!.temas_sin_cerrar?.length > 0 && (
              <>
                <SectionLabel>{t('omi.pending_section')}</SectionLabel>
                <TemasSinCerrarSection temasSinCerrar={feedback.temas!.temas_sin_cerrar} />
              </>
            )}

            {/* Patrones de Comunicación Section */}
            {feedback?.patron && (
              <>
                <SectionLabel>{t('omi.pattern_section')}</SectionLabel>
                <OmiPatronesSection patron={feedback.patron} />
              </>
            )}

            {/* Insights Section */}
            {feedback?.insights && feedback.insights.length > 0 && (
              <>
                <SectionLabel>{t('omi.insights_section')}</SectionLabel>
                <OmiInsightsSection insights={feedback.insights} />
              </>
            )}

            {/* Fortalezas Section */}
            {hasStrengths && (
              <>
                <SectionLabel>{t('omi.strengths_section')}</SectionLabel>
                <OmiFortalezasSection strengths={feedback.strengths!} />
              </>
            )}

            {/* Areas de Mejora Section */}
            {hasAreas && (
              <>
                <SectionLabel>{t('omi.areas_section')}</SectionLabel>
                <OmiAreasSection areas={feedback.areas_to_improve!} />
              </>
            )}
          </TabsContent>

          <TabsContent value="transcript">
            <TranscriptSection
              segments={segments || []}
              transcriptText={conversation.transcript_text}
              userName={conversation.user?.name || null}
              isLoading={loadingSegments}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
