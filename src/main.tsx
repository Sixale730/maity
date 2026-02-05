import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { env } from "@/lib/env";
import { initializeSupabase } from "@maity/shared";
import { isRecorderSubdomain } from "@/lib/subdomain";
import { Skeleton } from "@/ui/components/ui/skeleton";

// Initialize Supabase client with environment configuration
// This must happen before any auth or database operations
initializeSupabase({
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
});

// Detect subdomain BEFORE canonical redirect
const isRecorder = isRecorderSubdomain();

// Canonical redirect: fuerza siempre la URL canónica SOLO en el dominio de producción
// NO redirigir en localhost, ni en Vercel preview URLs
// SKIP for recorder subdomain (app.*) which has its own canonical URL
const isLocalhost = location.hostname.includes('localhost') || location.hostname.includes('127.0.0.1');
const isVercelPreview = location.hostname.includes('vercel.app');

// SOLO aplicar canonical redirect si estamos en un dominio custom (producción)
// y ese dominio NO es el canónico esperado
// Skip for recorder subdomain
if (!isLocalhost && !isVercelPreview && !isRecorder) {
  try {
    // Parse canonical URL from environment
    const canonicalUrl = new URL(env.canonicalUrl);
    const CANONICAL_HOSTNAME = canonicalUrl.hostname;
    const CANONICAL_PROTOCOL = canonicalUrl.protocol;

    let needsRedirect = false;
    let redirectUrl = '';

    // Validar hostname canónico
    if (location.hostname !== CANONICAL_HOSTNAME) {
      needsRedirect = true;
    }

    // Validar protocolo HTTPS
    if (location.protocol !== CANONICAL_PROTOCOL) {
      needsRedirect = true;
    }

    // Realizar redirect si es necesario
    if (needsRedirect) {
      redirectUrl = `${CANONICAL_PROTOCOL}//${CANONICAL_HOSTNAME}${location.pathname}${location.search}${location.hash}`;
      console.log(`Redirecting to canonical URL: ${redirectUrl}`);
      location.replace(redirectUrl);
    }
  } catch (error) {
    console.error('Error parsing canonical URL:', error);
  }
}

// Lazy load apps based on subdomain
const RecorderApp = lazy(() => import("./apps/recorder/RecorderApp"));
const MainApp = lazy(() => import("./App"));

// Simple loading fallback for initial app load
function AppLoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-4 p-8">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}

// Render the appropriate app based on subdomain
const root = document.getElementById("root")!;

if (isRecorder) {
  // Recorder App (lightweight, ~400KB)
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Suspense fallback={<AppLoadingFallback />}>
        <RecorderApp />
      </Suspense>
    </React.StrictMode>
  );
} else {
  // Main Platform App (full platform, ~1.5MB)
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Suspense fallback={<AppLoadingFallback />}>
        <MainApp />
      </Suspense>
    </React.StrictMode>
  );
}
