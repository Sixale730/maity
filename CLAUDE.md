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
OAuth → ensureUser() → try autojoin by domain → finalize invite (cookie) → check my_roles()/my_phase() → redirect
```

### Organization Assignment
1. **Autojoin**: Email domain matching (`maity.companies.domain` + `auto_join_enabled`)
2. **Invite**: HttpOnly cookie system via `/api/accept-invite` + `/api/finalize-invite`

## Navigation System (Card-Based)

La plataforma usa un sistema de navegación basado en cards estilo Notion/Linear, sin sidebar tradicional.

**Estructura:**
- `/dashboard` y `/home` → NavigationHub (hub principal con cards)
- `/stats` → Dashboard con métricas y gráficos (accesible desde card "Dashboard" en NavigationHub)
- Header sticky con logo + selector de rol (admins) + selector de idioma + menú de usuario

**Componentes** (`src/features/navigation/`):
- `NavigationHub` - Página principal con todas las cards
- `NavigationHeader` - Header superior con logo y menú usuario
- `NavigationCard` - Card individual (icono + título + descripción)
- `NavigationCardGroup` - Grupo de cards con encabezado de sección
- `UserNavigationSection` - Secciones: Perfil, Práctica, Progreso, Equipo, Config
- `AdminNavigationSection` - Sección separada con divisor para herramientas admin

**Roles:**
- **User (8 cards)**: Dashboard (→/stats), Avatar, Primera Entrevista, Roleplay, Ruta de Aprendizaje, Progreso, Historial, Conversaciones Omi
- **Manager (+5 cards)**: Progreso Equipo, Mi Equipo, Planes, Documentos, Ajustes
- **Admin (+13 cards)**: Coach, Config Agentes, Recursos IA, Galería Avatares, Demo, Analytics, Organizaciones, Usuarios, Reports, Trends, Tech Week, etc.

**Configuración:** `src/features/navigation/data/navigation-items.ts`

## Core Features Reference

| Feature | Location | Route | Key Files |
|---------|----------|-------|-----------|
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

**Rutas:**
- `/omi` - Lista de conversaciones con detalle expandible
- `/stats` - Dashboard con sección de estadísticas Omi (todos los roles)

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
- Invite cookies: `.maity.com.mx` domain only
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
