import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/RoleBasedSidebar";
import { useUser } from "@/contexts/UserContext";

const AppLayout = () => {
  const { userRole, userProfile } = useUser();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleBasedSidebar userRole={userRole} userName={userProfile?.name} />
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;