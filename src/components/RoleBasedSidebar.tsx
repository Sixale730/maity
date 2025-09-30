import React from "react";
import {
  BarChart3,
  Home,
  Settings,
  Users,
  PieChart,
  TrendingUp,
  LogOut,
  Building,
  User,
  Target,
  Calendar,
  FileText,
  Trophy,
  MessageCircle,
  Headphones
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import MaityLogo from "./MaityLogo";
import LanguageSelector from "./LanguageSelector";
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
} from "@/components/ui/sidebar";

const getNavigationByRole = (role: UserRole) => {
  const baseItems = [
    { title: "nav.dashboard", url: "/dashboard", icon: Home },
    { title: "nav.coach", url: "/dashboard/coach", icon: MessageCircle },
    { title: "nav.roleplay", url: "/roleplay", icon: Headphones },
  ];

  if (role === 'admin') {
    return [
      ...baseItems,
      { title: "nav.analytics", url: "/dashboard/analytics", icon: BarChart3 },
      { title: "nav.organizations", url: "/dashboard/organizations", icon: Building },
      { title: "nav.users", url: "/dashboard/usuarios", icon: Users },
      { title: "nav.reports", url: "/dashboard/reports", icon: PieChart },
      { title: "nav.trends", url: "/dashboard/trends", icon: TrendingUp },
      { title: "nav.plans", url: "/dashboard/planes", icon: Settings },
      { title: "nav.documents", url: "/dashboard/documentos", icon: FileText },
      { title: "nav.settings", url: "/dashboard/settings", icon: Settings },
    ];
  } else if (role === 'manager') {
    return [
      ...baseItems,
      { title: "nav.my_team", url: "/dashboard/team", icon: Users },
      { title: "nav.plans", url: "/dashboard/planes", icon: Target },
      { title: "nav.documents", url: "/dashboard/documentos", icon: FileText },
      { title: "nav.settings", url: "/dashboard/settings", icon: Settings },
    ];
  } else {
    // 'user' role
    return [
      ...baseItems,
      { title: "nav.plan", url: "/dashboard/plan", icon: Target },
      { title: "nav.achievements", url: "/dashboard/logros", icon: Trophy },
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
  const currentPath = location.pathname;

  const navigationItems = getNavigationByRole(userRole);

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
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar-background to-sidebar-accent">
        <div className="flex items-center gap-3 min-w-0">
          <MaityLogo 
            size="sm" 
            variant={state === "collapsed" ? "symbol" : "full"}
            className="transition-all duration-300 flex-shrink-0"
          />
          {state !== "collapsed" && (
            <div className="flex-shrink-0 ml-auto">
            </div>
          )}
        </div>
        {state !== "collapsed" && (
          <div className="mt-3 text-xs">
            <p className="font-medium text-sidebar-foreground">{userName || t('roles.default_user')}</p>
            <p className="text-sidebar-foreground/60">{getRoleLabel(userRole)}</p>
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
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      w-full transition-all duration-200 rounded-lg
                      ${isActive(item.url) 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30' 
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:shadow-sidebar-primary/10'
                      }
                      ${state === "collapsed" ? 'justify-center p-2' : 'justify-start px-3 py-2'}
                    `}
                  >
                    <Link to={item.url} className={`flex items-center ${state === "collapsed" ? '' : 'gap-3'}`}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-white' : ''}`} />
                      {state !== "collapsed" && (
                        <span className="font-medium transition-colors">{t(item.title)}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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