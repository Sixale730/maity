// Dimension and subdimension descriptions for session evaluation
// Copied from web SessionResults component

export const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  clarity: "Evalúa qué tan comprensible y directa fue tu comunicación",
  structure: "Mide la organización lógica de tus ideas y argumentos",
  connection: "Valora tu capacidad para conectar emocionalmente con el interlocutor",
  influence: "Determina tu efectividad para persuadir y generar acción"
};

export const SUBDIMENSION_DESCRIPTIONS: Record<string, string> = {
  // Claridad
  "Vocabulario_Sencillo": "Uso de palabras claras y fáciles de entender",
  "Mensajes_Directos": "Comunicación sin rodeos ni ambigüedades",
  "Sin_Jerga": "Evitar términos técnicos innecesarios",
  "Concision": "Expresar ideas de forma breve y precisa",
  "Ejemplos_Claros": "Uso de ilustraciones concretas para explicar conceptos",

  // Estructura
  "Inicio_Claro": "Apertura efectiva de la conversación",
  "Desarrollo_Logico": "Progresión coherente de ideas",
  "Cierre_Efectivo": "Conclusión clara con llamado a la acción",
  "Transiciones_Fluidas": "Conexión natural entre temas",
  "Organizacion_Ideas": "Presentación ordenada de argumentos",

  // Alineación Emocional
  "Empatia": "Comprensión de sentimientos y necesidades",
  "Conexion_Necesidades": "Vinculación con pain points del cliente",
  "Tono_Apropiado": "Ajuste del lenguaje al contexto emocional",
  "Escucha_Activa": "Demostración de atención a lo que dice el interlocutor",
  "Rapport": "Construcción de confianza y conexión personal",

  // Influencia
  "Argumento_Persuasivo": "Construcción de casos convincentes",
  "Manejo_Objeciones": "Respuesta efectiva a resistencias",
  "Cierre_Accion": "Capacidad para generar compromisos",
  "Valor_Propuesto": "Presentación clara de beneficios",
  "Urgencia": "Creación de motivación para actuar ahora"
};

// Dimension display names
export const DIMENSION_NAMES: Record<string, string> = {
  clarity: 'Claridad',
  structure: 'Estructura',
  connection: 'Alineación Emocional',
  influence: 'Influencia'
};

// Dimension colors for visual coding
export const DIMENSION_COLORS: Record<string, string> = {
  clarity: '#3b82f6',      // blue
  structure: '#10b981',    // green
  connection: '#f59e0b',   // yellow
  influence: '#ef4444'     // red
};
