import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Navigation
    'nav.features': 'Características',
    'nav.success_cases': 'Casos de Éxito',
    'nav.login': 'Iniciar Sesión',
    'nav.start_free': 'Empezar Gratis',
    'nav.navigation': 'Navegación',
    'nav.logout': 'Cerrar Sesión',
    
    // Hero Section
    'hero.badge': 'IA · Mentoría · Crecimiento Diario',
    'hero.title_part1': 'no te entrena para un curso.',
    'hero.title_part2': 'Te transforma para siempre.',
    'hero.description': 'Tu mentora de inteligencia artificial que impulsa la evolución y el crecimiento diario de equipos en el sector de TI. Una experiencia retadora, emocionalmente inteligente y visionaria.',
    'hero.start_evolution': 'Comenzar tu Evolución',
    'hero.watch_demo': 'Ver Demo',
    
    // Features Section
    'features.title': '¿Cómo funciona',
    'features.description': 'Una plataforma completa que combina inteligencia artificial, gamificación y mentoría personalizada para acelerar el crecimiento de tu equipo.',
    'features.dashboard.title': 'Dashboard Personalizado',
    'features.dashboard.description': 'Visualiza métricas de progreso, sesiones completadas y racha de días activos en tiempo real.',
    'features.workplan.title': 'Plan de Trabajo Visual',
    'features.workplan.description': 'Rutas de aprendizaje personalizadas con módulos y objetivos claros en formato interactivo.',
    'features.achievements.title': 'Sistema de Logros',
    'features.achievements.description': 'Insignias, XP y leaderboards que motivan la constancia y celebran cada hito alcanzado.',
    'features.calendar.title': 'Calendario Inteligente',
    'features.calendar.description': 'Sesiones de mentoría sincronizadas con Google Calendar y Outlook para una organización perfecta.',
    
    // Benefits Section
    'benefits.title': 'Más que una herramienta, un compañero de crecimiento',
    'benefits.description': 'no es solo tecnología. Es una experiencia diseñada para crear conexiones humanas auténticas mientras potencia el desarrollo profesional de cada miembro de tu equipo.',
    'benefits.mentoring': 'Mentoría personalizada basada en IA avanzada',
    'benefits.integration': 'Integración perfecta con herramientas existentes',
    'benefits.automation': 'Automatización inteligente de flujos de trabajo',
    'benefits.metrics': 'Métricas claras de progreso y ROI',
    'benefits.humanity.title': 'Humanidad Aumentada',
    'benefits.humanity.description': 'Tecnología que potencia la conexión humana, no que la reemplaza. Cada interacción está diseñada para ser auténtica, retadora y transformadora.',
    
    // Testimonials
    'testimonials.title': 'Lo que dicen nuestros usuarios',
    'testimonials.subtitle': 'Líderes de TI que ya están transformando sus equipos con',
    'testimonials.carlos.content': 'La plataforma ha revolucionado cómo desarrollamos talento en nuestro equipo. Los resultados son medibles y el engagement ha aumentado un 300%.',
    'testimonials.ana.content': 'La gamificación realmente funciona. Nuestros desarrolladores están más motivados y las habilidades blandas han mejorado significativamente.',
    'testimonials.roberto.content': 'La automatización de la plataforma nos ahorra 10 horas semanales en gestión de equipo, permitiéndonos enfocarnos en lo que realmente importa.',
    
    // CTA Section
    'cta.title': '¿Listo para transformar tu equipo?',
    'cta.description': 'Únete a cientos de líderes de TI que ya están viendo resultados reales. Comienza tu prueba gratuita hoy y descubre el potencial de tu equipo.',
    'cta.start_trial': 'Iniciar Prueba Gratuita',
    'cta.schedule_demo': 'Agendar Demo',
    
    // Footer
    'footer.copyright': 'Transformando el futuro del aprendizaje en TI.',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.loading': 'Cargando dashboard...',
    'dashboard.home': 'Dashboard',
    'dashboard.org.title': 'Dashboard de Mi Organización',
    'dashboard.org.description': 'Vista de tu equipo y progreso organizacional',
    'dashboard.stats.team_sessions': 'Sesiones del Equipo',
    'dashboard.stats.organization_total': 'Total de la organización',
    'dashboard.stats.active': 'Activas',
    'dashboard.stats.in_progress': 'En progreso o programadas',
    'dashboard.stats.performance': 'Rendimiento',
    'dashboard.stats.completion_rate': 'Tasa de completado del equipo',
    'dashboard.stats.team_wellbeing': 'Bienestar del Equipo',
    'dashboard.stats.average_mood': 'Humor promedio',
    'dashboard.analytics': 'Analytics',
    'dashboard.reports': 'Reports',
    'dashboard.trends': 'Trends',
    'dashboard.users': 'Usuarios',
    'dashboard.plans': 'Planes',
    'dashboard.settings': 'Settings',
    'dashboard.team.title': 'Mi Equipo',
    'dashboard.team.description': 'Gestiona y administra los miembros de tu equipo',
    'dashboard.team.upload_csv': 'Cargar Usuarios desde CSV',
    'dashboard.team.upload_description': 'Importa múltiples usuarios a tu equipo utilizando un archivo CSV',
    'dashboard.team.download_template': 'Descargar Plantilla',
    'dashboard.team.processing': 'Procesando archivo CSV...',
    'dashboard.team.results_title': 'Resultados de la Carga',
    'dashboard.team.successful': 'Exitosos',
    'dashboard.team.failed': 'Fallidos',
    'dashboard.team.total': 'Total',
    'dashboard.team.errors': 'Errores',
    'dashboard.team.format_required': 'Formato requerido',
    'dashboard.team.members': 'Miembros del Equipo',
    'dashboard.team.members_description': 'Lista de todos los miembros de tu equipo y su estado actual',
    'dashboard.team.name': 'Nombre',
    'dashboard.team.email': 'Email',
    'dashboard.team.role': 'Rol',
    'dashboard.team.status': 'Estado',
    'dashboard.team.join_date': 'Fecha de Ingreso',
    'dashboard.team.status_active': 'Activo',
    'dashboard.team.status_pending': 'Pendiente',
    'dashboard.team.status_suspended': 'Suspendido',
    'dashboard.team.upload_success': 'Carga completada',
    'dashboard.team.upload_error': 'Error en la carga',
    'dashboard.team.template_downloaded': 'Plantilla descargada',
    'dashboard.team.csv_error': 'Por favor selecciona un archivo CSV válido',
  },
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.success_cases': 'Success Cases',
    'nav.login': 'Login',
    'nav.start_free': 'Start Free',
    'nav.navigation': 'Navigation',
    'nav.logout': 'Logout',
    
    // Hero Section
    'hero.badge': 'AI · Mentoring · Daily Growth',
    'hero.title_part1': 'doesn\'t train you for a course.',
    'hero.title_part2': 'It transforms you forever.',
    'hero.description': 'Your artificial intelligence mentor that drives the evolution and daily growth of IT teams. A challenging, emotionally intelligent and visionary experience.',
    'hero.start_evolution': 'Start Your Evolution',
    'hero.watch_demo': 'Watch Demo',
    
    // Features Section
    'features.title': 'How does',
    'features.description': 'A complete platform that combines artificial intelligence, gamification and personalized mentoring to accelerate your team\'s growth.',
    'features.dashboard.title': 'Personalized Dashboard',
    'features.dashboard.description': 'Visualize progress metrics, completed sessions and active day streaks in real time.',
    'features.workplan.title': 'Visual Work Plan',
    'features.workplan.description': 'Personalized learning paths with clear modules and objectives in interactive format.',
    'features.achievements.title': 'Achievement System',
    'features.achievements.description': 'Badges, XP and leaderboards that motivate consistency and celebrate every milestone achieved.',
    'features.calendar.title': 'Smart Calendar',
    'features.calendar.description': 'Mentoring sessions synchronized with Google Calendar and Outlook for perfect organization.',
    
    // Benefits Section
    'benefits.title': 'More than a tool, a growth companion',
    'benefits.description': 'is not just technology. It\'s an experience designed to create authentic human connections while enhancing the professional development of each team member.',
    'benefits.mentoring': 'Personalized mentoring based on advanced AI',
    'benefits.integration': 'Perfect integration with existing tools',
    'benefits.automation': 'Intelligent workflow automation',
    'benefits.metrics': 'Clear progress and ROI metrics',
    'benefits.humanity.title': 'Augmented Humanity',
    'benefits.humanity.description': 'Technology that enhances human connection, doesn\'t replace it. Every interaction is designed to be authentic, challenging and transformative.',
    
    // Testimonials
    'testimonials.title': 'What our users say',
    'testimonials.subtitle': 'IT leaders who are already transforming their teams with',
    'testimonials.carlos.content': 'The platform has revolutionized how we develop talent in our team. Results are measurable and engagement has increased by 300%.',
    'testimonials.ana.content': 'Gamification really works. Our developers are more motivated and soft skills have improved significantly.',
    'testimonials.roberto.content': 'The platform\'s automation saves us 10 hours weekly in team management, allowing us to focus on what really matters.',
    
    // CTA Section
    'cta.title': 'Ready to transform your team?',
    'cta.description': 'Join hundreds of IT leaders who are already seeing real results. Start your free trial today and discover your team\'s potential.',
    'cta.start_trial': 'Start Free Trial',
    'cta.schedule_demo': 'Schedule Demo',
    
    // Footer
    'footer.copyright': 'Transforming the future of IT learning.',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.loading': 'Loading dashboard...',
    'dashboard.home': 'Dashboard',
    'dashboard.org.title': 'My Organization Dashboard',
    'dashboard.org.description': 'View your team and organizational progress',
    'dashboard.stats.team_sessions': 'Team Sessions',
    'dashboard.stats.organization_total': 'Organization total',
    'dashboard.stats.active': 'Active',
    'dashboard.stats.in_progress': 'In progress or scheduled',
    'dashboard.stats.performance': 'Performance',
    'dashboard.stats.completion_rate': 'Team completion rate',
    'dashboard.stats.team_wellbeing': 'Team Wellbeing',
    'dashboard.stats.average_mood': 'Average mood',
    'dashboard.analytics': 'Analytics',
    'dashboard.reports': 'Reports',
    'dashboard.trends': 'Trends',
    'dashboard.users': 'Users',
    'dashboard.plans': 'Plans',
    'dashboard.settings': 'Settings',
    'dashboard.team.title': 'My Team',
    'dashboard.team.description': 'Manage and administer your team members',
    'dashboard.team.upload_csv': 'Upload Users from CSV',
    'dashboard.team.upload_description': 'Import multiple users to your team using a CSV file',
    'dashboard.team.download_template': 'Download Template',
    'dashboard.team.processing': 'Processing CSV file...',
    'dashboard.team.results_title': 'Upload Results',
    'dashboard.team.successful': 'Successful',
    'dashboard.team.failed': 'Failed',
    'dashboard.team.total': 'Total',
    'dashboard.team.errors': 'Errors',
    'dashboard.team.format_required': 'Required format',
    'dashboard.team.members': 'Team Members',
    'dashboard.team.members_description': 'List of all your team members and their current status',
    'dashboard.team.name': 'Name',
    'dashboard.team.email': 'Email',
    'dashboard.team.role': 'Role',
    'dashboard.team.status': 'Status',
    'dashboard.team.join_date': 'Join Date',
    'dashboard.team.status_active': 'Active',
    'dashboard.team.status_pending': 'Pending',
    'dashboard.team.status_suspended': 'Suspended',
    'dashboard.team.upload_success': 'Upload completed',
    'dashboard.team.upload_error': 'Upload error',
    'dashboard.team.template_downloaded': 'Template downloaded',
    'dashboard.team.csv_error': 'Please select a valid CSV file',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};