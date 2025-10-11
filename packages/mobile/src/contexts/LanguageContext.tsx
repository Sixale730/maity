import React, { createContext, useContext, useState } from 'react';

// Temporary types until we restore full functionality
type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// Create context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Provider component (simplified version)
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    // Temporary placeholder - just return the key
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};