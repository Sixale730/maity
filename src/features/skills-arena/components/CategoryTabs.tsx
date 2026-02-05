import { useLanguage } from '@/contexts/LanguageContext';
import type { TestCategory } from '../types/skills-arena.types';
import { CATEGORY_METADATA } from '../types/skills-arena.types';

interface CategoryTabsProps {
  activeCategory: TestCategory | null;
  onChange: (category: TestCategory | null) => void;
  testCounts: Record<TestCategory | 'all', number>;
}

export function CategoryTabs({
  activeCategory,
  onChange,
  testCounts,
}: CategoryTabsProps) {
  const { t } = useLanguage();

  const categories: Array<{ key: TestCategory | null; labelKey: string; icon: string }> = [
    { key: null, labelKey: 'skills_arena.category.all', icon: '✨' },
    { key: 'self-knowledge', labelKey: 'skills_arena.category.self_knowledge', icon: '🎭' },
    { key: 'communication', labelKey: 'skills_arena.category.communication', icon: '💬' },
    { key: 'balance', labelKey: 'skills_arena.category.balance', icon: '⚖️' },
    { key: 'leadership', labelKey: 'skills_arena.category.leadership', icon: '👑' },
    { key: 'emotional', labelKey: 'skills_arena.category.emotional', icon: '❤️' },
  ];

  return (
    <div className="mb-6">
      {/* Scrollable container for mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          const count = cat.key === null ? testCounts.all : testCounts[cat.key] || 0;
          const meta = cat.key ? CATEGORY_METADATA[cat.key] : null;

          return (
            <button
              key={cat.key || 'all'}
              onClick={() => onChange(cat.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                whitespace-nowrap transition-all duration-200
                border
                ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'bg-[#0F0F0F] text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                }
              `}
              style={{
                backgroundColor: isActive
                  ? meta?.color || '#ff0050'
                  : undefined,
                borderColor: isActive
                  ? meta?.color || '#ff0050'
                  : undefined,
                boxShadow: isActive
                  ? `0 0 20px ${meta?.color || '#ff0050'}40`
                  : undefined,
              }}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{t(cat.labelKey)}</span>
              <span
                className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isActive ? 'bg-white/20' : 'bg-white/5'}
                `}
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
