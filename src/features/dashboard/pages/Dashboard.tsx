import { DashboardContent } from "@/features/dashboard/components/DashboardContent";
import { useUser } from "@/contexts/UserContext";

const Dashboard = () => {
  const { userRole, userProfile, loading } = useUser();

  // Show loading spinner in content area while data loads
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudo cargar el perfil de usuario</p>
        </div>
      </div>
    );
  }

  return <DashboardContent userRole={userRole} userProfile={userProfile} />;
};

export default Dashboard;