import { useLanguage } from '@/contexts/LanguageContext';

type ContentType = 'video' | 'podcast' | 'pdf' | 'article';

interface ContentTypeTabsProps {
  activeType: ContentType | null;
  onChange: (type: ContentType | null) => void;
  counts: Record<ContentType | 'all', number>;
}

const CONTENT_TYPES: Array<{ key: ContentType | null; labelKey: string; emoji: string; color: string }> = [
  { key: null, labelKey: 'learning_content.all', emoji: '✨', color: '#00f5d4' },
  { key: 'video', labelKey: 'learning_content.videos', emoji: '🎬', color: '#f15bb5' },
  { key: 'podcast', labelKey: 'learning_content.podcasts', emoji: '🎙️', color: '#9b4dca' },
  { key: 'pdf', labelKey: 'learning_content.pdfs', emoji: '📄', color: '#ff8c42' },
  { key: 'article', labelKey: 'learning_content.articles', emoji: '📝', color: '#485df4' },
];

export function ContentTypeTabs({ activeType, onChange, counts }: ContentTypeTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
        {CONTENT_TYPES.map((tab) => {
          const isActive = activeType === tab.key;
          const count = tab.key === null ? counts.all : counts[tab.key] || 0;

          return (
            <button
              key={tab.key || 'all'}
              onClick={() => onChange(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                whitespace-nowrap transition-all duration-200 border
                ${isActive
                  ? 'text-white shadow-lg'
                  : 'bg-[#0F0F0F] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                }
              `}
              style={{
                backgroundColor: isActive ? tab.color : undefined,
                borderColor: isActive ? tab.color : undefined,
                boxShadow: isActive ? `0 0 20px ${tab.color}40` : undefined,
              }}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{t(tab.labelKey)}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-white/5'}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
