import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/lib/env";
import { MaityLogo } from "@/components/MaityLogo";

// Helper function to call finalize-invite API
const finalizeInvite = async (accessToken: string) => {
  const response = await fetch(`${env.apiUrl}/api/finalize-invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'UNKNOWN_ERROR' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

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
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("[AuthCb] exchangeCodeForSession error:", exchangeError);
          hasRoutedRef.current = true;
          navigate("/auth", { replace: true });
          return;
        }
      }

      // Pequeño delay para asegurar que la sesión esté completamente establecida
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session } } = await supabase.auth.getSession();
      console.log("[AuthCb] Session found:", !!session, session?.user?.email);

      if (!session) {
        console.error("[AuthCb] No session found after exchange");
        hasRoutedRef.current = true;
        navigate("/auth", { replace: true });
        return;
      }

      // Ensure user exists in the database
      await supabase.rpc('ensure_user');

      // 1) Procesar invitación via API (si hay cookie)
      console.log("[AuthCb] Checking for invite cookie...");

      try {
        const result = await finalizeInvite(session.access_token);
        console.log("[AuthCb] Finalize invite result:", result);

        if (result.success && result.note !== 'NO_INVITE_COOKIE') {
          console.log("[AuthCb] User linked to company:", {
            company_id: result.company_id,
            role_assigned: result.role_assigned
          });
        } else {
          console.log("[AuthCb] No invite to process");
        }
      } catch (error) {
        console.error("[AuthCb] Finalize invite error:", error);
        // No redirigir por error de invite, continuar con el flujo normal
      }

      // 2) Limpiar localStorage/sessionStorage (la API ya limpió la cookie)
      localStorage.removeItem("inviteToken");
      sessionStorage.removeItem("inviteToken");
      localStorage.removeItem("companyId");

      // 3) Verificar returnTo antes de decidir por fase
      const returnTo = url.searchParams.get("returnTo");

      // 4) Primero verificar roles
      console.log("[AuthCb] About to call my_roles()");
      const { data: rolesData, error: rolesError } = await supabase.rpc("my_roles");
      console.log("[AuthCb] my_roles() returned:", { rolesData, rolesError });

      if (!rolesError && rolesData && Array.isArray(rolesData)) {
        console.log("[AuthCb] User roles:", rolesData);

        // Si tiene admin o manager, ir directo a dashboard
        if (rolesData.includes('admin') || rolesData.includes('manager')) {
          console.log("[AuthCb] User has admin/manager role - redirecting to dashboard");
          hasRoutedRef.current = true;
          navigate("/dashboard", { replace: true });
          return;
        }
        console.log("[AuthCb] User does not have admin/manager role, continuing to my_phase");
      } else {
        console.log("[AuthCb] my_roles error or no roles:", rolesError);
      }

      // 5) Si no tiene roles admin/manager, verificar fase
      const { data, error } = await supabase.rpc("my_phase");
      if (error) {
        console.error("[AuthCb] my_phase error:", error);
        hasRoutedRef.current = true;
        // Error en my_phase - ir a página de error del estado del usuario
        navigate("/user-status-error", { replace: true });
        return;
      }

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
        console.log("[AuthCb] User is ACTIVE - redirecting to dashboard");
        navigate("/dashboard", { replace: true });
        return;
      }
      if (phase === "REGISTRATION") {
        console.log("[AuthCb] User needs REGISTRATION - redirecting to registration");
        navigate("/registration", { replace: true });
        return;
      }
      if (phase === "NO_COMPANY" || phase === "PENDING") {
        console.log("[AuthCb] User has NO_COMPANY/PENDING - redirecting to pending");
        navigate("/pending", { replace: true });
        return;
      }

      // Estado desconocido
      console.warn("[AuthCb] Unknown phase:", phase);
      navigate("/user-status-error", { replace: true });
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

