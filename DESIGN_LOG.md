# DESIGN_LOG.md

## 2026-01-29 - Separacion Contenido Empresa + Rediseno La Escalada (COMPLETADO)

### Cambios Realizados

**1. Contenido Empresa movido al Business View:**
*   Quitado `B2BTeaser` del product view (individual). Movido al business view despues de BusinessDeepDive.
*   Quitado `DemoCalendar` del product view. Movido al business view despues de Pricing.
*   DemoCalendar sigue accesible como vista independiente desde nav "Agenda".
*   Product view ahora: Hero > Problem > HowItWorks > Skills > Quiz > TheClimb > ProductInfo > Trust > Pricing > Testimonials > FAQ > CTACierre.
*   Business view ahora: BusinessHero > DeepDive > B2BTeaser > ROICalculator > Pricing > DemoCalendar > Trust > FAQ.

**2. TheClimb rediseno completo — tono profesional:**
*   Headline: "Convierte tu aprendizaje en un Videojuego" → "Tu progreso, visible y medible" (gradiente pink→blue).
*   Subtitulo: Eliminada jerga gamer (XP, medallas, Montana del Liderazgo). Nuevo copy sobre ruta clara con niveles, hitos y reconocimientos.
*   Mecanicas ampliadas de 3 a 5 elementos con lenguaje profesional:
    - "Gana XP" → "Avance por practica real" (TrendingUp icon)
    - "Rachas Diarias" → "Habito diario" (Activity icon)
    - "Conquista Cumbres" → "Niveles de maestria" (Award icon)
    - NUEVO: "Competencias certificables" (Target icon)
    - NUEVO: "Reconocimientos" (Trophy icon)
*   Visual derecho: Reemplazado cuadrado con imagen generica por mockup profesional interactivo:
    - Nivel actual "Comunicador" (3 de 5) con barra de 5 niveles (Aprendiz→Leyenda)
    - 4 barras de competencia con porcentajes (Claridad 72%, Empatia 45%, Persuasion 58%, Negociacion 33%)
    - Badge de racha activa (7 dias, mejor racha 14 dias)
*   CTA: "Descubre tu nivel" (boton pink filled con Mountain icon).

### Razon
*   Solicitud del usuario: separar contenido empresarial del flujo individual, y hacer La Escalada mas clara con tono profesional (no gamer).

### Protocolo de Seguridad
*   [x] Plan aprobado por usuario antes de ejecucion
*   [x] Registro en DESIGN_LOG.md

---

## 2026-01-29 - Alineacion con Arquitectura Web Oficial (9 Cambios) (COMPLETADO)

### Cambios Realizados

**1. Navegacion Header:**
*   Reemplazado navLinks: eliminado "Recursos", agregado "Como Funciona" y "La Escalada" con scroll suave a secciones dentro del product view.
*   Nuevo orden: Producto > Como Funciona > La Escalada > Empresas > Precios > Agenda.
*   CTA primario renombrado: "Prueba Gratis" -> "Probar Maity Gratis".
*   Implementado `handleNavClick()` con `scrollIntoView({ behavior: 'smooth' })` para items de scroll.
*   Agregados `id="como-funciona"` y `id="la-escalada"` a las secciones target.

**2. Hero Section - Copy Completo:**
*   H1: "Mejora como comunicas. Cada dia. Con IA." -> "La evolucion no ocurre en un curso. Ocurre en cada conversacion."
*   Subheadline actualizado al copy del documento de arquitectura web.
*   CTAs reducidos de 3 a 2: "Empieza a entrenar gratis" + "Ver como funciona" (scroll).
*   Eliminado boton "Descubre tu Arquetipo" del Hero.
*   Microcopy de confianza: "Sin tarjeta de credito | 7 dias gratis | Control total de tus datos".

**3. Reorden de Secciones Product View:**
*   Nuevo flujo: Hero > Problem (tension) > HowItWorks (solucion) > Skills > Quiz > TheClimb (gamificacion) > ProductInfo > B2BTeaser > Trust > Pricing > DemoCalendar > Testimonials > FAQ > CTACierre.
*   TheClimb integrado al flujo principal del product view (antes solo era vista independiente).

**4. HowItWorks - Descripciones Expandidas:**
*   5 pasos actualizados con descripciones mas largas y detalladas segun documento de arquitectura.

**5. Skills Grid - Nombres y Descripciones del Documento:**
*   8 skills renombrados: Claridad y Estructura, Empatia y Conexion, Persuasion Etica, Venta Consultiva, Negociacion, Servicio al Cliente, Manejo Emocional, Liderazgo Comunicativo.
*   Cada skill ahora incluye descripcion corta debajo del titulo.

**6. B2B Teaser - Copy del Documento:**
*   Headline: "Transforma el desarrollo de tu equipo en sistema operativo diario."
*   4 bullets con check icons reemplazando el copy generico anterior.
*   CTAs: "Conocer solucion empresarial" + "Solicitar demo".

**7. Trust Section - Pilares del Documento:**
*   4 pilares renombrados: Control Total, Consentimiento, Cifrado, Sin Venta de Datos.
*   Agregado titulo de seccion y CTA "Ver politica de privacidad completa".

**8. Nueva Seccion CTACierre:**
*   Componente nuevo insertado entre FAQ y Footer.
*   Headline: "Empieza a evolucionar hoy." + "7 dias gratis. Sin compromiso."
*   2 CTAs: "Probar Maity Gratis" + "Hablar con ventas".

**9. Footer Actualizado:**
*   Columna "Legal" reemplazada por "Recursos" (Blog, Guias, FAQs, Soporte).
*   Columnas Producto y Empresa expandidas (App Movil, Trabaja con nosotros).
*   Links legales (Privacidad, Terminos) movidos a la barra inferior junto al copyright.

### Razon
*   Alineacion completa con el documento de arquitectura web oficial del manual Maity (Secciones 4-5).

### Protocolo de Seguridad
*   [x] Backup previo: `LandingPage.jsx.mejoras_bak` (existente)
*   [x] Plan aprobado por usuario antes de ejecucion
*   [x] Registro en DESIGN_LOG.md

---

## 2026-01-28 - Navbar Reorder + Rediseño DemoCalendar Premium (COMPLETADO)

### Cambios Realizados
*   **Navbar**: Reordenado `navLinks` — movido `Agenda` de posición 2 a posición 5 (después de `Precios`, antes de `Entrar`). Nuevo orden: Producto → Empresas → Recursos → Precios → Agenda.
*   **DemoCalendar**: Rediseño completo del componente. Reemplazado placeholder estático (grid falso de 28 días con pulse) por flujo de reserva interactivo de 3 pasos:
    1. **Paso 1 - Fecha**: Calendario real del mes actual con días de la semana (Lun-Dom), detección de fines de semana/pasados como no disponibles, highlight de "Hoy", selección visual con hover pink.
    2. **Paso 2 - Hora**: 7 franjas horarias (9AM-6PM) agrupadas por período (Mañana/Mediodía/Tarde), botones interactivos con selección visual.
    3. **Paso 3 - Datos**: Formulario con campos Nombre, Email corporativo y Empresa, iconos inline (User/Mail/Building2), validación required, botón "Confirmar Demo" con gradiente pink.
    4. **Confirmación**: Pantalla de éxito con resumen de reserva y botón de regreso.
*   **UI Premium**: Header con título gradiente "Descubre Maity en 20 minutos", sidebar sticky con info de sesión (20min videollamada 1:1), 3 beneficios (ROI/Dashboard/Plan), social proof (+120 demos, 4.9/5 estrellas), step indicator con estados (pending/active/completed), navegación "atrás" entre pasos.

### Razón
*   Solicitud del usuario: mejorar diseño de Agenda y reposicionar en el menú después de Precios.

### Protocolo de Seguridad
*   [x] Backup previo: `LandingPage.jsx.mejoras_bak` (existente)
*   [x] Registro en DESIGN_LOG.md (esta entrada)
*   [x] Verificación visual pendiente

---

## 2026-01-28 - Mejoras Críticas: Foto + Quiz Interactivo + Copy (COMPLETADO)

### 🔄 Cambios Realizados
*   **📍 Foto Hero**: Reemplazo de `maity-persona.png` (fondo negro con texto "posibilidades") por `Maity Rosa.png` (fondo transparente, limpio, ~2MB vs 6.4MB).
*   **📍 ArchetypeQuiz**: Reescritura completa — 7 preguntas con escenarios laborales reales, scoring funcional con conteo de respuestas, 3 arquetipos personalizados (Líder Directo ⚡ / Conector Empático 💫 / Estratega Analítico 🎯), pantalla de resultado con fortalezas, áreas de crecimiento, plan de 21 días, barra de progreso animada, animación de revelación, y botón "Compartir Resultado".
*   **📍 Posicionamiento Quiz**: Movido arriba en el flujo (Hero → HowItWorks → **Quiz** → SkillsGrid) + CTA "Descubre tu Arquetipo" en Hero + quiz embebido en vista `product`.
*   **📍 Hero Headline**: "Tu coach de soft skills con IA" → "Mejora cómo comunicas. Cada día. Con IA."
*   **📍 Hero CTA**: "Prueba Gratis" → "Empieza Gratis · Sin tarjeta" + nuevo botón "Descubre tu Arquetipo".
*   **📍 HowItWorks subtítulo**: → "Cada conversación es una oportunidad de crecer. Sin fricción. Sin excusas. Sin pausa."
*   **📍 FAQ**: Reducido de 10 a 6 preguntas esenciales reescritas en español limpio (sin HTML entities).
*   **📍 Import**: Agregado `Share2` de lucide-react para botón de compartir.

### ❓ Razón
*   Mejorar claridad, engagement y conversión. Alinear con Manual Maity. Quiz como hook de registro.

### 🛡️ Protocolo de Seguridad
*   [x] Backup creado: `LandingPage.jsx.mejoras_bak`
*   [x] Registro preventivo en DESIGN_LOG.md
*   [x] Verificación grep: 0 residuos mojibake
*   [x] Entrada final de cierre en log (esta actualización)

---

## 2026-01-28 - Auditoría Completa: Encoding + Filosofía de Marca (COMPLETADO)

### 🔄 Cambios Realizados

#### Corrección de Encoding (29 instancias corregidas)
*   **📍 RoleplaySimulator**: `Simulador de Negociación`, `Usar micrófono`
*   **📍 ROICalculator**: `*Cálculo basado en`
*   **📍 Navbar/LoginView**: `Iniciar Sesión`, `Correo Electrónico`, placeholder de contraseña (ÔÇó → •)
*   **📍 SuccessStories**: `Confían en nosotros`, `¿Listo para escribir tu caso de éxito?`, `Únete a las empresas que están redefiniendo`
*   **📍 HeroSection mock**: `speed: 'Óptima'`
*   **📍 BusinessHeroSection**: `Solución Empresarial`, `Métricas reales de evolución`, `Ver Casos de Éxito`
*   **📍 BusinessDeepDive**: `Cómo funciona`, `1. Instalación`, `2. Detección`, `3. Análisis`, `hábitos...prácticas...teoría`, `5. Dashboard Líder`, `Visión de equipo`, `6. Híbrido`, `Opción de consultoría...implementación`, `Qué mejora Maity`, `Comunicación y claridad`, `Empatía y servicio`, `Negociación`, 3x bullet points (ÔÇó → •), `Prácticas cortas`, `Evolución Maity`

#### Auditoría de Filosofía de Marca (7 ajustes)
*   **📍 Hero subtítulo**: "entrenamiento medible" → "evolución real. Tu mentor de IA que reta, acompaña y mide tu crecimiento — todos los días."
*   **📍 HowItWorks título**: "La Magia en 5 Pasos" → "Tu Escalada en 5 Pasos" (metáfora de marca)
*   **📍 HowItWorks subtítulo**: → "De conversación real a crecimiento medible. Sin fricción, sin excusas."
*   **📍 Business Hero headline**: "sistema operativo diario" → "un mentor de IA que nunca se detiene"
*   **📍 Resources título**: "hackear tus Soft Skills" → "Potencia tus Soft Skills"
*   **📍 BusinessDeepDive descripción**: "capacitación en experiencia viva" → "no es un curso más. Es un mentor de IA que acompaña, desafía y mide el crecimiento real"
*   **📍 Copyright**: 2025 → 2026

### ❓ Razón
*   Solicitud directa del usuario para corregir símbolos rotos y alinear textos con la filosofía del Manual Maity.

### 🛡️ Protocolo de Seguridad
*   [x] Backup creado: `LandingPage.jsx.audit_bak`
*   [x] Registro preventivo en DESIGN_LOG.md
*   [x] Verificación grep post-cambio: 0 residuos de mojibake
*   [x] Entrada final de cierre en log (esta actualización)

---

## 2026-01-28 - Refuerzo de Seguridad y Protocolo de Auditoría Real-Time (SOLICITUD)

### 🔄 Cambios Principales
*   **📍 Safe Design Modification Skill**: Actualizado para hacer **OBLIGATORIO** el registro en el log ANTES de cualquier modificación de código. Se añadió un paso de verificación post-cambio para cerrar el registro en el log.
*   **📍 Design Change Documentation Skill**: Se cambió la frecuencia de reporte de "sesión" a "atómico" (por cada cambio). Se estableció una **prohibición absoluta** de usar herramientas de edición sin una entrada previa en el `DESIGN_LOG.md`.
*   **📍 Auditoría Maciva de Codificación**: Limpieza profunda de toda la `LandingPage.jsx`. Se eliminaron caracteres fantasma (`├│`, `┬┐`, `Ô­`, etc.) en:
    *   `RoleplaySimulator` (Simulador de Negociación)
    *   `VideoTestimonials` (Historias Reales)
    *   `BusinessDeepDive` (Secciones Corporativas)
    *   `Dashboard` (Metricas de Evolución)
    *   `TrustSection` (Pilares de Ética)
    *   `Footer` (Copyright y Términos)
*   **📍 Recursos**: Rediseño premium de la vista de recursos con tarjetas dinámicas y gradientes corporativos.

### ❓ Razón
*   Garantizar la trazabilidad total del proyecto y evitar la "amnesia" o degradación del código. Cumplimiento con la orden del usuario de no permitir modificaciones sin documentación granular previa.

### 🛡️ Verificación (Protocolo Actualizado)
*   [x] Backup realizado de `LandingPage.jsx`.
*   [x] Grep audit realizado para detectar símbolos no legibles.
*   [x] Skills actualizados en el directorio `/skills`.
*   [x] Registro preventivo en log implementado.


## 2026-01-27 - Implementación Masiva de Contenido de Manual

### 🔄 Cambios Principales
*   **📍 DownloadView**: Se reescribió el copy para generar curiosidad ("Comienza tu Escalada") y enfocar en la creación de cuenta.
*   **📍 Timeline ProductView**: Actualizado a "Configura → Captura → Evoluciona" con nuevos iconos y descripciones del manual.
*   **📍 Habilidades**: Nuevo grid de 8 cards mostrando las competencias que Maity entrena (Claridad, Empatía, Persuasión, etc.).
*   **📍 Gamificación**: Nueva sección "La Escalada" con preview visual de mapa y lista de beneficios (XP, Rachas, Montañas).
*   **📍 Bloque confianza**: 4 pilares de privacidad y control.
*   **📍 B2B Teaser**: Sección final invitando a la solución empresarial con beneficios clave.

### ❓ Razón
*   Alinear la landing page con la narrativa profunda y gamificada definida en el Manual de Maity.

## 2026-01-27 - Implementación de Quiz de Arquetipos (Lead Magnet)

### 🔄 Cambios Principales
*   **📍 Componente Interactivo**: Se creó `ArchetypeQuiz` con lógica de estado para Intro, Preguntas y Resultados.
*   **📍 Perfilado de Usuario**: El quiz asigna uno de tres arquetipos ("Líder Directo", "Conector Empático", "Estratega Silencioso") basado en las respuestas.
*   **📍 Conversión**: El resultado final ofrece un plan de acción personalizado y un CTA directo para descargar Maity.

### ❓ Razón
*   Gamificar la experiencia de usuario y ofrecer valor personalizado antes de la descarga, aumentando la probabilidad de conversión.

## 2026-01-27 - Mejora de Landing: Confianza y Persona

### 🔄 Cambios Principales
*   **📍 Barra de Confianza (Trust Bar)**: Se añadieron placeholders de logos "Líderes de alto rendimiento" bajo el Héroe para credibilidad instantánea.
*   **📍 Integración de Persona**: Se incorporó la imagen de Maity (`/assets/maity-persona.png`) en el Hero con efectos de máscara y elementos flotantes de UI para contextualizar la IA.
*   **📍 Timeline Visual**: Nueva sección "La Magia en 3 Pasos" con iconos animados que explica el flujo de valor (Instala -> Conversa -> Evoluciona).

### ❓ Razón
*   Aumentar la tasa de conversión y comprensión del producto mediante prueba social y claridad visual del proceso.

## 2026-01-27 - Implementación de Sección de Descarga (Prueba Gratis)

### 🔄 Cambios Principales
*   **📍 Nueva Vista**: Se creó `DownloadView` con opciones de plataforma para Windows, macOS, iOS y Android.
*   **📍 Navegación**: Se redireccionaron todos los botones de "Prueba Gratis" y "Empezar Evolución" de la zona de dashboard a la zona de descargas.
*   **📍 Estética**: Diseño premium coherente con la marca, con iconos de plataforma y botones de descarga estilizados.

### ❓ Razón
*   Cumplir con el requerimiento de ofrecer descarga de software al usuario cuando selecciona "Prueba Gratis", transformando el inicio del funnel en una acción tangible.

## 2026-01-27 - Rediseño Premium de Agenda (Demo Calendar)

### 🔄 Cambios Principales
*   **📍 Diseño**: Se transformó la vista de agenda de una página simple a una experiencia de reserva premium "split-view".
*   **📍 Interactividad**: Se añadió un sidebar de resumen de sesión, estados de carga visual (ping animado) y lógica de disponibilidad mejorada.
*   **📍 UX**: Implementación de `useEffect` para resetear el scroll al top al cambiar de vista, eliminando la desorientación en transiciones.
*   **📍 Bugfix**: Se corrigió la importación de `Calendar` de `lucide-react` que causaba el error de pantalla en blanco.

### ❓ Razón
*   Atender el reporte del usuario de "sección en blanco" y elevar la calidad visual para que coincida con la marca Maity.

### 🛡️ Verificación (Skill: Safe Design Modification)
*   [x] Flujo de selección de fecha/hora verificado.
*   [x] Validación de formulario funcional.
*   [x] Diseño mobile-responsive confirmado.

## 2026-01-27 - Mejora de Visibilidad de Agenda

### 🔄 Cambios Principales
*   **📍 Navbar**: Se añadió el enlace **Agenda** directamente en el menú de navegación para asegurar visibilidad constante.
*   **📍 ProductView**: Se integró el botón **Ver Demo** en la sección Hero de la nueva vista de producto.
*   **📍 App Config**: Se estableció la vista de **Producto** como la página de aterrizaje predeterminada (`activeView: 'product'`).

### ❓ Razón
*   Resolver el problema de "Agenda no visible" reportado tras la restructuración de navegación.

### 🛡️ Verificación (Skill: Safe Design Modification)
*   [x] Acceso directo a `DemoCalendar` desde Navbar verificado.
*   [x] Coherencia visual de los botones en el Hero de Producto.

## 2026-01-27 - Restructuración de Navegación y Nuevas Secciones

### 🔄 Cambios Principales
*   **📍 Navbar**: Se reorganizó el orden del menú: **Producto > Individual > Empresas > Recursos > Precios**.
*   **📍 ProductView**: Nueva vista de aterrizaje general que integra la propuesta de valor global.
*   **📍 ResourcesView**: Nueva sección de aprendizaje con videos tutoriales y guías de uso.
*   **📍 Navegación**: Se mantuvo el acceso a "Entrar" y el CTA "Prueba Gratis" al final del flujo.

### ❓ Razón
*   Mejora de la jerarquía de información y facilidad de descubrimiento de contenido educativo/soporte.

### 🛡️ Verificación (Skill: Safe Design Modification)
*   [x] Persistencia de estados en el cambio de vistas.
*   [x] Adaptabilidad responsive de los nuevos grids de recursos.


## 2026-01-27 - Unificación de Precios y Conectividad de Demo

### 🔄 Cambios Principales
*   **📍 Pricing Section**: Se unificaron los componentes `Pricing` y `BusinessPricing` en un solo componente `Pricing` con tabs interactivos ("Para Ti" / "Para Empresas").
*   **📍 CTAs de Demo**: Se conectaron todos los botones de "Ver Demo" y "Solicitar Demo" (en Hero, Business View y Pricing) para navegar correctamente a la vista `demo-calendar`.
*   **📍 Tablas Comparativas**: Se implementó una lógica dinámica para mostrar la tabla comparativa correspondiente al tipo de plan seleccionado (Individual o Business).

### ❓ Razón
*   Centralización de la oferta comercial y mejora de la navegabilidad del embudo de conversión.

### ⚠️ Impacto
*   Eliminación del componente redundante `BusinessPricing`.
*   Requiere que cualquier nuevo CTA de demo use `setView('demo-calendar')` para mantener la consistencia.

### 🛡️ Verificación (Skill: Safe Design Modification)
*   [x] Read-Before-Write ejecutado en `App.jsx`.
*   [x] Lógica de estado `activeView` preservada para evitar roturas de navegación.
*   [x] Contraste visual verificado en los nuevos botones de tabs.

## 2026-01-27 - Alineación de Marca y Constitución de Diseño

### 🔄 Cambios Principales
*   **📍 Global**: Se integraron las fuentes **Geist** (para títulos) e **Inter** (para cuerpo) de forma local.
*   **📍 Colores**: 
    *   Se corrigió el rosa al tono oficial **Maity Rosa** (`#ff0050`) tras recibir el manual en texto plano.
    *   Se segmentó la identidad visual: **Rosa/Azul** para la sección Individual y **Azul/Verde** para la sección Empresarial.
    *   **Mejora de Vitalidad B2B**: Se aplicó el **Maity Verde** (`#1bea9a`) a los acentos de la sección "Cómo funciona" empresarial para mayor dinamismo.
*   **📍 Agenda Demo**: Se implementó una nueva vista `DemoCalendar` con un calendario interactivo y selección de horarios, centralizando todos los CTAs de demo.
*   **📍 index.css**: Reescrito para usar variables HSL alineadas con el manual y eliminar dependencias de Google Fonts externas.

### ❓ Razón
*   Cumplimiento con la **Constitución de Marca Maity** y adopción de los nuevos skills de diseño.

### ⚠️ Impacto
*   Afecta a toda la aplicación. Requiere que los nuevos componentes usen la clase `font-geist` para títulos si no son etiquetas `h1-h6` estándar.
