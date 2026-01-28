import { useMemo } from 'react';
import { useViewRole } from '@/contexts/ViewRoleContext';
import {
  allNavigationItems,
  NavigationItem,
  NavigationGroup,
} from '@/features/navigation';

export interface SidebarNavGroup {
  id: NavigationGroup;
  titleKey: string;
  items: NavigationItem[];
}

const GROUP_TITLES: Record<NavigationGroup, string> = {
  profile: 'sidebar.groups.profile',
  practice: 'sidebar.groups.practice',
  progress: 'sidebar.groups.progress',
  team: 'sidebar.groups.team',
  config: 'sidebar.groups.config',
  admin: 'sidebar.groups.admin',
};

const GROUP_ORDER: NavigationGroup[] = [
  'profile',
  'practice',
  'progress',
  'team',
  'config',
  'admin',
];

export function useSidebarNavigation() {
  const { viewRole } = useViewRole();

  const filteredItems = useMemo(() => {
    if (!viewRole) return [];

    return allNavigationItems.filter((item) => item.roles.includes(viewRole));
  }, [viewRole]);

  const groupedItems = useMemo(() => {
    const groups: SidebarNavGroup[] = [];

    GROUP_ORDER.forEach((groupId) => {
      const items = filteredItems.filter((item) => item.group === groupId);
      if (items.length > 0) {
        groups.push({
          id: groupId,
          titleKey: GROUP_TITLES[groupId],
          items: items.sort((a, b) => a.order - b.order),
        });
      }
    });

    return groups;
  }, [filteredItems]);

  // Separate admin group for visual distinction
  const userGroups = useMemo(
    () => groupedItems.filter((g) => g.id !== 'admin'),
    [groupedItems]
  );

  const adminGroup = useMemo(
    () => groupedItems.find((g) => g.id === 'admin'),
    [groupedItems]
  );

  return {
    allGroups: groupedItems,
    userGroups,
    adminGroup,
  };
}
