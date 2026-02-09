import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useDeleteConversation } from '../hooks/useDeleteConversation';
import { OmiConversation, getOmiTranscriptSegments } from '../services/omi.service';
import {
  SectionLabel,
  RadiografiaKPIGrid,
  MuletillasSection,
  PreguntasSection,
  TemasSection,
  AccionesSection,
  TemasSinCerrarSection
} from './ConversationSections';
import {
  OmiHeaderSection,
  OmiResumenHero,
  OmiScoreBars,
  OmiFortalezasSection,
  OmiAreasSection,
  TranscriptSection,
} from './OmiAnalysisSections';

interface OmiConversationDetailProps {
  conversation: OmiConversation;
  onBack: () => void;
}

export function OmiConversationDetail({ conversation, onBack }: OmiConversationDetailProps) {
  const { t } = useLanguage();
  const { isAdmin } = useUser();
  const deleteConversation = useDeleteConversation();

  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['omi-segments', conversation.id],
    queryFn: () => getOmiTranscriptSegments(conversation.id),
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

        {/* Resumen Hero - gauge + score + description */}
        {feedback?.overall_score !== undefined && (
          <>
            <SectionLabel>{t('omi.summary_section')}</SectionLabel>
            <OmiResumenHero feedback={feedback} />
          </>
        )}

        {/* Radiografía KPIs */}
        {hasRadiografia && (
          <>
            <SectionLabel>{t('omi.quick_radiography')}</SectionLabel>
            <RadiografiaKPIGrid
              radiografia={feedback.radiografia!}
              preguntas={feedback.preguntas}
            />
          </>
        )}

        {/* Communication Metrics - Score Bars */}
        {hasScores && (feedback.clarity !== undefined || feedback.engagement !== undefined || feedback.structure !== undefined) && (
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
        {hasTemas && feedback.temas!.acciones_usuario.length > 0 && (
          <>
            <SectionLabel>{t('omi.commitments_section')}</SectionLabel>
            <AccionesSection acciones={feedback.temas!.acciones_usuario} />
          </>
        )}

        {/* Temas Sin Cerrar Section */}
        {hasTemas && feedback.temas!.temas_sin_cerrar.length > 0 && (
          <>
            <SectionLabel>{t('omi.pending_section')}</SectionLabel>
            <TemasSinCerrarSection temasSinCerrar={feedback.temas!.temas_sin_cerrar} />
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

        {/* Transcript Section */}
        <SectionLabel>{t('omi.transcript_section')}</SectionLabel>
        <TranscriptSection
          segments={segments || []}
          transcriptText={conversation.transcript_text}
          userName={conversation.user?.full_name || null}
          isLoading={loadingSegments}
        />
      </div>
    </div>
  );
}
