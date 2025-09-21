import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
          if (!cancelled) setState('deny');
          return;
        }

        const { data, error } = await supabase.rpc('my_phase');
        if (error) {
          console.error('[ProtectedRoute] my_phase error:', error);
          if (pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
          if (!cancelled) setState('deny');
          return;
        }

        const raw =
          typeof data === 'string'
            ? data
            : (data as any)?.phase ??
              (Array.isArray(data) ? (data[0] as any)?.phase : undefined);

        const phase: Phase = String(raw || '').toUpperCase();

        if (phase === 'ACTIVE') {
          if (!cancelled) setState('allow');
          return;
        }

        let target = '/auth';
        if (phase === 'REGISTRATION') {
          target = '/registration';
        } else if (phase === 'NO_COMPANY') {
          target = '/pending';
        }

        if (pathname !== target) {
          navigate(target, { replace: true });
        }
        if (!cancelled) setState('deny');
      } catch (err) {
        console.error('[ProtectedRoute] general error:', err);
        if (pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
        if (!cancelled) setState('deny');
      }
    };

    resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate, pathname]);

  if (state === 'loading') {
    return <p>Loading...</p>;
  }

  if (state === 'allow') {
    return <Outlet />;
  }

  return <p>Loading...</p>;
};

export default ProtectedRoute;
