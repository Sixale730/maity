import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const href = window.location.href;

      try {
        // 1) Obtener sesión actual (o intercambiar el code del callback)
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

        // 2) Preparar base URL del backend (con fallback a prod)
        const API_BASE =
          (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
          "https://maity.com.mx";

        // 3) Intentar finalizar invite (si hay cookie invite_token, el server la leerá)
        try {
          // Logs útiles para depurar en consola del navegador
          console.log("[callback] VITE_API_URL =", import.meta.env.VITE_API_URL);
          console.log("[callback] calling:", `${API_BASE}/api/finalize-invite`);
          console.log(
            "[callback] invite cookie present on document?",
            document.cookie.includes("invite_token")
          );

          const res = await fetch(`${API_BASE}/api/finalize-invite`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include", // imprescindible para que viaje la cookie
          });

          const text = await res.text();
          console.log("[callback] finalize-invite status:", res.status, "body:", text);

          if (res.ok) {
            // Refrescar la sesión por si tu guard lee algo inmediatamente
            await supabase.auth.refreshSession();

            // Parsear JSON de respuesta
            let data: any = null;
            try {
              data = JSON.parse(text);
            } catch {
              // si no es JSON válido, sigue flujo normal
            }

            if (data?.success && data?.redirect) {
              window.location.href = data.redirect; // /admin/dashboard o /app/dashboard
              return; // IMPORTANT: corta aquí para no seguir al flujo normal
            }
          }
        } catch (inviteError) {
          console.log("[callback] No invite o fallo al procesarlo:", inviteError);
          // continúa con el flujo normal
        }

        // 4) Flujo normal (si no hay invite o ya se usó)
        const url = new URL(href);
        const returnTo = url.searchParams.get("returnTo") || "/dashboard";

        // Limpia la URL (quita query params de OAuth)
        window.history.replaceState({}, "", "/auth/callback");

        navigate(returnTo.startsWith("/") ? returnTo : "/dashboard", { replace: true });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[callback] auth error:", err);
        }
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesión...</p>;
}