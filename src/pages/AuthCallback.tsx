import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasRoutedRef = useRef(false);

  useEffect(() => {
    if (hasRoutedRef.current) return;

    (async () => {
      const url = new URL(window.location.href);

      const errorDescription = url.searchParams.get("error_description");
      if (errorDescription) {
        console.error("[AuthCb] OAuth error:", errorDescription);
        hasRoutedRef.current = true;
        navigate("/auth", { replace: true });
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession({ code });
        if (exchangeError) {
          console.error("[AuthCb] exchangeCodeForSession error:", exchangeError);
          hasRoutedRef.current = true;
          navigate("/auth", { replace: true });
          return;
        }
      }

      // Pequeño delay para asegurar que la sesión esté completamente establecida
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refrescar la sesión para asegurar que esté válida
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      console.log("[AuthCb] Session after refresh:", !!session, session?.user?.email, sessionError);

      if (!session) {
        console.error("[AuthCb] No session found after refresh");
        hasRoutedRef.current = true;
        navigate("/auth", { replace: true });
        return;
      }

      // 1) Procesar invitaci?n s?lo si existe
      const raw = url.searchParams.get("invite") ?? localStorage.getItem("inviteToken") ?? "";
      const invite = decodeURIComponent(raw).trim();
      if (invite.length > 0) {
        const { error } = await supabase.rpc("accept_invite", { p_invite_token: invite });
        if (error) console.error("[accept_invite]", error);
      }

      // 2) Limpiar siempre
      localStorage.removeItem("inviteToken");
      sessionStorage.removeItem("inviteToken");
      localStorage.removeItem("companyId");

      // 3) Verificar returnTo antes de decidir por fase
      const returnTo = url.searchParams.get("returnTo");

      // 4) Decidir por fase
      const { data, error } = await supabase.rpc("my_phase");
      if (error) { console.error("[AuthCb] my_phase error:", error); hasRoutedRef.current = true; navigate("/auth", { replace: true }); return; }

      const phase =
        typeof data === "string"
          ? data.toUpperCase()
          : String((data as any)?.phase ?? (Array.isArray(data) ? (data[0] as any)?.phase : "")).toUpperCase();

      console.log("[AuthCb] User phase:", phase, "returnTo:", returnTo);

      hasRoutedRef.current = true;

      // Si hay returnTo y el usuario está activo, ir al returnTo
      if (phase === "ACTIVE" && returnTo && returnTo.startsWith('/')) {
        console.log("[AuthCb] Redirecting to returnTo:", returnTo);
        navigate(returnTo, { replace: true });
        return;
      }

      if (phase === "ACTIVE") {
        console.log("[AuthCb] Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
        return;
      }
      if (phase === "REGISTRATION") {
        console.log("[AuthCb] Redirecting to registration");
        navigate("/registration", { replace: true });
        return;
      }
      // NO_COMPANY (u otro) ? pending
      console.log("[AuthCb] Redirecting to pending");
      navigate("/pending", { replace: true });
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesi?n.</p>;
}

