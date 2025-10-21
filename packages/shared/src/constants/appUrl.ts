function getEnvValue(key: string): string | undefined {
  // Check if we're in Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key];
  }

  // Fallback for React Native or Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    const expoKey = key.replace('VITE_', 'EXPO_PUBLIC_');
    return (process.env as any)[key] || (process.env as any)[expoKey];
  }

  return undefined;
}

export const getAppUrl = (): string => {
  const envUrl = getEnvValue('VITE_APP_URL');
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  return '';
};
