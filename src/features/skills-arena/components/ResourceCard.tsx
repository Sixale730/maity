import { ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ArenaResource } from '../types/skills-arena.types';
import { RESOURCE_ICON_MAP, RESOURCE_COLOR_MAP } from '../types/skills-arena.types';

interface ResourceCardProps {
  resource: ArenaResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { t } = useLanguage();

  const iconEmoji = RESOURCE_ICON_MAP[resource.icon] || '📚';
  const color = RESOURCE_COLOR_MAP[resource.color] || RESOURCE_COLOR_MAP.purple;

  const handleClick = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      onClick={handleClick}
      className="
        relative overflow-hidden bg-[#0F0F0F] p-5
        transition-all duration-300 group cursor-pointer
        border border-white/10 hover:border-white/20
        hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]
      "
    >
      {/* New Badge */}
      {resource.isNew && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            <Sparkles size={10} />
            NEW
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          {iconEmoji}
        </div>

        {/* Type Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold mb-2"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <span>📚</span>
          <span className="uppercase tracking-wider">
            {t('skills_arena.resource_type')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-100 transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          {/* Open Link indicator */}
          <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-gray-400 transition-colors">
            <ExternalLink size={12} />
            <span>{t('skills_arena.open_resource')}</span>
          </div>

          {/* Arrow indicator */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all group-hover:scale-110"
            style={{
              backgroundColor: `${color}15`,
            }}
          >
            <ExternalLink
              size={14}
              style={{ color }}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
