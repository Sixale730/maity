import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase, AuthService } from '@maity/shared';

type GuardState = 'loading' | 'allow' | 'deny';

type Phase = 'ACTIVE' | 'REGISTRATION' | 'NO_COMPANY' | string;

const ProtectedRoute = () => {
  const [state, setState] = useState<GuardState>('loading');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;

    const resolveAccess = async () => {
      setState('loading');
      try {
        console.log("[ProtectedRoute] Checking access for:", pathname);
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[ProtectedRoute] Session:", !!session, session?.user?.email);

        if (!session) {
          console.log("[ProtectedRoute] No session, redirecting to auth");
          if (pathname !== '/auth') {
            // Preservar la URL actual como returnTo
            const returnTo = `${pathname}${window.location.search}${window.location.hash}`;
            console.log("[ProtectedRoute] Redirecting to auth with returnTo:", returnTo);
            navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
          }
          if (!cancelled) setState('deny');
          return;
        }

        // Primero verificar roles - si es admin/manager, permitir acceso directo
        const rolesData = await AuthService.getMyRoles();
        console.log("[ProtectedRoute] User roles:", rolesData);

        if (rolesData.includes('admin') || rolesData.includes('manager')) {
          console.log("[ProtectedRoute] User has admin/manager role - access granted");
          if (!cancelled) setState('allow');
          return;
        }

        // Si no es admin/manager, verificar fase
        const phase: Phase = await AuthService.getMyPhase();
        console.log("[ProtectedRoute] User phase:", phase, "for path:", pathname);

        if (phase === 'ACTIVE') {
          console.log("[ProtectedRoute] User is ACTIVE - access granted");
          if (!cancelled) setState('allow');
          return;
        }

        let target = '/user-status-error'; // fallback por defecto
        if (phase === 'REGISTRATION') {
          target = '/registration';
          console.log("[ProtectedRoute] User needs REGISTRATION - redirecting");
        } else if (phase === 'NO_COMPANY') {
          target = '/pending';
          console.log("[ProtectedRoute] User has NO_COMPANY - redirecting to pending");
        } else {
          console.warn("[ProtectedRoute] Unknown phase:", phase);
        }

        if (pathname !== target) {
          navigate(target, { replace: true });
        }
        if (!cancelled) setState('deny');
      } catch (err) {
        console.error('[ProtectedRoute] general error:', err);
        if (pathname !== '/auth') {
          const returnTo = `${pathname}${window.location.search}${window.location.hash}`;
          navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
        }
        if (!cancelled) setState('deny');
      }
    };

    resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate, pathname]);

  // Always render the outlet to allow the layout to show
  // The individual pages will handle their own loading states
  if (state === 'loading' || state === 'allow') {
    return <Outlet />;
  }

  // Only return null if explicitly denied (will redirect)
  return null;
};

export default ProtectedRoute;


