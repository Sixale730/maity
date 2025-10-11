import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.dashboard': 'Inicio',
    'nav.roleplay': 'Práctica',
    'nav.coach': 'Coach',
    'nav.sessions': 'Sesiones',
    'nav.profile': 'Mi Perfil',
    'nav.language': 'Idioma',
    'nav.notifications': 'Notificaciones',
    'nav.helpCenter': 'Centro de Ayuda',
    'nav.terms': 'Términos y Condiciones',
    'nav.privacy': 'Política de Privacidad',
    'nav.logout': 'Cerrar Sesión',
    'nav.version': 'Versión',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.comingSoon': 'Próximamente',
    'common.underConstructionDesc': 'Estamos trabajando en esta funcionalidad. ¡Pronto estará disponible!',

    // Dashboard
    'dashboard.user.description': 'Bienvenido a tu panel',
    'dashboard.user.sessions_completed': 'Sesiones completadas',
    'dashboard.user.attendance_rate': 'Asistencia',
    'dashboard.user.upcoming': 'Próximas Sesiones',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Home',
    'nav.roleplay': 'Practice',
    'nav.coach': 'Coach',
    'nav.sessions': 'Sessions',
    'nav.profile': 'My Profile',
    'nav.language': 'Language',
    'nav.notifications': 'Notifications',
    'nav.helpCenter': 'Help Center',
    'nav.terms': 'Terms and Conditions',
    'nav.privacy': 'Privacy Policy',
    'nav.logout': 'Logout',
    'nav.version': 'Version',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.comingSoon': 'Coming Soon',
    'common.underConstructionDesc': 'We are working on this feature. It will be available soon!',

    // Dashboard
    'dashboard.user.description': 'Welcome to your dashboard',
    'dashboard.user.sessions_completed': 'Sessions completed',
    'dashboard.user.attendance_rate': 'Attendance',
    'dashboard.user.upcoming': 'Upcoming Sessions',
  },
};

// Create context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
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