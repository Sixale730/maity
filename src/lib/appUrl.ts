export const getAppUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL as string | undefined;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  return '';
};
