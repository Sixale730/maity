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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { hasRoutedRef.current = true; navigate("/auth", { replace: true }); return; }

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

      // 3) Decidir por fase
      const { data, error } = await supabase.rpc("my_phase");
      if (error) { console.error("[AuthCb] my_phase error:", error); hasRoutedRef.current = true; navigate("/auth", { replace: true }); return; }

      const phase =
        typeof data === "string"
          ? data.toUpperCase()
          : String((data as any)?.phase ?? (Array.isArray(data) ? (data[0] as any)?.phase : "")).toUpperCase();

      hasRoutedRef.current = true;
      if (phase === "ACTIVE") { navigate("/dashboard", { replace: true }); return; }
      if (phase === "REGISTRATION") { navigate("/registration", { replace: true }); return; }
      // NO_COMPANY (u otro) ? pending
      navigate("/pending", { replace: true });
    })();
  }, [navigate]);

  return <p>Procesando inicio de sesi?n.</p>;
}

