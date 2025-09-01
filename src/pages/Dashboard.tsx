import React, { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/RoleBasedSidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStatusValidation } from "@/hooks/useStatusValidation";

const Dashboard = () => {
  const { userRole, userProfile, loading } = useUserRole();
  const { t } = useLanguage();
  const { validateStatus } = useStatusValidation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">{t('dashboard.loading')}</p>
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