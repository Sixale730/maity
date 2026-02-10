# Maity - Mental Wellness Platform

## Overview
React/TypeScript mental wellness platform with role-based access (admin/manager/user). Features dashboards, session tracking, voice practice with AI evaluation.

**Tech Stack:** React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, Supabase (PostgreSQL + Auth + RPC), React Query

## Commands
```bash
npm run dev          # Frontend dev server
npm run dev:api      # Local API server
npm run build        # Production build
npm run lint && npm run test
```

## Architecture

### Layered Structure
```
src/features/        → UI Components (Presentation)
packages/shared/     → Business Logic (Domain - @maity/shared)
api/                 → Serverless Functions
supabase/           → Database, RPC
```

### Project Structure
```
src/
├── features/        # auth, coach, dashboard, navigation, organizations, roleplay, avatar, levels, tech-week, ai-resources, agent-config, hero-journey
├── components/      # Global components
├── ui/              # shadcn/ui
├── contexts/        # Global contexts
└── lib/env.ts       # Environment variables (frontend)

packages/shared/src/
├── domain/          # DDD: [feature]/service.ts, types.ts, hooks/
└── api/             # Supabase client
```

## Critical Rules

### Database Functions (RPC)
**ALWAYS create PUBLIC wrapper for maity schema functions:**
```sql
CREATE FUNCTION maity.fn(...) SECURITY DEFINER;
CREATE FUNCTION public.fn(...) AS $$ RETURN maity.fn(...); $$ SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.fn TO authenticated;
```

### Environment Variables
- **Frontend**: Use `src/lib/env.ts`
- **API**: Use `process.env` directly with fallbacks

### Code Conventions
| Rule | Standard |
|------|----------|
| Component size | <200 lines (target), >400 MUST refactor |
| Business logic | Always in services, never in components |
| Supabase calls | Always through services |
| TypeScript | Explicit types, no implicit any |
| Naming | Components: PascalCase, hooks: use*, services: .service.ts |

## Authentication

### Roles & Phases
- **Roles**: `admin`, `manager`, `user`
- **Phases**: `ACTIVE` → dashboard, `REGISTRATION` → /registration, `NO_COMPANY`/`PENDING` → /pending

### Auth Flow
```
OAuth → ensureUser() → try autojoin by domain → check my_roles()/my_phase() → redirect
```

### Organization Assignment
- **Autojoin**: Email domain matching (`maity.companies.domain` + `auto_join_enabled`)

## Navigation System (Sidebar + Cards)

La plataforma usa un sistema de navegación dual: sidebar permanente (shadcn/ui) + cards en el NavigationHub.

**Estructura:**
- `/dashboard` y `/home` → NavigationHub (hub principal con cards)
- `/stats` → Dashboard con métricas y gráficos (accesible desde card "Dashboard" en NavigationHub)
- Sidebar permanente con logo, grupos de navegación y footer de usuario
- Header sticky con selector de rol (admins) + selector de idioma + menú de usuario

**Sidebar** (`src/features/sidebar/`):
- `AppSidebar` - Componente principal del sidebar (Sidebar de shadcn/ui con collapsible="icon")
- `SidebarNavGroup` - Grupo colapsable de items (usa SidebarGroup/SidebarGroupLabel)
- `SidebarNavItem` - Item individual con icono, texto, active state y tooltip
- `SidebarUserFooter` - Footer con avatar, nombre y dropdown (perfil, settings, logout)
- `useSidebarNavigation` - Hook que filtra items por `viewRole` y agrupa por sección

**Comportamiento responsive:**
| Dispositivo | Comportamiento |
|-------------|----------------|
| Desktop (>1024px) | Sidebar expandido, colapsable a iconos via rail o Ctrl+B |
| Tablet (768-1024px) | Sidebar visible, colapsable |
| Móvil (<768px) | Oculto, hamburger en header abre Sheet |

**Cards (NavigationHub)** (`src/features/navigation/`):
- `NavigationHub` - Página principal con todas las cards
- `NavigationHeader` - Header superior con SidebarTrigger (móvil) + logo + menú usuario
- `NavigationCard` - Card individual (icono + título + descripción)
- `NavigationCardGroup` - Grupo de cards con encabezado de sección
- `UserNavigationSection` - Secciones: Perfil, Práctica, Progreso, Equipo, Config
- `AdminNavigationSection` - Sección separada con divisor para herramientas admin

**Layout** (`src/layouts/AppLayout.tsx`):
- `SidebarProvider` envuelve todo el layout con `defaultOpen={true}`
- `AppSidebar` se renderiza junto a `SidebarInset` (contenido principal)
- Estado expandido/colapsado se persiste en cookie

**Roles:**
- **User (8 items)**: Dashboard (→/stats), Avatar, Primera Entrevista, Roleplay, Ruta de Aprendizaje, Progreso, Historial, Conversaciones Omi
- **Manager (+5 items)**: Progreso Equipo, Mi Equipo, Planes, Documentos, Ajustes
- **Admin (+15 items)**: Dashboard Gamificado, Coach, Config Agentes, Recursos IA, Galería Avatares, Demo, Analytics, Organizaciones, Usuarios, Reports, Trends, Tech Week, Hero Journey, Convertidor SVG, etc.

**Grupos del sidebar:** profile, practice, progress, team, config, admin (separado visualmente)

**Configuración:** `src/features/navigation/data/navigation-items.ts`

## Core Features Reference

| Feature | Location | Route | Key Files |
|---------|----------|-------|-----------|
| **Sidebar** | `src/features/sidebar/` | (all pages) | AppSidebar, SidebarNavGroup, SidebarNavItem, SidebarUserFooter |
| **Navigation** | `src/features/navigation/` | `/dashboard`, `/home` | NavigationHub, NavigationHeader, NavigationCard |
| **Dashboard** | `src/features/dashboard/` | `/stats` | UserDashboard, PlatformAdminDashboard, OmiStatsSection |
| **Omi** | `src/features/omi/` | `/omi` | OmiConversationsPage, OmiConversationDetail |
| **Roleplay** | `src/features/roleplay/` | `/roleplay` | RoleplayPage, VoiceAssistant, SessionResults |
| **Coach** | `src/features/coach/` | `/coach` | CoachPage, diagnostic-interview.service |
| **Avatar** | `src/features/avatar/` | `/avatar` | VoxelAvatar, 15 characters, 20 items |
| **Levels** | `src/features/levels/` | `/levels-intro` | 5 levels: Aprendiz→Leyenda |
| **Tech Week** | `src/features/tech-week/` | `/tech-week` | Admin-only, pink theme |
| **AI Resources** | `src/features/ai-resources/` | `/ai-resources` | Admin CRUD for resources |
| **Agent Config** | `src/features/agent-config/` | `/admin/agent-config` | Profile/Scenario editor |
| **Hero Journey** | `src/features/hero-journey/` | `/hero-journey` | Mountain roadmap editor, JourneyMap, JourneyEditor |
| **SVG Converter** | `src/features/svg-converter/` | `/admin/svg-converter` | ImageUploader, ConversionPreview, SVGGallery |
| **Gamified Dashboard** | `src/features/dashboard/components/gamified/` | `/gamified-dashboard` | GamifiedDashboard, MountainMap, MetricsPanel, InfoPanel |
| **Skills Arena** | `src/features/skills-arena/` | `/skills-arena` | SkillsArenaPage, TestCard, tests-catalog |
| **Wheel of Life** | `src/features/wheel-of-life/` | `/skills-arena/rueda-de-la-vida` | WheelOfLifePage, WheelRadarChart, useWheelOfLife |

## Game Sessions & XP System

Sistema unificado de juegos con tabla `maity.game_sessions` (JSONB flexible por `game_type`) y ledger de XP (`maity.xp_transactions`).

**Tablas:** `maity.game_sessions`, `maity.xp_transactions`, `maity.users.total_xp`

**RPCs:** `complete_game_session`, `get_my_game_sessions`, `get_my_xp_summary`

**Domain Layer:** `packages/shared/src/domain/games/`
- `GameService` - CRUD sessions, XP queries, wheel calculations, localStorage progress
- `useWheelOfLife` - Hook wizard: intro → assessment (12 areas) → review → results
- `useGameSessions` / `useXPSummary` - React Query wrappers

**XP Amounts (Wheel of Life):** Base 150 + Bonus 25 (score>=90) + First attempt 30 = Max 205

**Wheel of Life Flow:**
1. Skills Arena → click card → `/skills-arena/rueda-de-la-vida`
2. Intro → 12 areas one-by-one (slider actual/deseado + reason) → Review → Submit
3. Results: radar chart, strengths, weaknesses, gaps, recommendations, XP earned

## Gamified Dashboard

Dashboard gamificado con visualización de montaña/volcán y nodos de avance basados en conversaciones Omi.

**Estructura:**
- `GamifiedDashboard` - Orquestador principal, layout 3 columnas (dark theme)
- `MountainMap` - SVG procedural de volcán con 15 nodos en zigzag ascendente
- `MetricsPanel` - Panel izquierdo: XP, racha, score, competencias, rewards
- `InfoPanel` - Panel derecho: muletillas, ranking, feedback/insight
- `useGamifiedDashboardData` - Hook de datos (Omi conversations + mock data)

**Lógica de avance:** Cada 2 días con conversación Omi en el mes actual = 1 nodo avanzado (máx 15)

**Estados de nodos:** completed (cyan `#00f5d4`), current (pink `#f15bb5` pulsante), locked (gris `#4a5568`)

**Enemigos (checkpoints):** EL REGATEADOR (nodo 5), PICO DE PIEDRA (nodo 10), CASCO DE LAVA (nodo 15)

**Competencias (4 barras verticales tipo altímetro):** Claridad (#485df4), Estructura (#ff8c42), Propósito (#ffd93d), Empatía (#ef4444)

**Datos reales:** Conversaciones Omi (nodos), competencias (useFormResponses), streak (días consecutivos)
**Datos mock:** Score, ranking, rewards, muletillas

**Traducciones:** Claves `gamified.*` y `nav.gamified_dashboard` definidas en `src/contexts/LanguageContext.tsx` (es + en)

**Ruta:** `/gamified-dashboard` - Solo admin

## Dashboard System

El sistema de dashboards muestra diferentes vistas según el rol del usuario, pero todas incluyen las estadísticas personales de Omi.

**Dashboards por Rol:**
| Rol | Dashboard | Ubicación |
|-----|-----------|-----------|
| user | UserDashboard | `src/features/dashboard/components/dashboards/UserDashboard.tsx` |
| manager | OrgAdminDashboard | `src/features/dashboard/components/DashboardContent.tsx` |
| admin | PlatformAdminDashboard | `src/features/dashboard/components/dashboards/PlatformAdminDashboard.tsx` |

**Componentes Compartidos:**
- `OmiStatsSection` - Componente reutilizable que muestra estadísticas de conversaciones Omi del usuario actual. Se usa en los 3 dashboards. Ubicación: `src/features/dashboard/components/OmiStatsSection.tsx`

**Ruta:** `/stats` - Dashboard según el rol del usuario

## Omi Conversations

Sistema de grabación y análisis de conversaciones del dispositivo Omi.

**Tablas:**
- `maity.omi_conversations` - Conversaciones con título, overview, emoji, category, transcript_text, action_items (jsonb), communication_feedback (jsonb)
- `maity.omi_transcript_segments` - Segmentos de transcripción con speaker, is_user, start_time, end_time

**Campos de análisis (`communication_feedback`):**
- overall_score, clarity, engagement, structure (0-10)
- feedback (texto), strengths[], areas_to_improve[]
- radiografia?: { muletillas_detectadas: Record<string,number>, muletillas_total, muletillas_frecuencia, ratio_habla, palabras_usuario, palabras_otros }
- preguntas?: { preguntas_usuario[], preguntas_otros[], total_usuario, total_otros }
- temas?: { temas_tratados[], acciones_usuario: [{descripcion, tiene_fecha}], temas_sin_cerrar: [{tema, razon}] }

**Componentes de detalle (`src/features/omi/components/`):**
- `OmiConversationDetail` - Vista principal con estructura estilo Meeting Analysis
- `OmiAnalysisSections` - Componentes nuevos estilo Meeting Analysis:
  - `OmiHeaderSection` - Título centrado + metadata (emoji, categoría, duración, palabras)
  - `OmiResumenHero` - Gauge semicircular + score + descripción narrativa
  - `OmiKPIGrid` - Grid de 8 KPIs con emojis (estilo Meeting Analysis): muletillas, ratio, preguntas, palabras usuario, palabras otros, temas, compromisos, temas sin cerrar
  - `OmiScoreBars` - Cards individuales en grid 2 columnas con emoji + nombre + descripción del nivel + barra + score (clarity/engagement/structure)
  - `OmiFortalezasSection` - Lista de fortalezas con checks verdes
  - `OmiAreasSection` - Áreas de mejora estilo insights con bordes de color
  - `TranscriptSection` - Transcripción con avatares por speaker
- `ConversationSections` - Componentes reutilizables para radiografía:
  - `SectionLabel` - Etiqueta de sección con líneas decorativas
  - `MuletillasSection` - Barras horizontales con muletillas detectadas
  - `PreguntasSection` - Dos columnas: tus preguntas vs recibidas
  - `TemasSection` - Tags/chips para temas tratados
  - `AccionesSection` - Lista de compromisos con/sin fecha
  - `TemasSinCerrarSection` - Cards de temas pendientes con razón

**Estilo de KPI Cards (OmiKPIGrid):**
- Grid 4 columnas (2 en móvil)
- 8 cards con emojis (🗣️⚖️❓📝💬📋✅🚪)
- `border-t-[3px]` con color de acento dinámico
- Número en `text-3xl font-extrabold`
- Label + detalle descriptivo

**Estilo de Score Cards (OmiScoreBars):**
- Grid 2 columnas (1 en móvil)
- Cada métrica en Card individual
- Emoji de estado (🟢🟡🟠🔴) + nombre + descripción del nivel
- Barra de progreso + score numérico

**Estructura de secciones en detalle (orden):**
1. Header centrado (título + emoji + metadata)
2. Overview (descripción)
3. Resumen (gauge + score + feedback)
4. Radiografía Rápida (8 KPIs en grid)
5. Métricas de Comunicación (cards con barras de score)
6. Muletillas Detectadas
7. Análisis de Preguntas
8. Temas Tratados
9. Tus Compromisos
10. Temas Pendientes
11. Fortalezas a Mantener
12. Áreas de Mejora
13. Transcripción

**Rutas:**
- `/omi` - Lista de conversaciones con detalle expandible
- `/stats` - Dashboard con sección de estadísticas Omi (todos los roles)

## Web Recorder (Speaker Diarization)

Grabadora web con diarización de speakers similar al dispositivo Omi.

**Ubicación:** `src/features/web-recorder/`

**Componentes:**
- `RecordingContext` - Estado global: segments, speakerStats, primarySpeaker
- `LiveTranscript` - Muestra transcripción en tiempo real con avatares por speaker
- `SessionSummary` - Resumen con participantes detectados antes de guardar
- `authenticatedWebSocket` - Conexión a Deepgram con `diarize: true`

**Flujo de diarización:**
```
Mic → AudioCapture → Deepgram WS (diarize=true)
                          ↓
              words: [{ word, speaker }]
                          ↓
              handleTranscript() extrae speaker mayoritario
                          ↓
              speakerStats acumula palabras por speaker
                          ↓
              stopRecording() → determinePrimarySpeaker()
                          ↓
              saveRecording() → is_user = (speaker === primarySpeaker)
```

**Lógica de speaker primario:**
- Al detener grabación, el speaker con más palabras = usuario principal
- El nombre del usuario se obtiene de `maity.users.full_name`
- Otros speakers se etiquetan como "Participante N"

**UI de speakers:**
- Avatar circular: emerald para usuario, gris para otros
- Labels: "Tú" para usuario, "P1", "P2" para otros
- TranscriptStats muestra conteo de participantes

**Campos guardados en `omi_transcript_segments`:**
- `speaker` - Nombre (usuario o "Participante N")
- `speaker_id` - ID numérico del speaker de Deepgram
- `is_user` - true si es el speaker principal

**Debug Logs Panel:**
Panel colapsable en la UI durante la grabación para debugging detallado.

- `DebugLogsPanel` - Tabla de logs en tiempo real con auto-scroll
- Tipos de log: `WS_OPEN`, `WS_CLOSE`, `WS_ERROR`, `DEEPGRAM`, `SEGMENT`, `INTERIM`, `AUDIO`, `STATE`, `ERROR`, `SAVE`
- Muestra: timestamp, tipo con color/emoji, mensaje con detalles
- Botón "Copy" para exportar logs como JSON
- Máximo 500 entries para evitar memory issues

| Tipo | Color | Descripción |
|------|-------|-------------|
| `WS_OPEN` | green | WebSocket conectado |
| `WS_CLOSE` | red | WebSocket cerrado (con código) |
| `DEEPGRAM` | blue | Mensaje de Deepgram con flags is_final/speech_final |
| `SEGMENT` | purple | Segmento añadido a la lista |
| `INTERIM` | gray | Texto intermedio actualizado |
| `AUDIO` | yellow | Estadísticas de audio (cada 20 buffers ~5s) |
| `STATE` | orange | Cambio de estado de grabación |
| `ERROR` | red | Cualquier error |
| `SAVE` | green | Texto pendiente capturado al detener |
| `KEEPALIVE` | cyan | Keep-alive ping enviado a Deepgram |
| `STALL` | amber | Detección de stalling (sin respuesta por >15s) |

**WebSocket Resilience:**
Sistema de resiliencia para evitar desconexiones silenciosas de Deepgram.

- **Keep-Alive**: Se envía ping cada 8 segundos (`{ type: 'KeepAlive' }`) para mantener la conexión activa
- **Stall Detection**: Detecta cuando no hay respuesta de Deepgram por >15 segundos
- **Estado `isStalled`**: Disponible en el contexto para mostrar advertencia en la UI
- **UI de advertencia**: `LiveTranscript` muestra banner amber cuando `isStalled=true`

**Constantes de resiliencia:**
| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `KEEPALIVE_INTERVAL` | 8000ms | Intervalo de keep-alive |
| `STALL_THRESHOLD` | 15000ms | Tiempo sin respuesta para marcar stalled |
| `STALL_CHECK_INTERVAL` | 5000ms | Frecuencia de verificación de stalling |

**Navigation Guard (Protección de grabación):**
Sistema que protege contra pérdida de grabación cuando el usuario navega.

- `RecordingGuardModal` - Modal AlertDialog que ofrece guardar antes de salir
- `useNavigationGuard` - Hook que intercepta navegación con React Router `useBlocker`

**Protecciones implementadas:**
| Tipo de navegación | Protección |
|--------------------|------------|
| Sidebar / Links internos | Modal personalizado (Guardar y Salir / Continuar Grabando) |
| Browser back/forward | Modal personalizado via `useBlocker` |
| Cierre de pestaña / Refresh | Alerta nativa del browser (`beforeunload`) |

**Flujo de usuario:**
1. Usuario está grabando → intenta navegar
2. Se muestra modal con opciones
3. "Continuar Grabando" → modal cierra, sigue grabando
4. "Guardar y Salir" → detiene → guarda → navega a `/conversaciones?conversation=ID`

**Traducciones:** Claves `recorder.guard_*` en `src/contexts/LanguageContext.tsx` (es + en)

## Voice Evaluation System

**Flow**: Frontend creates session → ElevenLabs conversation → `/api/evaluate-session` → OpenAI (gpt-4o-mini) → Save to DB

**Safeguards**: 5 evals/min, 50/day, 3 retries, 25s timeout

**Re-evaluation**: Yellow button on session pages, admins can re-eval any, users only own sessions

## Coach Diagnostic Interview

Evaluates 6 communication competencies from Coach AI conversation:
1. **Claridad** (Clarity) - #485df4
2. **Adaptación** (Adaptation) - #1bea9a
3. **Persuasión** (Persuasion) - #9b4dca
4. **Estructura** (Structure) - #ff8c42
5. **Propósito** (Purpose) - #ffd93d
6. **Empatía** (Empathy) - #ef4444

**API**: `/api/evaluate-diagnostic-interview` → `maity.diagnostic_interviews` table

## Avatar System (3D Voxel)

**Tech**: React Three Fiber, Three.js, procedural BoxGeometry

**Characters (15)**: human, chicken, dog, lion_knight, knight, robot, kenney_human, cat, panda, bear, frog, wizard, ninja, chef, scientist

**Items (20)**: Weapons (sword, wand, bow, staff, dagger, spear), Tools (spatula, hammer, axe, pickaxe, shovel, wrench), Magic (shield, book, orb, potion, crystal), Back (cape, backpack, wings)

**Human customization**: head/body types, colors, accessories

## Agent Configuration

**One-agent-per-scenario**: Each scenario has ElevenLabs `agent_id` in `voice_scenarios.agent_id`

**Profile Fields**: name, description, key_focus, communication_style, personality_traits, area, impact

**Scenario Fields**: name, code (snake_case), order_index, context, objectives, skill, instructions, rules, closing, estimated_duration, category, agent_id

## Onboarding Flow

1. OAuth → `/registration`
2. **Step 1**: Avatar creation
3. **Step 2**: Instructions video
4. **Step 3**: 20-question questionnaire (4 personal + 12 Likert + 3 open + 1 consent)
5. `/levels-intro` → Dashboard

## API Template
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const Schema = z.object({ userId: z.string().uuid() });
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    const body = Schema.parse(req.body);
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
```

## Development Checklist

**New Feature:**
- [ ] `src/features/[name]/` with pages/, components/, hooks/
- [ ] `packages/shared/src/domain/[name]/` with service.ts, types.ts, hooks/
- [ ] Update `App.tsx` routing
- [ ] Tests for services

**New Component:**
- [ ] <400 lines, single responsibility
- [ ] Business logic in hooks/services
- [ ] Handle loading/error states

## Known Issues
- Role changes may need page refresh
- OTK requires service_role permissions

## Critical Reminders
- Usa siempre rutas propias (cada sección su propia ruta)
- No uses color platino en diseños (solo textos)
- Exponer SIEMPRE funciones RPC a public con wrapper
- **Antes de DB changes**: revisar `docs/database-structure-and-rls.md`
- **Después de DB changes**: actualizar `docs/database-structure-and-rls.md`

## Detailed Documentation
- Database schema & RLS: `docs/database-structure-and-rls.md`
- Avatar types: `packages/shared/src/domain/avatar/avatar.types.ts`
- Agent config types: `packages/shared/src/domain/agent-config/agent-config.types.ts`
- Coach types: `packages/shared/src/domain/coach/coach.types.ts`
