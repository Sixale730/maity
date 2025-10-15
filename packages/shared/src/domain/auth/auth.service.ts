// src/lib/auth.ts
export function buildRedirectTo(
    returnTo?: string | null,
    companyId?: string | null
  ): string {
    const origin = window.location.origin;                 // usa el origen actual (dev/prod)
    const url = new URL('/auth/callback', origin);         // tu callback (regístralo en Supabase)
  
    // Sanitiza returnTo: solo mismo origen y lo guarda como ruta relativa
    if (returnTo) {
      try {
        const candidate = new URL(returnTo, origin);
        if (candidate.origin === origin) {
          const rel = candidate.pathname + candidate.search + candidate.hash;
          if (rel.startsWith('/')) url.searchParams.set('returnTo', rel);
        }
      } catch { /* ignora valores inválidos */ }
    }
  
    if (companyId) url.searchParams.set('company', companyId);
    return url.toString();                                  // sin slash final extra
  }
  