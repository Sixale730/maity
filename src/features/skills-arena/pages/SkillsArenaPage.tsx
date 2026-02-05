import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useSkillsArena } from '../hooks/useSkillsArena';
import { useArenaResources } from '../hooks/useArenaResources';
import { ArenaHeader } from '../components/ArenaHeader';
import { FeaturedTestCard } from '../components/FeaturedTestCard';
import { TestCard } from '../components/TestCard';
import { ResourceCard } from '../components/ResourceCard';
import { CategoryTabs } from '../components/CategoryTabs';
import type { TestCategory } from '../types/skills-arena.types';

export function SkillsArenaPage() {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const [activeCategory, setActiveCategory] = useState<TestCategory | null>(null);

  const data = useSkillsArena();
  const { resources, loading: resourcesLoading } = useArenaResources();

  // Get featured test
  const featuredTest = useMemo(
    () => data.tests.find((test) => test.id === data.featuredTestId),
    [data.tests, data.featuredTestId]
  );

  // Filter tests (excluding featured) by category
  const filteredTests = useMemo(() => {
    let tests = data.tests.filter((test) => test.id !== data.featuredTestId);

    if (activeCategory) {
      tests = tests.filter((test) => test.category === activeCategory);
    }

    return tests;
  }, [data.tests, data.featuredTestId, activeCategory]);

  // Calculate test counts per category
  const testCounts = useMemo(() => {
    const counts: Record<TestCategory | 'all', number> = {
      all: data.tests.length,
      'self-knowledge': 0,
      communication: 0,
      balance: 0,
      leadership: 0,
      emotional: 0,
    };

    data.tests.forEach((test) => {
      counts[test.category]++;
    });

    return counts;
  }, [data.tests]);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#ff0050] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <ArenaHeader
          stats={data.stats}
          userName={userProfile?.name}
        />

        {/* Featured Test */}
        {featuredTest && (
          <div className="mb-8">
            <FeaturedTestCard
              test={featuredTest}
              progress={data.userProgress[featuredTest.id]}
            />
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {t('skills_arena.all_tests')}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTests.length} {t('skills_arena.available')}
          </span>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          testCounts={testCounts}
        />

        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                progress={data.userProgress[test.id]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-400">
              {t('skills_arena.no_tests_in_category')}
            </p>
          </div>
        )}

        {/* Resources Section */}
        {resources.length > 0 && (
          <div className="mt-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <BookOpen size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('skills_arena.resources_title')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t('skills_arena.resources_description')}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {resources.length} {t('skills_arena.resources_count')}
              </span>
            </div>

            {/* Resources Grid */}
            {resourcesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
