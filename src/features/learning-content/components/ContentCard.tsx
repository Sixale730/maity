import { ExternalLink, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LearningContent } from '@maity/shared';

const TYPE_CONFIG: Record<string, { emoji: string; color: string; labelKey: string }> = {
  video: { emoji: '🎬', color: '#f15bb5', labelKey: 'learning_content.type.video' },
  podcast: { emoji: '🎙️', color: '#9b4dca', labelKey: 'learning_content.type.podcast' },
  pdf: { emoji: '📄', color: '#ff8c42', labelKey: 'learning_content.type.pdf' },
  article: { emoji: '📝', color: '#485df4', labelKey: 'learning_content.type.article' },
};

interface ContentCardProps {
  content: LearningContent;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
}

export function ContentCard({ content, isAdmin, onDelete }: ContentCardProps) {
  const { t } = useLanguage();
  const config = TYPE_CONFIG[content.content_type] || TYPE_CONFIG.article;

  const handleClick = () => {
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      onClick={handleClick}
      className="
        relative overflow-hidden bg-[#0F0F0F] p-0
        transition-all duration-300 group cursor-pointer
        border border-white/10 hover:border-white/20
        hover:scale-[1.02]
      "
      style={{
        boxShadow: undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${config.color}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail or Icon Area */}
      {content.thumbnail_url ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
        </div>
      ) : (
        <div
          className="flex items-center justify-center py-8"
          style={{ backgroundColor: `${config.color}10` }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${config.color}20` }}
          >
            {config.emoji}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Type Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            <span>{config.emoji}</span>
            <span>{t(config.labelKey)}</span>
          </div>

          {/* Duration Badge */}
          {content.duration && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/5 text-gray-400">
              <Clock size={10} />
              <span>{content.duration}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-2 group-hover:text-gray-100 transition-colors">
          {content.title}
        </h3>

        {/* Description */}
        {content.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-gray-400 transition-colors">
            <ExternalLink size={12} />
            <span>{t('learning_content.open')}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(content.id);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all group-hover:scale-110"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <ExternalLink
                size={14}
                style={{ color: config.color }}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
