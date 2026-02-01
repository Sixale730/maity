import { Link } from 'react-router-dom';
import { MaityLogo } from '@/shared/components/MaityLogo';
import { useSidebarNavigation } from '../hooks/useSidebarNavigation';
import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarUserFooter } from './SidebarUserFooter';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/ui/components/ui/sidebar';

export function AppSidebar() {
  const { userGroups, adminGroup } = useSidebarNavigation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                {state === 'collapsed' ? (
                  <MaityLogo size="sm" variant="symbol" />
                ) : (
                  <MaityLogo size="sm" variant="full" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation content */}
      <SidebarContent>
        {/* User groups */}
        {userGroups.map((group) => (
          <SidebarNavGroup key={group.id} group={group} />
        ))}

        {/* Admin section with separator */}
        {adminGroup && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarNavGroup group={adminGroup} />
          </>
        )}
      </SidebarContent>

      {/* User footer */}
      <SidebarUserFooter />

      {/* Rail for resizing */}
      <SidebarRail />
    </Sidebar>
  );
}
