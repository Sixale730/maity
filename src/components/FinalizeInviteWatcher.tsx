import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { finalizeInvite } from "@/lib/finalizeInvite";

export default function FinalizeInviteWatcher() {
  const ran = useRef(false);

  useEffect(() => {
    // 1) Si ya hay sesión al montar, intenta una sola vez
    void (async () => {
      if (ran.current) return;
      ran.current = true;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await finalizeInvite(session.access_token);
      }
    })();

    // 2) Cuando se inicie sesión, vuelve a intentar
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === "SIGNED_IN" && sess?.access_token) {
        await finalizeInvite(sess.access_token);
      }
    });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return null; // no renderiza nada
}
