import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/ui/components/ui/sidebar";
import { RoleBasedSidebar } from "@/shared/components/RoleBasedSidebar";
import { AdminViewRoleSelector } from "@/shared/components/AdminViewRoleSelector";
import { useUser } from "@/contexts/UserContext";
import { PlatformTour } from "@/components/PlatformTour";
import { usePlatformTour } from "@/contexts/PlatformTourContext";

const AppLayout = () => {
  const { userRole, userProfile } = useUser();
  const { isRunning, finishTour, skipTour } = usePlatformTour();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RoleBasedSidebar userRole={userRole} userName={userProfile?.name} />
        <div className="flex-1 flex flex-col">
          {/* Header with role selector (only visible to admins) */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-end px-4">
              <AdminViewRoleSelector />
            </div>
          </div>

          {/* Main content */}
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

        {/* Tour guiado de la plataforma */}
        {userRole && (
          <PlatformTour
            run={isRunning}
            userRole={userRole}
            onFinish={finishTour}
            onSkip={skipTour}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;