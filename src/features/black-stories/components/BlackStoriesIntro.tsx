import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlackStoriesIntroProps {
  onStart: () => void;
}

export function BlackStoriesIntro({ onStart }: BlackStoriesIntroProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🕵️</div>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#d12dff] to-[#5ad0ff] bg-clip-text text-transparent">
          {t('black_stories.title')}
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          {t('black_stories.subtitle')}
        </p>
      </div>

      <Card className="bg-[#1c1a2e] border-[#d12dff]/40 shadow-[0_0_20px_rgba(209,45,255,0.2)]">
        <CardContent className="p-6 space-y-4">
          <div className="text-lg text-white flex items-start gap-3">
            <span className="text-xl">❓</span>
            <span>{t('black_stories.rule_questions')}</span>
          </div>
          <div className="text-lg text-white flex items-start gap-3">
            <span className="text-xl">🧿</span>
            <span>{t('black_stories.rule_answers')}</span>
          </div>
          <div className="text-lg text-white flex items-start gap-3">
            <span className="text-xl">💡</span>
            <span>{t('black_stories.rule_hints')}</span>
          </div>
          <div className="text-lg text-white flex items-start gap-3">
            <span className="text-xl">🎯</span>
            <span>{t('black_stories.rule_goal')}</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button
          onClick={onStart}
          className="px-10 py-6 text-xl font-bold rounded-full bg-gradient-to-r from-[#d12dff] to-[#5ad0ff] hover:opacity-90 transition-all shadow-[0_6px_20px_rgba(209,45,255,0.4)]"
        >
          {t('black_stories.btn_start')}
        </Button>
      </div>
    </div>
  );
}
