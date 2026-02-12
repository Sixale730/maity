import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { GameService } from '@maity/shared';
import { MYSTERIES } from '../data/mysteries-catalog';
import type { Mystery, AnswerType } from '../data/mysteries-catalog';
import { BlackStoriesIntro } from '../components/BlackStoriesIntro';
import { BlackStoriesGame } from '../components/BlackStoriesGame';
import { BlackStoriesResults } from '../components/BlackStoriesResults';

type Step = 'intro' | 'game' | 'results';

interface HistoryEntry {
  question: string;
  answer: AnswerType;
}

const MAX_QUESTIONS = 10;
const MAX_HINTS = 3;
const BASE_XP = 120;
const XP_PER_UNUSED_QUESTION = 3;
const XP_PER_UNUSED_HINT = 5;
const FIRST_ATTEMPT_BONUS = 30;

function calculateXP(questionsUsed: number, hintsUsed: number, isFirst: boolean): number {
  let xp = BASE_XP;
  xp += (MAX_QUESTIONS - questionsUsed) * XP_PER_UNUSED_QUESTION;
  xp += (MAX_HINTS - hintsUsed) * XP_PER_UNUSED_HINT;
  if (isFirst) xp += FIRST_ATTEMPT_BONUS;
  return xp;
}

function pickRandomMystery(): Mystery {
  return MYSTERIES[Math.floor(Math.random() * MYSTERIES.length)];
}

export function BlackStoriesPage() {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('intro');
  const [mystery, setMystery] = useState<Mystery | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsRemaining, setQuestionsRemaining] = useState(MAX_QUESTIONS);
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Results state
  const [xpEarned, setXpEarned] = useState(0);
  const [isFirstAttempt, setIsFirstAttempt] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  const startGame = useCallback(async () => {
    if (!userProfile?.id) return;

    const session = await GameService.createSession(userProfile.id, 'black_stories');
    setSessionId(session?.id ?? null);
    setMystery(pickRandomMystery());
    setQuestionsRemaining(MAX_QUESTIONS);
    setHintsRemaining(MAX_HINTS);
    setHintsUsed(0);
    setHistory([]);
    setStep('game');
  }, [userProfile?.id]);

  const handleAsk = useCallback((question: string, answer: AnswerType) => {
    setQuestionsRemaining(prev => prev - 1);
    setHistory(prev => [{ question, answer }, ...prev]);
  }, []);

  const handleHint = useCallback((): string | null => {
    if (!mystery || hintsUsed >= MAX_HINTS) return null;
    const hint = mystery.keywords.hints[hintsUsed];
    setHintsRemaining(prev => prev - 1);
    setHintsUsed(prev => prev + 1);
    return hint;
  }, [mystery, hintsUsed]);

  const handleReveal = useCallback(async () => {
    if (!sessionId) return;

    const questionsUsed = MAX_QUESTIONS - questionsRemaining;
    const isFirst = true; // TODO: check via GameService.getLatestCompleted when needed
    const xp = calculateXP(questionsUsed, hintsUsed, isFirst);

    const result = await GameService.completeSession(
      sessionId,
      {
        mysteryId: mystery?.id,
        questionsUsed,
        hintsUsed,
        history,
      },
      Math.max(0, 100 - questionsUsed * 5 - hintsUsed * 10), // score heuristic
      xp,
      'Black Stories Mini completed'
    );

    setXpEarned(result.xp_earned ?? xp);
    setIsFirstAttempt(result.is_first_attempt ?? isFirst);
    setTotalXP(result.total_xp ?? 0);
    setStep('results');
  }, [sessionId, mystery, questionsRemaining, hintsUsed, history]);

  const handlePlayAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-[#050505] py-6">
      {/* Back button (except results) */}
      {step !== 'results' && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-white"
            onClick={() => navigate('/skills-arena')}
          >
            <ArrowLeft size={16} className="mr-1" />
            {t('black_stories.btn_back_arena')}
          </Button>
        </div>
      )}

      {step === 'intro' && <BlackStoriesIntro onStart={startGame} />}

      {step === 'game' && mystery && (
        <BlackStoriesGame
          mystery={mystery}
          questionsRemaining={questionsRemaining}
          hintsRemaining={hintsRemaining}
          hintsUsed={hintsUsed}
          history={history}
          onAsk={handleAsk}
          onHint={handleHint}
          onReveal={handleReveal}
        />
      )}

      {step === 'results' && mystery && (
        <BlackStoriesResults
          mystery={mystery}
          questionsUsed={MAX_QUESTIONS - questionsRemaining}
          hintsUsed={hintsUsed}
          xpEarned={xpEarned}
          isFirstAttempt={isFirstAttempt}
          totalXP={totalXP}
          onPlayAgain={handlePlayAgain}
          onBackToArena={() => navigate('/skills-arena')}
        />
      )}
    </div>
  );
}
