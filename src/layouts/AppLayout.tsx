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
        {/* Decorative background blobs - matching landing page style */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#485df4] rounded-full opacity-10 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#ff0050] rounded-full opacity-10 blur-[120px]" />
        </div>
        <div className="min-h-screen flex flex-col relative z-10">
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