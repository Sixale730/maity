/**
 * RecorderAuthCallback
 *
 * Simplified auth callback for the Recorder App.
 * Only exchanges OAuth code for session and redirects to home.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@maity/shared';
import { MaityLogo } from '@/shared/components/MaityLogo';

export function RecorderAuthCallback() {
  const navigate = useNavigate();
  const hasRoutedRef = useRef(false);

  useEffect(() => {
    // Prevent re-entry
    if (hasRoutedRef.current) {
      console.warn('[RecorderAuthCb] Already processing callback');
      return;
    }
    hasRoutedRef.current = true;

    // Check if already processing
    const processing = localStorage.getItem('oauth_processing');
    if (processing) {
      console.warn('[RecorderAuthCb] OAuth already processing, redirecting to home');
      localStorage.removeItem('oauth_processing');
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      try {
        localStorage.setItem('oauth_processing', Date.now().toString());
        console.log('[RecorderAuthCb] Started auth callback processing');

        const url = new URL(window.location.href);

        // Check for OAuth errors
        const errorDescription = url.searchParams.get('error_description');
        if (errorDescription) {
          console.error('[RecorderAuthCb] OAuth error:', errorDescription);
          navigate('/auth', { replace: true });
          return;
        }

        // OAuth flow: exchange code for session
        const code = url.searchParams.get('code');
        if (code) {
          console.log('[RecorderAuthCb] Exchanging OAuth code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('[RecorderAuthCb] exchangeCodeForSession error:', exchangeError);
            navigate('/auth', { replace: true });
            return;
          }
          console.log('[RecorderAuthCb] Session exchange successful');

          // Small delay to ensure session is fully established
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          // Check for existing session
          console.log('[RecorderAuthCb] No OAuth code, checking existing session...');
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('[RecorderAuthCb] No session found');
            navigate('/auth', { replace: true });
            return;
          }
        }

        // Ensure user exists in maity.users
        try {
          const { error: ensureError } = await supabase.rpc('ensure_user');
          if (ensureError) {
            console.warn('[RecorderAuthCb] ensure_user error (non-fatal):', ensureError);
          }
        } catch (e) {
          console.warn('[RecorderAuthCb] ensure_user failed (non-fatal):', e);
        }

        // Simply redirect to recorder home
        console.log('[RecorderAuthCb] Auth complete, redirecting to home');
        navigate('/', { replace: true });

      } catch (error) {
        console.error('[RecorderAuthCb] Unexpected error:', error);
        navigate('/auth', { replace: true });
      } finally {
        localStorage.removeItem('oauth_processing');
        console.log('[RecorderAuthCb] Processing completed');
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MaityLogo variant="symbol" size="sm" className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Procesando inicio de sesión</h2>
        <p className="text-muted-foreground text-sm">Un momento...</p>
      </div>
    </div>
  );
}

export default RecorderAuthCallback;
