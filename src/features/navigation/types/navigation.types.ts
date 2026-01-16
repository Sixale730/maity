import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/contexts/UserContext';

export type NavigationGroup =
  | 'profile'       // Dashboard, Avatar
  | 'practice'      // Roleplay, Interview, Coach
  | 'progress'      // Learning Path, Progress, Sessions
  | 'team'          // Team Progress, Team Management
  | 'config'        // Plans, Documents, Settings
  | 'admin';        // All admin tools

export interface NavigationItem {
  id: string;
  titleKey: string;         // Translation key for title
  descriptionKey: string;   // Translation key for description
  url: string;
  icon: LucideIcon;
  roles: UserRole[];        // Which roles can see this item
  group: NavigationGroup;
  order: number;
}

export interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}

export interface NavigationCardGroupProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}
