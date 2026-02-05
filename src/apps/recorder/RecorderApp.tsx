/**
 * RecorderApp
 *
 * Lightweight standalone app for the recorder subdomain (app.maity.com.mx).
 * Provides recording functionality with simplified auth flow.
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/ui/components/ui/toaster';
import { Toaster as Sonner } from '@/ui/components/ui/sonner';
import { TooltipProvider } from '@/ui/components/ui/tooltip';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { RecorderUserProvider, useRecorderUser } from './contexts/RecorderUserContext';
import { RecorderLayout } from './layouts/RecorderLayout';
import { Skeleton } from '@/ui/components/ui/skeleton';

// Lazy load pages
const RecorderAuthPage = lazy(() => import('./pages/RecorderAuthPage'));
const RecorderAuthCallback = lazy(() => import('./pages/RecorderAuthCallback'));
const RecorderHomePage = lazy(() => import('./pages/RecorderHomePage'));
const RecorderConversationsPage = lazy(() => import('./pages/RecorderConversationsPage'));

// Reuse RecorderPage from web-recorder feature
const RecorderPage = lazy(() =>
  import('@/features/web-recorder/pages/RecorderPage').then((m) => ({ default: m.RecorderPage }))
);

// Query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Loading fallback
function PageLoadingFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRecorderUser();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirect to home if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRecorderUser();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Main app routes
function RecorderRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoadingFallback />}>
              <RecorderAuthPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/auth/callback"
        element={
          <Suspense fallback={<PageLoadingFallback />}>
            <RecorderAuthCallback />
          </Suspense>
        }
      />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <RecorderLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <RecorderHomePage />
            </Suspense>
          }
        />
        <Route
          path="record"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <RecorderPage />
            </Suspense>
          }
        />
        <Route
          path="conversations"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <RecorderConversationsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// App component
export function RecorderApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RecorderUserProvider>
              <RecorderRoutes />
            </RecorderUserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default RecorderApp;
