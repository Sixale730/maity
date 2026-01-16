import { Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useViewRole } from '@/contexts/ViewRoleContext';
import { NavigationCard } from './NavigationCard';
import { adminNavigationItems } from '../data/navigation-items';

export function AdminNavigationSection() {
  const { t } = useLanguage();
  const { viewRole } = useViewRole();

  // Only show for admin role
  if (viewRole !== 'admin') {
    return null;
  }

  // Filter admin items
  const adminItems = adminNavigationItems.filter((item) =>
    item.roles.includes('admin')
  );

  if (adminItems.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 border-t-2 border-dashed border-muted-foreground/20">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="text-base font-semibold text-muted-foreground">
            {t('nav.section.admin')}
          </h2>
          <p className="text-sm text-muted-foreground/70">
            {t('nav.section.admin_desc')}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {adminItems.map((item) => (
          <NavigationCard
            key={item.id}
            icon={item.icon}
            title={t(item.titleKey)}
            description={t(item.descriptionKey)}
            href={item.url}
          />
        ))}
      </div>
    </section>
  );
}
