// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      const href = window.location.href;

      try {
        // 1) Sesión actual o intercambio de code -> session
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

        // 2) Base URL del backend
        const API_BASE =
          (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
          (location.hostname === "localhost"
            ? "http://localhost:8080"
            : "https://api.maity.com.mx");

        // 3) Intentar finalizar el invite (si hay cookie invite_token, el server la leerá)
        try {
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
            // MUY IMPORTANTE: para que viaje la cookie invite_token al subdominio API
            credentials: "include",
          });

          const text = await res.text();
          console.log("[callback] finalize-invite status:", res.status, "body:", text);

          if (res.ok) {
            // Refrescamos sesión por si tu guard consulta cambios inmediatos
            await supabase.auth.refreshSession();

            // Si el server manda un redirect, obedécelo
            try {
              const data = JSON.parse(text);
              if (data?.success && data?.redirect) {
                window.location.href = data.redirect;
                return; // cortamos aquí
              }
            } catch {
              // si no es JSON, seguimos flujo normal
            }
          }
        } catch (inviteError) {
          console.warn("[callback] No invite o fallo al procesarlo:", inviteError);
        }

        // 4) Flujo normal (sin invite o ya usado)
        const url = new URL(href);
        const returnTo = url.searchParams.get("returnTo") || "/dashboard";

        // Limpia la URL del callback
        window.history.replaceState({}, "", "/auth/callback");

        navigate(returnTo.startsWith("/") ? returnTo : "/dashboard", { replace: true });
      } catch (err) {
        console.error("[callback] auth error:", err);
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesión...</p>;
}