import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const href = window.location.href;

      try {
        // 1. Obtener sesión actual
        let {
          data: { session },
        } = await supabase.auth.getSession();

        // Si no hay sesión todavía pero viene con "code" en URL, intercambiarlo
        const hasCode = new URL(href).searchParams.has("code");
        if (!session && hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          session = data.session ?? null;
        }

        if (!session) throw new Error("No session after callback");

        // 2. Procesar invite (si existe cookie invite_token)
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/finalize-invite`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
              credentials: "include", // 👈 muy importante para que viaje la cookie
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.redirect) {
              window.location.href = data.redirect;
              return;
            }
          }
        } catch (inviteError) {
          console.log("[callback] No invite o fallo al procesarlo:", inviteError);
          // sigue el flujo normal
        }

        // 3. Flujo normal (si no hay invite o ya se usó)
        const url = new URL(href);
        const returnTo = url.searchParams.get("returnTo") || "/dashboard";

        // Limpiar URL (quitar query params)
        window.history.replaceState({}, "", "/auth/callback");

        navigate(returnTo.startsWith("/") ? returnTo : "/dashboard", { replace: true });
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.error("[callback] auth error:", error);
        }
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesión...</p>;
}
