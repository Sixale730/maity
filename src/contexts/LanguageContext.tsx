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
    'cta.description': '�snete a cientos de líderes de TI que ya están viendo resultados reales. Comienza tu prueba gratuita hoy y descubre el potencial de tu equipo.',
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
    // Dashboard User
    'dashboard.user.title': 'My Dashboard',
    'dashboard.user.greeting': 'Hello',
    'dashboard.user.user': 'User',
    'dashboard.user.description': 'Here is your personal coaching progress',
    'dashboard.user.radar_title': '360° Competency Assessment',
    'dashboard.user.radar_description': 'Comparison between your self-assessment and your coach\'s assessment',
    'dashboard.user.my_sessions': 'My Sessions',
    'dashboard.user.upcoming': 'Upcoming',
    'dashboard.user.consistency': 'My Consistency',
    'dashboard.user.wellbeing': 'My Wellbeing',
    'dashboard.user.sessions_completed': 'Sessions completed',
    'dashboard.user.sessions_scheduled': 'Scheduled sessions',
    'dashboard.user.attendance_rate': 'Attendance rate',
    'dashboard.user.average_mood': 'Average mood',
    'dashboard.user.monthly_progress': 'My Monthly Progress',
    'dashboard.user.monthly_description': 'Your evolution in recent months',
    'dashboard.user.sessions_status': 'My Sessions',
    'dashboard.user.status_description': 'Status of your sessions',
    'dashboard.user.weekly_activity': 'My Weekly Activity',
    'dashboard.user.weekly_description': 'Tus sesiones en la última semana',
    'dashboard.user.clarity': 'Claridad (C)',
    'dashboard.user.structure': 'Estructura (E)',  
    'dashboard.user.emotional_alignment': 'Alineación Emocional (A)',
    'dashboard.user.action_influence': 'Acción e Influencia (I)',
    'dashboard.user.my_evaluation': 'Mi Evaluación',
    'dashboard.user.coach_evaluation': 'Evaluación Coach',
    'dashboard.charts.monthly_performance': 'Rendimiento Mensual del Equipo',
    'dashboard.charts.monthly_description': 'Progreso de tu organización por mes',
    'dashboard.charts.team_sessions': 'Sesiones del Equipo',
    'dashboard.charts.completed': 'Completadas',
    'dashboard.charts.team_status': 'Estado del Equipo',
    'dashboard.charts.status_description': 'Distribución de sesiones',
    'dashboard.charts.weekly_activity': 'Actividad Semanal del Equipo',
    'dashboard.charts.weekly_description': 'Sesiones diarias de tu organización',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.coach': 'Coach',
    'nav.roleplay': 'Sala de entrenamiento',
    'nav.first_interview': 'Mi Primera Entrevista',
    'nav.interview_history': 'Historial de Entrevistas',
    'nav.demo': 'Demo',
    'nav.demo_training': 'Demo Entrenamiento',
    'nav.roleplay_progress': 'Mi Progreso',
    'nav.learning_path': 'Ruta de Aprendizaje',
    'nav.team_learning_progress': 'Progreso del Equipo',
    'nav.sessions': 'Historial',
    'nav.analytics': 'Analytics',
    'nav.organizations': 'Organizaciones',
    'nav.users': 'Usuarios',
    'nav.reports': 'Reports',
    'nav.trends': 'Trends',
    'nav.plans': 'Planes',
    'nav.documents': 'Documentos',
    'nav.settings': 'Ajustes',
    'nav.my_team': 'Mi Equipo',
    'nav.plan': 'Plan',
    'nav.achievements': 'Logros',
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

    // Coach
    'coach.title': 'Coach IA',
    'coach.subtitle': 'Tu mentor personal para crecimiento profesional',
    'coach.ai_coach': 'Coach de Inteligencia Artificial',
    'coach.description': 'Conversa con tu coach personal powered by AI para obtener mentoría personalizada',
    'coach.status.ready': 'Listo para conversar',
    'coach.status.connecting': 'Conectando...',
    'coach.status.listening': 'Escuchando...',
    'coach.status.thinking': 'Procesando...',
    'coach.status.speaking': 'Respondiendo...',
    'coach.start_listening': 'Iniciar Conversación',
    'coach.stop_listening': 'Detener',
    'coach.mute': 'Silenciar',
    'coach.unmute': 'Activar Audio',
    'coach.instructions': 'Escribe tu consulta y obtén coaching personalizado en tiempo real',
    'coach.error.no_api_key': 'Modo demo - La integración completa de voz requiere configuración',
    'coach.new_conversation': 'Nueva Conversación',
    'coach.voice_mode': 'Modo Voz (Próximamente)',
    'coach.placeholder': 'Escribe tu consulta de coaching...',
    'coach.thinking': 'Tu coach está pensando...',
    'coach.specialties': 'Tu coach inteligente está listo para ayudarte con liderazgo, productividad y desarrollo profesional',

    // AI Resources
    'nav.ai_resources': 'Recursos Educativos IA',
    'ai_resources.title': 'Recursos Educativos IA',
    'ai_resources.description': 'Recursos de inteligencia artificial para capacitación',
    'ai_resources.open_resource': 'Abrir Recurso',
    'ai_resources.add_resource': 'Agregar Recurso',
    'ai_resources.add_title': 'Nuevo Recurso Educativo',
    'ai_resources.form.title': 'Título',
    'ai_resources.form.title_placeholder': 'Nombre del recurso',
    'ai_resources.form.description': 'Descripción',
    'ai_resources.form.description_placeholder': 'Breve descripción del recurso',
    'ai_resources.form.url': 'URL del Recurso',
    'ai_resources.form.url_placeholder': 'https://ejemplo.com',
    'ai_resources.form.icon': 'Icono',
    'ai_resources.form.color': 'Color',
    'ai_resources.form.submit': 'Guardar Recurso',
    'ai_resources.form.cancel': 'Cancelar',
    'ai_resources.success': 'Recurso agregado correctamente',
    'ai_resources.error': 'Error al agregar recurso',
    'ai_resources.loading': 'Cargando recursos...',
    'ai_resources.empty': 'No hay recursos disponibles',

    // Avatar Showcase
    'nav.avatar_showcase': 'Comparativa Avatares',
    'avatar_showcase.title': 'Comparativa de Avatares Voxel',
    'avatar_showcase.description': 'Compara diferentes enfoques para renderizar avatares 3D estilo voxel',
  },
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.success_cases': 'Success Cases',
    'nav.login': 'Login',
    'nav.start_free': 'Start Free',
    'nav.navigation': 'Navigation',
    'nav.logout': 'Logout',
    'nav.first_interview': 'My First Interview',
    'nav.interview_history': 'Interview History',
    
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
    'dashboard.charts.monthly_performance': 'Monthly Team Performance',
    'dashboard.charts.monthly_description': 'Your organization\'s progress by month',
    'dashboard.charts.team_sessions': 'Team Sessions',
    'dashboard.charts.completed': 'Completed',
    'dashboard.charts.team_status': 'Team Status',
    'dashboard.charts.status_description': 'Session distribution',
    'dashboard.charts.weekly_activity': 'Weekly Team Activity',
    'dashboard.charts.weekly_description': 'Daily sessions from your organization',
    
    // Dashboard User
    'dashboard.user.title': 'My Dashboard',
    'dashboard.user.greeting': 'Hello',
    'dashboard.user.user': 'User',
    'dashboard.user.description': 'Here is your personal coaching progress',
    'dashboard.user.radar_title': '360° Competency Assessment',
    'dashboard.user.radar_description': 'Comparison between your self-assessment and your coach\'s assessment',
    'dashboard.user.my_sessions': 'My Sessions',
    'dashboard.user.upcoming': 'Upcoming',
    'dashboard.user.consistency': 'My Consistency',
    'dashboard.user.wellbeing': 'My Wellbeing',
    'dashboard.user.sessions_completed': 'Sessions completed',
    'dashboard.user.sessions_scheduled': 'Scheduled sessions',
    'dashboard.user.attendance_rate': 'Attendance rate',
    'dashboard.user.average_mood': 'Average mood',
    'dashboard.user.monthly_progress': 'My Monthly Progress',
    'dashboard.user.monthly_description': 'Your evolution in recent months',
    'dashboard.user.sessions_status': 'My Sessions',
    'dashboard.user.status_description': 'Status of your sessions',
    'dashboard.user.weekly_activity': 'My Weekly Activity',
    'dashboard.user.weekly_description': 'Your sessions in the last week',
    'dashboard.user.clarity': 'Clarity (C)',
    'dashboard.user.structure': 'Structure (S)',  
    'dashboard.user.emotional_alignment': 'Emotional Alignment (A)',
    'dashboard.user.action_influence': 'Action & Influence (I)',
    'dashboard.user.my_evaluation': 'My Assessment',
    'dashboard.user.coach_evaluation': 'Coach Assessment',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.coach': 'Coach',
    'nav.roleplay': 'Training Room',
    'nav.demo': 'Demo',
    'nav.demo_training': 'Demo Training',
    'nav.roleplay_progress': 'Mi Progreso',
    'nav.learning_path': 'Learning Path',
    'nav.team_learning_progress': 'Team Progress',
    'nav.sessions': 'Historial',
    'nav.analytics': 'Analytics',
    'nav.organizations': 'Organizations',
    'nav.users': 'Users',
    'nav.reports': 'Reports',
    'nav.trends': 'Trends',
    'nav.plans': 'Plans',
    'nav.documents': 'Documents',
    'nav.settings': 'Settings',
    'nav.my_team': 'My Team',
    'nav.plan': 'Plan',
    'nav.achievements': 'Achievements',
    
    // Roles
    'roles.admin': 'Global Administrator',
    'roles.manager': 'Administrator',
    'roles.user': 'User',
    'roles.default_user': 'User',
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

    // Coach
    'coach.title': 'AI Coach',
    'coach.subtitle': 'Your personal mentor for professional growth',
    'coach.ai_coach': 'Artificial Intelligence Coach',
    'coach.description': 'Chat with your AI-powered personal coach for personalized mentoring',
    'coach.status.ready': 'Ready to chat',
    'coach.status.connecting': 'Connecting...',
    'coach.status.listening': 'Listening...',
    'coach.status.thinking': 'Processing...',
    'coach.status.speaking': 'Responding...',
    'coach.start_listening': 'Start Conversation',
    'coach.stop_listening': 'Stop',
    'coach.mute': 'Mute',
    'coach.unmute': 'Unmute',
    'coach.instructions': 'Write your query and get personalized coaching in real time',
    'coach.error.no_api_key': 'Demo mode - Full voice integration requires configuration',
    'coach.new_conversation': 'New Conversation',
    'coach.voice_mode': 'Voice Mode (Coming Soon)',
    'coach.placeholder': 'Write your coaching query...',
    'coach.thinking': 'Your coach is thinking...',
    'coach.specialties': 'Your intelligent coach is ready to help you with leadership, productivity and professional development',

    // AI Resources
    'nav.ai_resources': 'AI Educational Resources',
    'ai_resources.title': 'AI Educational Resources',
    'ai_resources.description': 'Artificial intelligence resources for training',
    'ai_resources.open_resource': 'Open Resource',
    'ai_resources.add_resource': 'Add Resource',
    'ai_resources.add_title': 'New Educational Resource',
    'ai_resources.form.title': 'Title',
    'ai_resources.form.title_placeholder': 'Resource name',
    'ai_resources.form.description': 'Description',
    'ai_resources.form.description_placeholder': 'Brief description of the resource',
    'ai_resources.form.url': 'Resource URL',
    'ai_resources.form.url_placeholder': 'https://example.com',
    'ai_resources.form.icon': 'Icon',
    'ai_resources.form.color': 'Color',
    'ai_resources.form.submit': 'Save Resource',
    'ai_resources.form.cancel': 'Cancel',
    'ai_resources.success': 'Resource added successfully',
    'ai_resources.error': 'Error adding resource',
    'ai_resources.loading': 'Loading resources...',
    'ai_resources.empty': 'No resources available',

    // Avatar Showcase
    'nav.avatar_showcase': 'Avatar Showcase',
    'avatar_showcase.title': 'Voxel Avatar Showcase',
    'avatar_showcase.description': 'Compare different approaches for rendering 3D voxel-style avatars',
  }
};

/* eslint-disable-next-line react-refresh/only-export-components */
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

/* eslint-disable-next-line react-refresh/only-export-components */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


