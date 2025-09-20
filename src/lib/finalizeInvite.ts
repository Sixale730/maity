export async function finalizeInvite(accessToken: string) {
    const isLocal = location.hostname === "localhost";
    const API_BASE =
      (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
      (isLocal ? "http://localhost:8080" : ""); // "" = same-origin en prod
  
    try {
      const res = await fetch(`${API_BASE}/api/finalize-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
  
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
  
      if (res.ok && data?.success && data?.redirect) {
        window.location.href = data.redirect;
        return { ok: true, redirected: true, data };
      }
      return { ok: res.ok, redirected: false, status: res.status, body: text };
    } catch (e) {
      return { ok: false, redirected: false, error: e };
    }
  }
  