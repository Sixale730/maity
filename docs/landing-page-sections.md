# Landing Page - Mapa de Secciones

**Archivo principal:** `src/LandingPage.jsx` (~4850 lineas, componente unico auto-contenido)
**Ruta:** `/landing`
**Tema:** Dark mode (#050505), colores marca: rosa (#ff0050), azul (#485df4), verde (#1bea9a)

---

## Arquitectura

El landing page usa un sistema de vistas internas con `activeView` state. No usa React Router internamente; todo vive en un solo archivo JSX con ~37 componentes.

### Navegacion
- `Navbar` — Fijo top, links a secciones, boton "Probar Maity Gratis", menu mobile hamburguesa
- `Footer` — 4 columnas (Producto, Empresa, Recursos, Contacto), links legales, redes sociales

---

## Vista Producto (`activeView: 'product'`)

Pagina principal para usuarios individuales (profesionales, coaches, etc.)

| # | Seccion | Componente | Descripcion |
|---|---------|------------|-------------|
| 1 | Hero Producto | `HeroSection` | Titulo principal, CTA "Empieza a entrenar gratis", video "Que es Maity" (YouTube embed), trust bar con logos |
| 2 | Problema | `ProblemSection` | Expone la necesidad: comunicacion ineficaz, datos estadisticos |
| 3 | Como Funciona | `HowItWorksSection` | Flujo paso a paso de la plataforma (id: `como-funciona`) |
| 4 | Habilidades | `SkillsGridSection` | Grid de habilidades que Maity desarrolla |
| 5 | Quiz de Comunicacion | `ArchetypeQuiz` | 7 preguntas sobre estilo comunicativo, 3 arquetipos: Directo/Empatico/Analitico |
| 6 | La Escalada | `TheClimb` | 5 niveles de progresion: Aprendiz > Explorador > Lider > Maestro > Leyenda (id: `la-escalada`) |
| 7 | Info Producto | `ProductInfoSection` | Detalle de funcionalidades de la plataforma |
| 7.5 | Wearable | `WearableSection` | Hardware Maity: specs (mic, BLE, 16h, 35g), CTA reservar |
| 8 | Seguridad | `TrustSection` | 4 pilares de confianza (version producto, sin compliance enterprise) |
| 9 | Precios | `Pricing` | 3 planes: Explorador(Gratis) / Escalador($15-19 USD) / Guia($39-49 USD), con trust badges |
| 10 | Testimoniales | `VideoTestimonials` | Testimonios en video de usuarios |
| 11 | FAQ | `FAQSection` | Preguntas frecuentes con accordion (id: `faq-section`) |
| 12 | Comunidad Partners | `CommunityPartnerSection` | 3 tracks: Coach Certificado, Referenciador, Socio/Inversionista |
| 13 | CTA Cierre | `CTACierre` | Llamada a accion final antes del footer |

---

## Vista Empresarial (`activeView: 'business'`)

Pagina para empresas y decision makers (B2B).

| # | Seccion | Componente | Descripcion |
|---|---------|------------|-------------|
| 1 | Hero Empresarial | `BusinessHeroSection` | CTA "Solicitar Demo", video corporativo (YouTube embed) |
| 2 | Deep Dive B2B | `BusinessDeepDive` | Propuesta de valor detallada para equipos |
| 2.5 | Soluciones | `SolucionesGrid` | Grid 2x2: Ventas, Liderazgo, Servicio al Cliente, Equipos Remotos |
| 3 | Escenarios IA | `ScenariosSection` | Conversaciones simuladas con IA, video explicativo, 6 escenarios (negociacion, liderazgo, etc.) |
| 4 | Quiz Corporativo | `CorporateQuiz` | 7 preguntas sobre liderazgo, 3 arquetipos: Visionario/Negociador/Arquitecto |
| 5 | B2B Teaser | `B2BTeaser` | Resumen de beneficios empresariales |
| 6 | Calculadora ROI | `ROICalculator` | Calcula ahorro estimado segun tamano de equipo |
| 6.5 | Piloto B2B | `PilotSection` | Piloto 30 dias gratis: 4 pasos, stats, CTA solicitar piloto |
| 7 | Precios | `Pricing` | Tab empresarial: Equipo($12-15 USD) / Organizacion($10-12 USD) / Enterprise(Custom) |
| 8 | Contacto/Equipo | `DemoCalendar` | Perfiles del equipo (Poncho, Julio, Karina) con LinkedIn, metodos de contacto, agenda demo |
| 9 | Seguridad Enterprise | `TrustSection` | Version expandida: compliance badges (SOC2, ISO, GDPR, CCPA, LFPDPPP), cifrado, organizacional |
| 10 | FAQ | `FAQSection` | Preguntas frecuentes |

---

## Vistas Standalone (rutas internas)

Accesibles desde navbar, footer, o botones internos.

| activeView | Componente | Descripcion |
|------------|------------|-------------|
| `demo-calendar` | `DemoCalendar` | Seccion de contacto con equipo y agenda |
| `resources` | `ResourcesView` | Hub de recursos: 8 articulos/videos con filtro por categoria, newsletter CTA |
| `primeros-pasos` | `PrimerosPasosView` | Onboarding: descarga de apps, instrucciones iniciales |
| `archetype-quiz` | `ArchetypeQuiz` | Quiz producto standalone |
| `success-stories` | `SuccessStories` | Casos de exito / testimonios |
| `login` | `LoginView` | Login con email/Google/Microsoft |
| `climb` | `TheClimb` | La Escalada standalone |
| `roleplay` | `RoleplaySimulator` | Demo de roleplay con IA (Gemini) |
| `pricing` | `Pricing` | Precios standalone |
| `nosotros` | `NosotrosView` | Mision, 5 valores, personalidad de marca, tagline CTA |
| `seguridad` | `TrustSection` | Seguridad enterprise standalone |
| `corporate-quiz` | `CorporateQuiz` | Quiz corporativo standalone |
| `privacidad` | `PrivacyPolicyView` | Politica de privacidad completa (LFPDPPP, GDPR, CCPA) |
| `terminos` | `TermsOfServiceView` | Terminos de servicio completos (14 secciones) |
| `careers` | `CareersView` | 4 valores, 8 beneficios, 5 posiciones abiertas |
| `soporte` | `SoporteView` | 3 canales de contacto, FAQ, quick links |
| `comunidad` | `CommunityPartnerSection` | Partners standalone |

---

## Componentes Compartidos / Utilidad

| Componente | Descripcion |
|------------|-------------|
| `FadeIn` | Wrapper de animacion con IntersectionObserver, prop `delay` |
| `VideoCard` | Reproduce YouTube inline (no redirect), auto-thumbnail, variantes `inline` y `featured` |
| `PilotSection` | Seccion piloto B2B 30 dias: 4 pasos, stats strip, CTA |
| `SolucionesGrid` | Grid 2x2 de soluciones por area de negocio (Ventas, Liderazgo, Servicio, Equipos) |
| `WearableSection` | Specs del hardware Maity Pendant: mic, BLE, bateria, peso, app companion |
| `RadarChart` | Grafica radar SVG para resultados de quiz |
| `Navbar` | Barra fija, acepta `activeView` y `setView`, menu responsive |
| `Footer` | 4 columnas, 16+ links funcionales, acepta `setView` |

---

## Assets del Landing

| Archivo | Uso |
|---------|-----|
| `/assets/maity-logo-color.png` | Navbar — isotipo rosa + "maity" blanco |
| `/assets/maity-logo-white.png` | Footer — logo todo blanco |
| `/assets/maity-isotipo-color.png` | Isotipo rosa solo (disponible) |
| `/assets/maity-persona.png` | (ya no se usa en hero, disponible) |

---

## Videos YouTube Embebidos

| Video | URL | Ubicacion |
|-------|-----|-----------|
| Que es Maity | `https://youtu.be/Nf3Y_SEuhbw` | Hero producto (derecha) |
| Maity para Empresas | `https://youtu.be/YiyN6K-Ng_c` | Hero empresarial |
| Escenarios IA | `https://youtu.be/gCfLZJHGfjU` | ScenariosSection (business) |

---

## Equipo / Contacto

| Persona | Rol | LinkedIn |
|---------|-----|----------|
| Poncho Robles | CEO & Fundador, Maity | linkedin.com/in/ponchorobles/ |
| Julio Gonzalez | CTO, Maity | linkedin.com/in/julioalexisgonzalezvilla/ |
| Karina Barrera | Aliada Estrategica, CEO Asertio | linkedin.com/in/karinabarreragoytia/ |

---

## Colores de Marca

| Color | Hex | Uso |
|-------|-----|-----|
| Rosa Maity | `#ff0050` | Accion principal, CTA, acentos producto |
| Azul Maity | `#485df4` | Confianza, enterprise, CTA secundario |
| Verde Maity | `#1bea9a` | Exito, confirmaciones, metricas positivas |
| Fondo | `#050505` | Background principal |
| Card | `#0F0F0F` | Fondo de tarjetas |
| Card elevada | `#1A1A1A` | Cards con jerarquia visual |

---

## Footer Links Conectados

**Producto:** Dashboard, App Windows, App Movil → primeros-pasos | La Escalada → scroll
**Empresa:** Nosotros, Seguridad, Contacto, Trabaja con nosotros, Se Partner
**Recursos:** Blog, Guias → resources | Quiz Corporativo → corporate-quiz | FAQs → scroll | Soporte
**Legal:** Privacidad → privacidad | Terminos → terminos
**Social:** Twitter, LinkedIn (external)

---

## Historial de Cambios (Landing Page)

### 2026-01-31

**Commit 5eb9494: feat(landing): align with business model — pricing, legal, gamification, new sections**

Alineacion del landing page con el Documento Maestro MAITY v2.0 (Enero 2026).
Cambios realizados: 399 lineas agregadas, 137 eliminadas en `src/LandingPage.jsx`.

**Correcciones legales/criticas:**
- Entidad legal: "Maity Inc." → "Maity SAPI de CV" en PrivacyPolicyView (6 ocurrencias), TermsOfServiceView y Footer
- Fecha legal actualizada: "29 de enero de 2026" → "31 de enero de 2026"
- Footer: "© 2026 Maity SAPI de CV — Ciudad de Mexico, Mexico"

**Precios alineados al documento maestro (con USD explicito):**
- B2C Individual:
  - Maity Free → **Explorador** (Gratis, 3 roleplays/mes, 1 montana, Web App)
  - Maity Pro $9.99 → **Escalador** ($15-19 USD/mes, roleplays ilimitados, 6 montanas, coach IA)
  - Maity Pendant $99 → **Guia** ($39-49 USD/mes, mentor humano, reportes ejecutivos, API)
- B2B Empresas:
  - Starter $19-22 → **Equipo** ($12-15 USD/user/mes, hasta 20 usuarios)
  - Growth $39-45 → **Organizacion** ($10-12 USD/user/mes, 50+ usuarios, precio por volumen)
  - Enterprise Custom → **Enterprise** (Custom, SSO/SAML, API completa, CSM dedicado)
- Tablas comparativas actualizadas para ambos tabs con features reales

**La Escalada rediseñada — 6 Montanas:**
- Antes: 5 niveles lineales (Aprendiz→Leyenda) + 4 skill bars
- Ahora: 6 montanas tematicas con colores/emojis:
  1. Claridad (azul, 💎) — Expresion clara y estructurada
  2. Empatia (verde, 💚) — Escucha activa y conexion
  3. Persuasion (rosa, 🔥) — Influencia y conviccion
  4. Consultor (morado, 🧠) — Asesoria y diagnostico
  5. Negociador (naranja, 🤝) — Acuerdos y resolucion
  6. Servicio (cyan, ⭐) — Atencion al cliente
- 5 campamentos por montana: Base → Medio → Avanzado → Cumbre → Boss
- Mockup visual: grid 2x2 de montanas con barras de progreso

**Quiz arquetipos renombrados:**
- driver: "Comunicador Directo" → **"Estratega"**
- connector: "Comunicador Empatico" → **"Conector"**
- strategist: "Comunicador Analitico" → **"Analitico"**
- maityPlan actualizado con nombres de montanas
- Nota agregada al resultado: "Este es 1 de los 6 tipos de comunicador que Maity evalua"

**CommunityPartnerSection actualizada:**
- Coach Certificado: 30% recurrente (se mantiene)
- Referenciador: ahora 15% del primer ano (antes generico)
- Socio/Inversionista → **Embajador Corporativo**: 10% de contratos empresariales
- Stats strip actualizado: "30% Coaches", "15% Referenciadores", "10% Embajadores"

**Nuevos componentes:**

1. **PilotSection** (~80 lineas) — Seccion piloto B2B
   - Ubicacion: Business view, despues de ROICalculator
   - 4 pasos: Configuracion → Seleccion (5-20 users) → Entrenamiento (30 dias) → Reporte ROI
   - Stats pills: Setup gratis, 30 dias, 5-20 usuarios, ROI medible
   - CTA: "Solicitar Piloto Gratuito" → demo-calendar

2. **SolucionesGrid** (~70 lineas) — Soluciones por area de negocio
   - Ubicacion: Business view, entre BusinessDeepDive y ScenariosSection
   - Grid 2x2: Ventas (rosa), Liderazgo (azul), Servicio al Cliente (verde), Equipos Remotos (morado)
   - Cada card: icono, titulo, descripcion, tags de competencias

3. **WearableSection** (~85 lineas) — Hardware Maity
   - Ubicacion: Product view, entre ProductInfoSection y TrustSection
   - Specs: Microfono HiFi, BLE 5.0, 16h bateria, 35g, companion app iOS/Android
   - Privacidad: procesamiento local, sin grabacion permanente
   - Mockup visual del Pendant con stats (35g, 16h, BLE 5)
   - CTA: "Reservar Wearable" → demo-calendar

**Commit: feat(landing): add team section with booking calendar and audit**
- Seccion "Conocenos" con perfiles de equipo (Poncho, Julio, Karina) + LinkedIn
- Boton "Agendar" en cada card que scrollea al calendario
- Calendario de reunion integrado (fecha → hora → formulario → confirmacion)
- Navbar: "Agenda" renombrado a "Conocenos"
- Documentacion completa de secciones creada
- Auditoria extrema: 130+ elementos, 0 botones rotos

**Commit: feat(landing): add official logos, redesign hero and contact section**
- Logos oficiales del disenador en navbar (color) y footer (blanco)
- Hero producto: video "Que es Maity" reemplaza imagen persona
- Seccion contacto rediseñada con perfiles del equipo

**Commit: fix(landing): fix VideoCard variable declaration order**
- Fix critico: variable `autoThumbnail` usada antes de declararse
- Causa: pantalla negra en `/landing`

**Commit: feat(landing): add videos with thumbnails and scenarios section**
- 3 videos YouTube con reproduccion inline y auto-thumbnails
- ScenariosSection: 6 escenarios de practica con IA en seccion empresarial

**Commit: feat(landing): add community partner section**
- 3 tracks: Coach Certificado, Referenciador, Socio/Inversionista
- Stats strip: 30% comision, recurrente, $0 para empezar

**Commit: feat(landing): add careers and support center views**
- CareersView: 4 valores, 8 beneficios, 5 posiciones
- SoporteView: 3 canales, FAQ, quick links

**Commit: feat(landing): add resources hub, privacy policy and terms**
- ResourcesView: 8 recursos con filtro por categoria
- PrivacyPolicyView: 12 secciones (LFPDPPP, GDPR, CCPA)
- TermsOfServiceView: 14 secciones

**Commit: fix(landing): wire all broken buttons and add pricing trust badges**
- 12 botones rotos conectados
- Trust badges en precios (AES-256, GDPR, sin tarjeta, cancela cuando quieras)
