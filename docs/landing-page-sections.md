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

**Commit: feat(landing): align with business model, fix legal, update pricing and gamification**
- Entidad legal corregida: "Maity Inc." → "Maity SAPI de CV" en Privacy, Terms y Footer
- Precios B2C alineados al documento maestro: Explorador(Gratis) / Escalador($15-19 USD) / Guia($39-49 USD)
- Precios B2B alineados: Equipo($12-15 USD/user) / Organizacion($10-12 USD/user) / Enterprise(Custom)
- La Escalada rediseñada: 6 Montanas tematicas (Claridad, Empatia, Persuasion, Consultor, Negociador, Servicio) con 5 campamentos cada una
- Arquetipos quiz renombrados: Estratega / Conector / Analitico (de los 6 tipos oficiales)
- Nota "1 de 6 tipos de comunicador" agregada al resultado del quiz
- CommunityPartnerSection actualizada: Coach(30%), Referenciador(15%), Embajador Corporativo(10%)
- Nueva seccion PilotSection: piloto B2B 30 dias gratis, 4 pasos, stats, CTA
- Nueva seccion SolucionesGrid: 4 areas (Ventas, Liderazgo, Servicio, Equipos Remotos) en business view
- Nueva seccion WearableSection: specs hardware (mic, BLE 5.0, 16h bateria, 35g, companion app)
- Tablas comparativas actualizadas para ambos tabs (individual y empresas)

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
