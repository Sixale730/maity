import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      try {
        const href = window.location.href;
        let { data: { session } } = await supabase.auth.getSession();

        const hasCode = new URL(href).searchParams.has("code");
        if (!session && hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          session = data.session ?? null;
        }
        if (!session) throw new Error("No session after callback");

        // Limpia y manda a donde corresponda; el watcher hará finalize-invite
        const url = new URL(href);
        const returnTo = url.searchParams.get("returnTo") || "/dashboard";
        window.history.replaceState({}, "", "/auth/callback");
        navigate(returnTo.startsWith("/") ? returnTo : "/dashboard", { replace: true });
      } catch {
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesión…</p>;
}
