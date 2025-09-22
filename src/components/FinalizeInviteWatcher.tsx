import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { finalizeInvite } from "@/lib/finalizeInvite";

/**
 * Dispara finalize-invite UNA sola vez por sesión:
 * - Al montar (si ya hay sesión)
 * - Al recibir SIGNED_IN
 * Con ventanas anti-duplicado y guardas en sessionStorage.
 */
export default function FinalizeInviteWatcher() {
  const inFlight = useRef(false);
  const lastRunAt = useRef(0);

  // evita ráfagas (montaje + SIGNED_IN casi simultáneo)
  const TRY_WINDOW_MS = 3000;

  const tryOnce = async () => {
    if (inFlight.current) return;
    const now = Date.now();
    if (now - lastRunAt.current < TRY_WINDOW_MS) return; // debouncing
    lastRunAt.current = now;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    // Solo ejecutar si hay un invite token en la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const inviteFromUrl = urlParams.get('invite');
    const inviteFromStorage = localStorage.getItem('inviteToken');

    if (!inviteFromUrl && !inviteFromStorage) {
      console.log("[FinalizeInviteWatcher] No invite token found, skipping");
      return;
    }

    // De-dupe por sesión (id de usuario + expiración de la sesión)
    const key = `invfin:${session.user.id}:${session.expires_at}`;
    if (sessionStorage.getItem(key) === "1") return;

    inFlight.current = true;
    try {
      console.log("[FinalizeInviteWatcher] Processing invite token");
      const r = await finalizeInvite(session.access_token);
      // Marcamos como hecho independientemente del resultado, para no spamear.
      // (El endpoint es idempotente; si vuelves a usar un link más tarde, será otra sesión o se refrescará el token.)
      sessionStorage.setItem(key, "1");
      if (!r.ok && !r.redirected) {
        console.warn("[FinalizeInviteWatcher] finalize-invite no completó:", r);
      }
    } finally {
      inFlight.current = false;
    }
  };

  useEffect(() => {
    // 1) Si ya hay sesión al montar, intenta una vez
    void tryOnce();

    // 2) Cuando cambie el estado a SIGNED_IN, intenta otra vez (si aplica)
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") await tryOnce();
    });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return null;
}