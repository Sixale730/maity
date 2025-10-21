interface FinalizeInviteResponse {
  success?: boolean;
  redirect?: string;
  message?: string;
}

interface FinalizeInviteResult {
  ok: boolean;
  redirected: boolean;
  data?: FinalizeInviteResponse;
  status?: number;
  body?: string;
  error?: unknown;
}

function getEnvValue(key: string): string | undefined {
  // Check if we're in Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key];
  }

  // Fallback for Node.js environments (API/Server)
  if (typeof process !== 'undefined' && process.env) {
    return (process.env as any)[key];
  }

  return undefined;
}

export async function finalizeInvite(accessToken: string): Promise<FinalizeInviteResult> {
    const isLocal = typeof location !== 'undefined' && location.hostname === "localhost";
    const envApiUrl = getEnvValue('VITE_API_URL');
    const API_BASE =
      (envApiUrl && envApiUrl.trim()) ||
      (isLocal ? "http://localhost:8080" : ""); // "" = same-origin en prod

    try {
      const res = await fetch(`${API_BASE}/api/finalize-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      const text = await res.text();
      let data: FinalizeInviteResponse | null = null;
      try {
        data = JSON.parse(text) as FinalizeInviteResponse;
      } catch {
        // Ignore parse errors
      }

      if (res.ok && data?.success && data?.redirect) {
        window.location.href = data.redirect;
        return { ok: true, redirected: true, data };
      }
      return { ok: res.ok, redirected: false, status: res.status, body: text };
    } catch (e) {
      return { ok: false, redirected: false, error: e };
    }
  }
  