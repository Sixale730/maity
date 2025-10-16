import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/ui/components/ui/sidebar";
import { RoleBasedSidebar } from "@/shared/components/RoleBasedSidebar";
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
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
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