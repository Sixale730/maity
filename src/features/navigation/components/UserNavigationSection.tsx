import { Headphones, TrendingUp, UserCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useViewRole } from '@/contexts/ViewRoleContext';
import { NavigationCard } from './NavigationCard';
import { NavigationCardGroup } from './NavigationCardGroup';
import {
  userNavigationItems,
  managerNavigationItems,
} from '../data/navigation-items';

export function UserNavigationSection() {
  const { t } = useLanguage();
  const { viewRole } = useViewRole();

  // Filter items by current role
  const filterByRole = (items: typeof userNavigationItems) =>
    items.filter((item) => item.roles.includes(viewRole || 'user'));

  // Get items for each group
  const profileItems = filterByRole(userNavigationItems).filter(
    (item) => item.group === 'profile'
  );
  const practiceItems = filterByRole(userNavigationItems).filter(
    (item) => item.group === 'practice'
  );
  const progressItems = filterByRole(userNavigationItems).filter(
    (item) => item.group === 'progress'
  );
  const teamItems = filterByRole(managerNavigationItems).filter(
    (item) => item.group === 'team'
  );
  const configItems = filterByRole(managerNavigationItems).filter(
    (item) => item.group === 'config'
  );

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      {profileItems.length > 0 && (
        <NavigationCardGroup
          title={t('nav.section.profile')}
          description={t('nav.section.profile_desc')}
          icon={UserCircle}
        >
          {profileItems.map((item) => (
            <NavigationCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              href={item.url}
            />
          ))}
        </NavigationCardGroup>
      )}

      {/* Practice Section */}
      {practiceItems.length > 0 && (
        <NavigationCardGroup
          title={t('nav.section.practice')}
          description={t('nav.section.practice_desc')}
          icon={Headphones}
        >
          {practiceItems.map((item) => (
            <NavigationCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              href={item.url}
            />
          ))}
        </NavigationCardGroup>
      )}

      {/* Progress Section */}
      {progressItems.length > 0 && (
        <NavigationCardGroup
          title={t('nav.section.progress')}
          description={t('nav.section.progress_desc')}
          icon={TrendingUp}
        >
          {progressItems.map((item) => (
            <NavigationCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              href={item.url}
            />
          ))}
        </NavigationCardGroup>
      )}

      {/* Team Section (Manager+) */}
      {teamItems.length > 0 && (
        <NavigationCardGroup
          title={t('nav.section.team')}
          description={t('nav.section.team_desc')}
        >
          {teamItems.map((item) => (
            <NavigationCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              href={item.url}
            />
          ))}
        </NavigationCardGroup>
      )}

      {/* Config Section (Manager+) */}
      {configItems.length > 0 && (
        <NavigationCardGroup
          title={t('nav.section.config')}
          description={t('nav.section.config_desc')}
        >
          {configItems.map((item) => (
            <NavigationCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              href={item.url}
            />
          ))}
        </NavigationCardGroup>
      )}
    </div>
  );
}
