/**
 * LoadingFallback Component
 *
 * Skeleton UI shown while lazy-loaded route components are loading.
 * Provides better UX than a blank screen during code splitting.
 */

import { Skeleton } from "@/ui/components/ui/skeleton";

export default function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-7xl space-y-8 p-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Main content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
