import { useLanguage } from '@/contexts/LanguageContext';
import { SidebarNavGroup as SidebarNavGroupType } from '../hooks/useSidebarNavigation';
import { SidebarNavItem } from './SidebarNavItem';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from '@/ui/components/ui/sidebar';

interface SidebarNavGroupProps {
  group: SidebarNavGroupType;
}

export function SidebarNavGroup({ group }: SidebarNavGroupProps) {
  const { t } = useLanguage();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarNavItem key={item.id} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
