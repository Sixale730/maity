import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (location.pathname !== "/auth") {
          navigate("/auth", { replace: true });
        }
        return;
      }

      const url = new URL(window.location.href);
      const invite = url.searchParams.get("invite") ?? localStorage.getItem("inviteToken");
      if (invite) {
        await supabase.rpc("accept_invite", { p_invite_token: invite }).catch(console.error);
      }
      localStorage.removeItem("inviteToken");
      sessionStorage.removeItem("inviteToken");

      const { data, error } = await supabase.rpc("my_phase");
      if (error) {
        console.error("[AuthCb] my_phase error:", error);
        if (!cancelled && location.pathname !== "/auth") {
          navigate("/auth", { replace: true });
        }
        return;
      }

      const raw =
        typeof data === "string"
          ? data
          : (data as any)?.phase ??
            (Array.isArray(data) ? (data[0] as any)?.phase : undefined);

      const phase = String(raw || "").toUpperCase();

      localStorage.removeItem("companyId");
      if (cancelled) return;

      let targetPath = "/auth";
      if (phase === "ACTIVE") {
        targetPath = "/dashboard";
      } else if (phase === "REGISTRATION") {
        targetPath = "/registration";
      } else if (phase === "NO_COMPANY") {
        targetPath = "/pending";
      }

      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  return <p>Procesando inicio de sesión…</p>;
}
