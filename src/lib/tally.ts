    // src/lib/tally.ts
export type HiddenFields = Partial<{
    auth_id: string;       // OBLIGATORIO (lo usará el webhook)
    otk: string;           // OBLIGATORIO (token de una sola vez)
    company_id: string;    // opcional, informativo
    company_name: string;  // opcional, informativo
    email: string;         // opcional, informativo
  }>;
  
  /**
   * Construye el URL del iframe de Tally y agrega hidden fields.
   * Es una función pura: no toca window, ni document, ni lee envs aquí.
   */
  export function buildTallyEmbedUrl(
    formId: string,
    hidden: HiddenFields,
    opts?: { redirectTo?: string }
  ): string {
    const u = new URL(`https://tally.so/embed/${formId}`);
    u.searchParams.set("hideTitle", "1");
    u.searchParams.set("transparentBackground", "1");
  
    for (const [k, v] of Object.entries(hidden)) {
      if (typeof v === "string" && v.trim() !== "") {
        u.searchParams.set(k, v);
      }
    }
  
    if (opts?.redirectTo) u.searchParams.set("redirectTo", opts.redirectTo);
    return u.toString();
  }  