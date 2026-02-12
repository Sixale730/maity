import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Mystery, AnswerType } from '../data/mysteries-catalog';
import { analyzeQuestion } from '../data/mysteries-catalog';

interface HistoryEntry {
  question: string;
  answer: AnswerType;
}

interface BlackStoriesGameProps {
  mystery: Mystery;
  questionsRemaining: number;
  hintsRemaining: number;
  hintsUsed: number;
  history: HistoryEntry[];
  onAsk: (question: string, answer: AnswerType) => void;
  onHint: () => string | null;
  onReveal: () => void;
}

const ANSWER_CONFIG: Record<AnswerType, { label: string; border: string; glow: string; textColor: string }> = {
  yes: {
    label: 'SI',
    border: 'border-green-400',
    glow: 'shadow-[0_0_30px_rgba(74,222,128,0.2)]',
    textColor: 'text-green-400',
  },
  no: {
    label: 'NO',
    border: 'border-red-500',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    textColor: 'text-red-500',
  },
  irrelevant: {
    label: 'IRRELEVANTE',
    border: 'border-yellow-400',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.2)]',
    textColor: 'text-yellow-400',
  },
};

export function BlackStoriesGame({
  mystery,
  questionsRemaining,
  hintsRemaining,
  hintsUsed,
  history,
  onAsk,
  onHint,
  onReveal,
}: BlackStoriesGameProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [lastAnswer, setLastAnswer] = useState<{ type: AnswerType; question: string } | null>(null);
  const [shownHints, setShownHints] = useState<string[]>([]);
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAsk = () => {
    const question = inputValue.trim();
    if (!question) {
      showInline(t('black_stories.msg_write_question'));
      return;
    }
    if (questionsRemaining <= 0) {
      showInline(t('black_stories.msg_no_questions'));
      return;
    }

    const answer = analyzeQuestion(question, mystery);
    setLastAnswer({ type: answer, question });
    setInputValue('');
    onAsk(question, answer);
    inputRef.current?.focus();
  };

  const handleHint = () => {
    if (hintsRemaining <= 0) {
      showInline(t('black_stories.msg_no_hints'));
      return;
    }
    const hint = onHint();
    if (hint) {
      setShownHints(prev => [...prev, hint]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAsk();
  };

  const showInline = (msg: string) => {
    setInlineMsg(msg);
    setTimeout(() => setInlineMsg(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-5">
      {/* Mystery Card */}
      <Card className="bg-gradient-to-br from-[#1c1a2e] to-[#241e3e] border-[#5ad0ff]/30 shadow-[0_0_20px_rgba(90,208,255,0.1)]">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-[#5ad0ff] mb-3">
            🔦 {t('black_stories.current_mystery')}
          </div>
          <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
            {mystery.mystery}
          </p>
          <div className="text-4xl text-center mt-4 animate-[float_3s_ease-in-out_infinite]">
            {mystery.icon}
          </div>
        </CardContent>
      </Card>

      {/* Counters */}
      <div className="flex justify-center gap-4 flex-wrap">
        <div className="bg-[#1c1a2e] px-5 py-3 rounded-xl border-2 border-[#d12dff]/30 font-bold text-base">
          ❓ {t('black_stories.questions')}: <span className="text-[#d12dff] text-2xl font-extrabold ml-2">{questionsRemaining}</span>
        </div>
        <div className="bg-[#1c1a2e] px-5 py-3 rounded-xl border-2 border-[#d12dff]/30 font-bold text-base">
          💡 {t('black_stories.hints')}: <span className="text-[#d12dff] text-2xl font-extrabold ml-2">{hintsRemaining}</span>
        </div>
      </div>

      {/* Interaction Box */}
      <Card className="bg-[#1c1a2e] border-[#2a2a3e]">
        <CardContent className="p-5 space-y-4">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('black_stories.input_placeholder')}
            maxLength={200}
            className="bg-[#08070d] border-[#d12dff]/30 text-white text-base py-5 focus:border-[#d12dff]"
          />
          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              onClick={handleAsk}
              disabled={questionsRemaining <= 0}
              className="px-6 py-5 text-base font-bold rounded-full bg-gradient-to-r from-[#d12dff] to-[#5ad0ff] hover:opacity-90 shadow-[0_4px_15px_rgba(209,45,255,0.4)]"
            >
              ❓ {t('black_stories.btn_ask')}
            </Button>
            <Button
              onClick={handleHint}
              disabled={hintsRemaining <= 0}
              variant="secondary"
              className="px-6 py-5 text-base font-bold rounded-full bg-gradient-to-r from-[#6c2b8a] to-[#3a1f5c] text-white hover:opacity-90 shadow-[0_4px_15px_rgba(108,43,138,0.3)]"
            >
              💡 {t('black_stories.btn_hint')}
            </Button>
            <Button
              onClick={onReveal}
              variant="secondary"
              className="px-6 py-5 text-base font-bold rounded-full bg-gradient-to-r from-[#6c2b8a] to-[#3a1f5c] text-white hover:opacity-90 shadow-[0_4px_15px_rgba(108,43,138,0.3)]"
            >
              🔓 {t('black_stories.btn_reveal')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inline message */}
      {inlineMsg && (
        <div className="text-center animate-in fade-in">
          <Card className="bg-gradient-to-br from-[#2a0845] to-[#1a0430] border-yellow-400 inline-block">
            <CardContent className="p-4 text-gray-300">{inlineMsg}</CardContent>
          </Card>
        </div>
      )}

      {/* Answer Card */}
      {lastAnswer && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <Card className={`bg-gradient-to-br from-[#2a0845] to-[#1a0430] border-2 ${ANSWER_CONFIG[lastAnswer.type].border} ${ANSWER_CONFIG[lastAnswer.type].glow}`}>
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-extrabold ${ANSWER_CONFIG[lastAnswer.type].textColor}`}>
                {ANSWER_CONFIG[lastAnswer.type].label} {lastAnswer.type === 'yes' ? '✓' : lastAnswer.type === 'no' ? '✗' : '○'}
              </div>
              <div className="text-gray-400 italic mt-3">"{lastAnswer.question}"</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hints */}
      {shownHints.map((hint, i) => (
        <div key={i} className="animate-in fade-in">
          <Card className="bg-gradient-to-br from-[#3a2a00] to-[#2a1f00] border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <CardContent className="p-4">
              <span className="font-bold text-yellow-400">{t('black_stories.hint_label')}:</span>{' '}
              <span className="text-white">{hint}</span>
            </CardContent>
          </Card>
        </div>
      ))}

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-[#08070d] border-[#2a2a3e]">
          <CardContent className="p-4">
            <div className="font-semibold text-[#5ad0ff] mb-3">📜 {t('black_stories.history')}</div>
            <ScrollArea className="max-h-[250px]">
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className={`p-3 bg-[#1c1a2e] rounded-lg border-l-4 ${
                      entry.answer === 'yes' ? 'border-l-green-400' :
                      entry.answer === 'no' ? 'border-l-red-500' :
                      'border-l-yellow-400'
                    }`}
                  >
                    <div><span className="text-[#5ad0ff] font-bold">P:</span> {entry.question}</div>
                    <div><span className="text-[#5ad0ff] font-bold">R:</span> {ANSWER_CONFIG[entry.answer].label}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
