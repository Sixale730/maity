import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Espera sesión real
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // opcional: intenta otra vez con onAuthStateChange

      // 2) (Opcional) Acepta invitación si viene en la URL o storage
      const url = new URL(window.location.href);
      const invite = url.searchParams.get('invite') ?? localStorage.getItem('inviteToken');
      if (invite) {
        await supabase.rpc('accept_invite', { p_invite_token: invite }).catch(console.error);
      }

      // 3) Obtén status de forma robusta
      const { data, error } = await supabase.rpc('my_status');
      if (error) { console.error('[AuthCb] my_status error:', error); return; }

      const raw =
        typeof data === 'string'
          ? data
          : (data as any)?.status ??
            (Array.isArray(data) ? (data[0] as any)?.status : undefined);

      const status = String(raw || '').toUpperCase();

      localStorage.removeItem('inviteToken');
      sessionStorage.removeItem('inviteToken');
      localStorage.removeItem('companyId');
      if (cancelled) return;

      // 4) Decide destino final UNA sola vez
      const targetPath = status === 'ACTIVE' ? '/dashboard' : '/pending';
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  return <p>Procesando inicio de sesión…</p>;
}






