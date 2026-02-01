import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavigationItem } from '@/features/navigation';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/ui/components/ui/sidebar';

interface SidebarNavItemProps {
  item: NavigationItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const Icon = item.icon;

  const isActive = location.pathname === item.url ||
    location.pathname.startsWith(`${item.url}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={t(item.titleKey)}
      >
        <Link to={item.url}>
          <Icon />
          <span>{t(item.titleKey)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
