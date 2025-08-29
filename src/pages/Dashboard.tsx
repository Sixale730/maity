import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/RoleBasedSidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const { userRole, userProfile, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleBasedSidebar userRole={userRole} userName={userProfile?.name} />
        <DashboardContent />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;