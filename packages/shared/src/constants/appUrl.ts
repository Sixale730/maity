function getEnvValue(key: string): string | undefined {
  // For React Native: convert VITE_ prefix to EXPO_PUBLIC_
  const expoKey = key.replace('VITE_', 'EXPO_PUBLIC_');

  // Try process.env first (works in both Vite and React Native)
  return process.env[key] || process.env[expoKey];
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
