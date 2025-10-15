// Company ID persistence utilities for AC-1
export const COMPANY_ID_KEY = 'maity_company_id';
export const COMPANY_ID_COOKIE = 'maity_company_id';

// AC-1: Persist company_id in both localStorage and cookie
export const persistCompanyId = (companyId: string): void => {
  console.log(`[AC-1] company_id persistido (cookie + localStorage): ${companyId}`);
  
  // Save to localStorage
  localStorage.setItem(COMPANY_ID_KEY, companyId);
  
  // Save to cookie (expires in 24 hours)
  const expires = new Date();
  expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
  document.cookie = `${COMPANY_ID_COOKIE}=${companyId}; expires=${expires.toUTCString()}; path=/`;
};

// Get company_id from localStorage or cookie
export const getPersistedCompanyId = (): string | null => {
  // Try localStorage first
  const fromStorage = localStorage.getItem(COMPANY_ID_KEY);
  if (fromStorage) return fromStorage;
  
  // Try cookie as fallback
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COMPANY_ID_COOKIE) {
      return value;
    }
  }
  
  return null;
};

// Clear persisted company_id
export const clearPersistedCompanyId = (): void => {
  localStorage.removeItem(COMPANY_ID_KEY);
  document.cookie = `${COMPANY_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// AC-1: Validate UUID format
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};