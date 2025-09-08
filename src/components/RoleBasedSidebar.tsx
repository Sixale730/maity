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
  Trophy
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserRole";
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
    { title: "Dashboard", url: "/dashboard", icon: Home },
  ];

  if (role === 'platform_admin') {
    return [
      ...baseItems,
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
      { title: "Organizaciones", url: "/dashboard/organizations", icon: Building },
      { title: "Usuarios", url: "/dashboard/usuarios", icon: Users },
      { title: "Reports", url: "/dashboard/reports", icon: PieChart },
      { title: "Trends", url: "/dashboard/trends", icon: TrendingUp },
      { title: "Planes", url: "/dashboard/planes", icon: Settings },
      { title: "Documentos", url: "/dashboard/documentos", icon: FileText },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ];
  } else if (role === 'org_admin') {
    return [
      ...baseItems,
      { title: "Mi Equipo", url: "/dashboard/team", icon: Users },
      { title: "Planes", url: "/dashboard/planes", icon: Target },
      { title: "Documentos", url: "/dashboard/documentos", icon: FileText },
      { title: "Ajustes", url: "/dashboard/settings", icon: Settings },
    ];
  } else {
    // 'user' role
    return [
      ...baseItems,
      { title: "Plan", url: "/dashboard/plan", icon: Target },
      { title: "Logros", url: "/dashboard/logros", icon: Trophy },
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
  const currentPath = location.pathname;

  const navigationItems = getNavigationByRole(userRole);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => currentPath === path;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'platform_admin': return 'Administrador Global';
      case 'org_admin': return 'Administrador';
      case 'user': return 'Usuario';
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
              <LanguageSelector compact />
            </div>
          )}
        </div>
        {state !== "collapsed" && (
          <div className="mt-3 text-xs">
            <p className="font-medium text-sidebar-foreground">{userName || 'Usuario'}</p>
            <p className="text-sidebar-foreground/60">{getRoleLabel(userRole)}</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {state !== "collapsed" && (
            <SidebarGroupLabel className="px-4 py-2 text-xs font-medium tracking-wider text-sidebar-foreground/60 uppercase">
              Navegación
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
            text-platinum hover:bg-sidebar-primary hover:text-white
            ${state === "collapsed" ? 'justify-center p-2' : 'justify-start px-3 py-2'}
          `}
        >
          <LogOut className="h-5 w-5" />
          {state !== "collapsed" && <span className="ml-3 font-medium">Cerrar Sesión</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}