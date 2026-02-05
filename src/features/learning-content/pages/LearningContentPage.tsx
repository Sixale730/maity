import { useState, useMemo } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useViewRole } from '@/contexts/ViewRoleContext';
import { useLearningContent, useDeleteLearningContent } from '@maity/shared';
import type { LearningContent } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { ContentCard } from '../components/ContentCard';
import { ContentTypeTabs } from '../components/ContentTypeTabs';
import { AddContentDialog } from '../components/AddContentDialog';

type ContentType = 'video' | 'podcast' | 'pdf' | 'article';

export function LearningContentPage() {
  const { t } = useLanguage();
  const { actualRole } = useViewRole();
  const { toast } = useToast();
  const { data: content, isLoading, error } = useLearningContent();
  const deleteContent = useDeleteLearningContent();

  const [activeType, setActiveType] = useState<ContentType | null>(null);

  const isAdmin = actualRole === 'admin';

  const filteredContent = useMemo(() => {
    if (!content) return [];
    if (!activeType) return content;
    return content.filter((item: LearningContent) => item.content_type === activeType);
  }, [content, activeType]);

  const counts = useMemo(() => {
    if (!content) return { all: 0, video: 0, podcast: 0, pdf: 0, article: 0 };
    return {
      all: content.length,
      video: content.filter((c: LearningContent) => c.content_type === 'video').length,
      podcast: content.filter((c: LearningContent) => c.content_type === 'podcast').length,
      pdf: content.filter((c: LearningContent) => c.content_type === 'pdf').length,
      article: content.filter((c: LearningContent) => c.content_type === 'article').length,
    };
  }, [content]);

  const handleDelete = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id);
      toast({ title: t('learning_content.delete_success'), variant: 'default' });
    } catch {
      toast({ title: t('learning_content.error'), variant: 'destructive' });
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #485df4, #9b4dca)',
              }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t('learning_content.title')}
              </h1>
              <p className="text-gray-500 text-sm">
                {t('learning_content.description')}
              </p>
            </div>
          </div>
          {isAdmin && <AddContentDialog />}
        </div>

        {/* Tabs */}
        <ContentTypeTabs
          activeType={activeType}
          onChange={setActiveType}
          counts={counts}
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">{t('learning_content.loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-400 text-sm">{t('learning_content.error')}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">{t('learning_content.empty')}</p>
          </div>
        )}

        {/* Grid */}
        {filteredContent.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContent.map((item: LearningContent) => (
              <ContentCard
                key={item.id}
                content={item}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
