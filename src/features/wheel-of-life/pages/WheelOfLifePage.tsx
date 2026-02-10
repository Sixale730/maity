import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useWheelOfLife } from '@maity/shared';
import { WheelIntro } from '../components/WheelIntro';
import { AreaAssessmentStep } from '../components/AreaAssessmentStep';
import { WheelReview } from '../components/WheelReview';
import { WheelResultsView } from '../components/WheelResults';

export function WheelOfLifePage() {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const wheel = useWheelOfLife({ userId: userProfile?.id ?? '' });

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-[#050505] py-6">
      {/* Back button (except results) */}
      {wheel.step !== 'results' && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-white"
            onClick={() => navigate('/skills-arena')}
          >
            <ArrowLeft size={16} className="mr-1" />
            {t('wheel_of_life.back_to_arena')}
          </Button>
        </div>
      )}

      {/* Steps */}
      {wheel.step === 'intro' && (
        <WheelIntro
          onStart={wheel.startGame}
          hasRestoredProgress={wheel.hasRestoredProgress}
          onContinue={() => {/* restored progress resumes at assessment step */}}
        />
      )}

      {wheel.step === 'assessment' && (
        <AreaAssessmentStep
          areaMeta={wheel.currentAreaMeta}
          area={wheel.currentArea}
          currentIndex={wheel.currentAreaIndex}
          totalAreas={wheel.totalAreas}
          allAreas={wheel.areas}
          onSetScore={wheel.setAreaScore}
          onSetReason={wheel.setAreaReason}
          onNext={wheel.nextArea}
          onPrevious={wheel.previousArea}
          isFirst={wheel.currentAreaIndex === 0}
          isLast={wheel.currentAreaIndex === wheel.totalAreas - 1}
        />
      )}

      {wheel.step === 'review' && (
        <WheelReview
          areas={wheel.areas}
          onSubmit={wheel.submitGame}
          onGoToArea={wheel.goToArea}
          isSubmitting={wheel.isSubmitting}
        />
      )}

      {wheel.step === 'results' && wheel.results && (
        <WheelResultsView
          results={wheel.results}
          completionResult={wheel.completionResult}
          onReset={wheel.resetGame}
        />
      )}
    </div>
  );
}
