import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * AdminRoute - Protects routes that require admin role
 *
 * Usage:
 * ```tsx
 * <Route path="/admin-only" element={
 *   <AdminRoute>
 *     <AdminPage />
 *   </AdminRoute>
 * } />
 * ```
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { userProfile, isAdmin, loading } = useUser();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userProfile) {
    return <Navigate to="/" replace />;
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has admin role
  return <>{children}</>;
}
