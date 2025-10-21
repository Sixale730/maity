import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { env } from "@/lib/env";
import { initializeSupabase } from "@maity/shared";

// Initialize Supabase client with environment configuration
// This must happen before any auth or database operations
initializeSupabase({
  url: env.supabaseUrl,
  anonKey: env.supabaseAnonKey,
});

// Canonical redirect: fuerza siempre la URL canónica SOLO en el dominio de producción
// NO redirigir en localhost, ni en Vercel preview URLs
const isLocalhost = location.hostname.includes('localhost') || location.hostname.includes('127.0.0.1');
const isVercelPreview = location.hostname.includes('vercel.app');

// SOLO aplicar canonical redirect si estamos en un dominio custom (producción)
// y ese dominio NO es el canónico esperado
if (!isLocalhost && !isVercelPreview) {
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
