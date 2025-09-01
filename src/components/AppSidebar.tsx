import React from "react";
import { 
  BarChart3, 
  Home, 
  Settings, 
  Users, 
  PieChart, 
  TrendingUp,
  LogOut
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MaityLogo from "./MaityLogo";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
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

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navigationItems = [
    { title: t('dashboard.home'), url: "/dashboard", icon: Home },
    { title: t('dashboard.analytics'), url: "/dashboard/analytics", icon: BarChart3 },
    { title: t('dashboard.reports'), url: "/dashboard/reports", icon: PieChart },
    { title: t('dashboard.trends'), url: "/dashboard/trends", icon: TrendingUp },
    { title: t('dashboard.users'), url: "/dashboard/usuarios", icon: Users },
    { title: t('dashboard.plans'), url: "/dashboard/planes", icon: Settings },
    { title: t('dashboard.settings'), url: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar 
      className={`${state === "collapsed" ? "w-14" : "w-64"} border-r border-sidebar-border bg-sidebar transition-all duration-300`} 
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar-background to-sidebar-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaityLogo 
              size="sm" 
              variant={state === "collapsed" ? "symbol" : "full"}
              className="transition-all duration-300"
            />
          </div>
          {state !== "collapsed" && (
            <LanguageSelector compact className="ml-2" />
          )}
        </div>
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
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20' 
                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                      ${state === "collapsed" ? 'justify-center p-2' : 'justify-start px-3 py-2'}
                    `}
                  >
                    <Link to={item.url} className={`flex items-center ${state === "collapsed" ? '' : 'gap-3'}`}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-white' : ''}`} />
                      {state !== "collapsed" && (
                        <span className="font-medium transition-colors">{item.title}</span>
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
            text-sidebar-primary hover:bg-sidebar-primary hover:text-white
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