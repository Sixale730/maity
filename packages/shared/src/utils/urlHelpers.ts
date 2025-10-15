const FALLBACK_ORIGIN = "http://localhost:8080";
const CANONICAL_ORIGIN = "https://www.maity.com.mx";

export const resolveBaseOrigin = (appUrl?: string): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  if (appUrl) {
    try {
      return new URL(appUrl).origin;
    } catch (error) {
      console.warn('[urlHelpers] No se pudo parsear appUrl', { appUrl, error });
    }
  }

  return FALLBACK_ORIGIN;
};

export const rebaseUrlToOrigin = (
  target: string | null | undefined,
  baseOrigin: string,
  fallback: string,
  modify?: (url: URL) => void,
): string => {
  const fallbackUrl = normalizeFallback(fallback, baseOrigin);
  const candidates: string[] = [];

  if (typeof target === 'string' && target.length > 0) {
    candidates.push(target);
    try {
      const decoded = decodeURIComponent(target);
      if (decoded !== target) {
        candidates.unshift(decoded);
      }
    } catch (error) {
      console.warn('[urlHelpers] No se pudo decodificar returnTo', { target, error });
    }
  }

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate, baseOrigin);
      const localUrl = parsed.origin === baseOrigin
        ? parsed
        : new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, baseOrigin);

      if (parsed.origin !== baseOrigin) {
        console.warn('[urlHelpers] Reescribiendo origen remoto a local', {
          from: parsed.origin,
          to: baseOrigin,
          candidate,
        });
      }

      if (modify) {
        modify(localUrl);
      }

      return localUrl.toString();
    } catch (error) {
      console.warn('[urlHelpers] No se pudo parsear candidato', { candidate, error });
    }
  }

  const fallbackUrlObj = new URL(fallbackUrl);
  if (modify) {
    modify(fallbackUrlObj);
  }
  return fallbackUrlObj.toString();
};

const normalizeFallback = (fallback: string, baseOrigin: string) => {
  try {
    const url = new URL(fallback, baseOrigin);
    return url.toString();
  } catch (error) {
    console.warn('[urlHelpers] Fallback invalido, usando origen base', { fallback, baseOrigin, error });
    return new URL('/', baseOrigin).toString();
  }
};

export const isCanonicalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === CANONICAL_ORIGIN;
  } catch (error) {
    console.warn('[urlHelpers] URL inválida para validación canónica', { url, error });
    return false;
  }
};

export const toCanonicalUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return `${CANONICAL_ORIGIN}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch (error) {
    console.warn('[urlHelpers] No se pudo convertir a URL canónica', { url, error });
    return CANONICAL_ORIGIN;
  }
};

export const getCanonicalOrigin = (): string => {
  return CANONICAL_ORIGIN;
};
