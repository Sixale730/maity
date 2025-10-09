import { Language, translations, getTranslation } from '../constants/translations';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Storage abstraction for both web and mobile
export interface LanguageStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
}

export class LanguageManager {
  private language: Language = 'es';
  private storage: LanguageStorage | null = null;
  private listeners: Set<(language: Language) => void> = new Set();

  constructor(storage?: LanguageStorage) {
    this.storage = storage || null;
  }

  async initialize(): Promise<Language> {
    if (this.storage) {
      try {
        const savedLanguage = await this.storage.getItem('language');
        if (savedLanguage === 'es' || savedLanguage === 'en') {
          this.language = savedLanguage;
        }
      } catch (error) {
        console.error('Error loading language from storage:', error);
      }
    }
    return this.language;
  }

  getLanguage(): Language {
    return this.language;
  }

  async setLanguage(lang: Language): Promise<void> {
    this.language = lang;

    if (this.storage) {
      try {
        await this.storage.setItem('language', lang);
      } catch (error) {
        console.error('Error saving language to storage:', error);
      }
    }

    // Notify all listeners
    this.listeners.forEach(listener => listener(lang));
  }

  translate(key: string): string {
    return getTranslation(this.language, key);
  }

  subscribe(listener: (language: Language) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Hook-like function that can be used in both web and mobile
export function useLanguageManager(manager: LanguageManager) {
  return {
    language: manager.getLanguage(),
    setLanguage: (lang: Language) => manager.setLanguage(lang),
    t: (key: string) => manager.translate(key),
  };
}