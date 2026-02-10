import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, AuthService } from "@maity/shared";
import { env } from "@/lib/env";
import { MaityLogo } from "@/shared/components/MaityLogo";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasRoutedRef = useRef(false);

  useEffect(() => {
    // Prevent re-entry immediately
    if (hasRoutedRef.current) {
      console.warn("[AuthCb] Already processing callback, preventing re-entry");
      return;
    }

    // Set flag immediately to block concurrent executions
    hasRoutedRef.current = true;

    // Check if OAuth is already being processed (prevents race condition)
    const processing = localStorage.getItem('oauth_processing');
    if (processing) {
      console.warn("[AuthCb] OAuth already processing in another tab/execution, redirecting to dashboard");
      localStorage.removeItem('oauth_processing');
      navigate('/gamified-dashboard-v2', { replace: true });
      return;
    }

    (async () => {
      try {
        // Set processing flag before any async operations
        localStorage.setItem('oauth_processing', Date.now().toString());
        console.log("[AuthCb] Started auth callback processing");

        const url = new URL(window.location.href);

        // Check for OAuth errors
        const errorDescription = url.searchParams.get("error_description");
        if (errorDescription) {
          console.error("[AuthCb] OAuth error:", errorDescription);
          navigate("/auth", { replace: true });
          return;
        }

        // OAuth flow: exchange code for session
        const code = url.searchParams.get("code");
        if (code) {
          console.log("[AuthCb] Exchanging OAuth code for session...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[AuthCb] exchangeCodeForSession error:", exchangeError);
            navigate("/auth", { replace: true });
            return;
          }
          console.log("[AuthCb] Session exchange successful");

          // Small delay to ensure session is fully established
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          // Email/password flow: session should already exist
          console.log("[AuthCb] No OAuth code found, checking existing session...");
          const session = await AuthService.getSession();
          if (!session) {
            console.error("[AuthCb] No session found");
            navigate("/auth", { replace: true });
            return;
          }
        }

        // Use centralized post-login service to handle all logic
        const returnTo = url.searchParams.get("returnTo");
        console.log("[AuthCb] Calling handlePostLogin service...");

        const result = await AuthService.handlePostLogin({
          returnTo,
          apiUrl: env.apiUrl
        });

        console.log("[AuthCb] Post-login processing completed:", result);
        navigate(result.destination, { replace: true });

      } catch (error) {
        console.error("[AuthCb] Unexpected error during auth callback:", error);
        navigate("/auth", { replace: true });
      } finally {
        // Always clean up processing flag
        localStorage.removeItem('oauth_processing');
        console.log("[AuthCb] Auth callback processing completed");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-[#1bea9a] animate-spin mx-auto"></div>

          {/* Logo/Símbolo de Maity dentro del spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <MaityLogo variant="symbol" size="sm" className="w-6 h-6" />
          </div>
        </div>

        {/* Texto */}
        <h2 className="text-xl font-semibold text-white mb-2">
          Procesando inicio de sesión
        </h2>
        <p className="text-gray-400 text-sm">
          Configurando tu cuenta...
        </p>
      </div>
    </div>
  );
}

