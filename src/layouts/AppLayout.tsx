import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { PlatformTour } from "@/components/PlatformTour";
import { usePlatformTour } from "@/contexts/PlatformTourContext";
import { NavigationHeader } from "@/features/navigation";
import { AppSidebar } from "@/features/sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/ui/components/ui/sidebar";

const AppLayout = () => {
  const { userRole } = useUser();
  const { isRunning, finishTour, skipTour } = usePlatformTour();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          {/* Navigation Header */}
          <NavigationHeader />

          {/* Main content */}
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                <Outlet />
              </Suspense>
            </div>
          </main>

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
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;