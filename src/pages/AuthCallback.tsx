import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const href = window.location.href;

      try {
        let {
          data: { session },
        } = await supabase.auth.getSession();

        const hasCode = new URL(href).searchParams.has("code");
        if (!session && hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          session = data.session ?? null;
        }

        if (!session) throw new Error("No session after callback");

        const url = new URL(href);
        const returnTo = url.searchParams.get("returnTo") || "/dashboard";

        window.history.replaceState({}, "", "/auth/callback");

        navigate(returnTo.startsWith("/") ? returnTo : "/dashboard", { replace: true });
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[callback] auth error:", error);
        }
        // Optionally: navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return null;
}


