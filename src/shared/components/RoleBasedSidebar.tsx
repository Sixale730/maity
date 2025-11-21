import {
  BarChart3,
  Home,
  Settings,
  Settings2,
  Users,
  PieChart,
  TrendingUp,
  LogOut,
  Building,
  Target,
  FileText,
  Trophy,
  MessageCircle,
  Headphones,
  History,
  Map,
  Play,
  Mic,
  Briefcase,
  Zap
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@maity/shared";
import { UserRole } from "@/contexts/UserContext";
import { useViewRole } from "@/contexts/ViewRoleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import MaityLogo from "./MaityLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/ui/components/ui/sidebar";

const getNavigationByRole = (role: UserRole) => {
  if (role === 'admin') {
    return [
      { title: "nav.dashboard", url: "/dashboard", icon: Home },
      { title: "nav.coach", url: "/coach", icon: MessageCircle },
      { title: "nav.roleplay", url: "/roleplay", icon: Headphones },
      { title: "Tech Week", url: "/tech-week", icon: Zap },
      { title: "nav.agent_config", url: "/admin/agent-config", icon: Settings2 },
      { title: "nav.first_interview", url: "/primera-entrevista", icon: Briefcase },
      { title: "nav.interview_history", url: "/primera-entrevista/historial", icon: History },
      { title: "nav.demo", url: "/demo", icon: Play },
      { title: "nav.demo_training", url: "/demo-training", icon: Mic },
      { title: "nav.roleplay_progress", url: "/progress", icon: Map },
      { title: "nav.sessions", url: "/sessions", icon: History },
      { title: "nav.analytics", url: "/analytics", icon: BarChart3 },
      { title: "nav.organizations", url: "/organizations", icon: Building },
      { title: "nav.users", url: "/usuarios", icon: Users },
      { title: "nav.reports", url: "/reports", icon: PieChart },
      { title: "nav.trends", url: "/trends", icon: TrendingUp },
      { title: "nav.plans", url: "/planes", icon: Settings },
      { title: "nav.documents", url: "/documentos", icon: FileText },
      { title: "nav.settings", url: "/settings", icon: Settings },
    ];
  } else if (role === 'manager') {
    return [
      { title: "nav.dashboard", url: "/dashboard", icon: Home },
      { title: "nav.roleplay", url: "/roleplay", icon: Headphones },
      { title: "nav.roleplay_progress", url: "/progress", icon: Map },
      { title: "nav.sessions", url: "/sessions", icon: History },
      { title: "nav.my_team", url: "/team", icon: Users },
      { title: "nav.plans", url: "/planes", icon: Target },
      { title: "nav.documents", url: "/documentos", icon: FileText },
      { title: "nav.settings", url: "/settings", icon: Settings },
    ];
  } else {
    // 'user' role
    return [
      { title: "nav.dashboard", url: "/dashboard", icon: Home },
      { title: "nav.first_interview", url: "/primera-entrevista", icon: Briefcase },
      { title: "nav.roleplay", url: "/roleplay", icon: Headphones },
      { title: "nav.roleplay_progress", url: "/progress", icon: Map },
      { title: "nav.sessions", url: "/sessions", icon: History },
    ];
  }
};

interface RoleBasedSidebarProps {
  userRole: UserRole;
  userName?: string;
}

export function RoleBasedSidebar({ userRole, userName }: RoleBasedSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { viewRole } = useViewRole();
  const currentPath = location.pathname;

  // Use viewRole for display, but keep userRole for backwards compatibility
  const effectiveRole = viewRole || userRole;
  const navigationItems = getNavigationByRole(effectiveRole);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => currentPath === path;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return t('roles.admin');
      case 'manager': return t('roles.manager');
      case 'user': return t('roles.user');
      default: return '';
    }
  };

  return (
    <Sidebar 
      className={`${state === "collapsed" ? "w-14" : "w-64"} border-r border-sidebar-border bg-sidebar transition-all duration-300`} 
      collapsible="icon"
    >
      <SidebarHeader className="p-0 border-b border-sidebar-border/50">
        {/* Logo Section with Link */}
        <Link
          to="/dashboard"
          className={`
            group/logo relative overflow-hidden
            ${state === "collapsed" ? "p-3" : "p-4"}
            transition-all duration-300 ease-in-out
            hover:bg-sidebar-accent/30
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring
            rounded-t-lg
          `}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/5 via-transparent to-sidebar-primary/5 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />

          {/* Logo Container */}
          <div className="relative flex items-center justify-center">
            <MaityLogo
              size="sm"
              variant={state === "collapsed" ? "symbol" : "full"}
              className="
                transition-all duration-300 ease-in-out
                group-hover/logo:scale-105 group-hover/logo:drop-shadow-lg
                group-active/logo:scale-95
              "
            />
          </div>

          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />
        </Link>

        {/* User Info Section */}
        {state !== "collapsed" && (
          <div className="px-4 pb-4 pt-2">
            <div className="space-y-1">
              <p className="font-semibold text-sm text-sidebar-foreground truncate">
                {userName || t('roles.default_user')}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse" />
                <p className="text-xs text-sidebar-foreground/70 font-medium uppercase tracking-wider">
                  {getRoleLabel(effectiveRole)}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {state !== "collapsed" && (
            <SidebarGroupLabel className="px-4 py-2 text-xs font-medium tracking-wider text-sidebar-foreground/60 uppercase">
              {t('nav.navigation')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => {
                const isDisabled = 'disabled' in item && item.disabled;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!isDisabled}
                      isActive={isActive(item.url)}
                      disabled={isDisabled}
                      className={`
                        w-full transition-all duration-200 rounded-lg
                        ${isDisabled
                          ? 'opacity-50 cursor-not-allowed hover:bg-transparent'
                          : isActive(item.url)
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:shadow-sidebar-primary/10'
                        }
                        ${state === "collapsed" ? 'justify-center p-2' : 'justify-start px-3 py-2'}
                      `}
                    >
                      {isDisabled ? (
                        <div className={`flex items-center ${state === "collapsed" ? '' : 'gap-3'}`}>
                          <item.icon className="h-5 w-5" />
                          {state !== "collapsed" && (
                            <span className="font-medium">{t(item.title)}</span>
                          )}
                        </div>
                      ) : (
                        <Link to={item.url} className={`flex items-center ${state === "collapsed" ? '' : 'gap-3'}`}>
                          <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-white' : ''}`} />
                          {state !== "collapsed" && (
                            <span className="font-medium transition-colors">{t(item.title)}</span>
                          )}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenuButton 
          onClick={handleLogout}
          className={`
            w-full transition-all duration-200 rounded-lg
            text-platinum hover:bg-sidebar-primary hover:text-white
            ${state === "collapsed" ? 'justify-center p-2' : 'justify-start px-3 py-2'}
          `}
        >
          <LogOut className="h-5 w-5" />
          {state !== "collapsed" && <span className="ml-3 font-medium">{t('nav.logout')}</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}