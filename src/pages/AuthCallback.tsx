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
      const raw = url.searchParams.get("invite") ?? "";
      const invite = decodeURIComponent(raw).trim();

      if (invite.length > 0) {
        const { error } = await supabase.rpc("accept_invite", { p_invite_token: invite });
        if (error) console.error("[accept_invite]", error);
      }

      const { data, error } = await supabase.rpc("my_phase");
      if (error) {
        console.error("[AuthCb] my_phase error:", error);
        if (!cancelled && location.pathname !== "/auth") {
          navigate("/auth", { replace: true });
        }
        return;
      }

      const rawPhase =
        typeof data === "string"
          ? data
          : (data as any)?.phase ??
            (Array.isArray(data) ? (data[0] as any)?.phase : undefined);

      const phase = String(rawPhase || "").toUpperCase();

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

