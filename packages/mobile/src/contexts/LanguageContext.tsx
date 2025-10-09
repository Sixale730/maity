import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LanguageManager,
  LanguageContextType,
  Language
} from '@maity/shared';
import { mobileStorage } from '../utils/storage';

// Create the language manager instance
const languageManager = new LanguageManager(mobileStorage);

// Create context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize language from storage
    languageManager.initialize().then((initialLanguage) => {
      setLanguageState(initialLanguage);
      setIsInitialized(true);
    });

    // Subscribe to language changes
    const unsubscribe = languageManager.subscribe((newLanguage) => {
      setLanguageState(newLanguage);
    });

    return unsubscribe;
  }, []);

  const setLanguage = async (lang: Language) => {
    await languageManager.setLanguage(lang);
  };

  const t = (key: string) => {
    return languageManager.translate(key);
  };

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

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