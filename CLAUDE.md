# Maity - Mental Wellness Platform

## Project Overview
Maity is a mental wellness platform built with React/TypeScript that provides role-based access for users, managers, and administrators. Features dashboards, session tracking, and organization management with sophisticated authentication.

**Architecture Score: 7.5/10** - Feature-based architecture, DDD in monorepo, TypeScript strict mode

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RPC functions)
- **State**: React Query, React Context
- **Forms**: React Hook Form + Zod validation

## Architecture Principles

### Feature-Based Architecture
Code organized by business domain rather than technical type. Each feature is self-contained with pages, components, hooks, and logic.

### Domain-Driven Design (DDD)
```
packages/shared/src/domain/
├── auth/         # auth.service.ts, auth.types.ts, hooks/
├── roleplay/     # roleplay.service.ts, roleplay.types.ts, hooks/
└── [domain]/     # Service, types, hooks pattern
```

### Layered Architecture
```
┌─────────────────────────────────────┐
│ Presentation Layer (src/features)   │  ← UI Components
├─────────────────────────────────────┤
│ Domain Layer (@maity/shared)        │  ← Business Logic
├─────────────────────────────────────┤
│ API Layer (api/)                    │  ← Serverless Functions
├─────────────────────────────────────┤
│ Data Layer (Supabase)               │  ← Database, RPC
└─────────────────────────────────────┘
```

**Layer Rules:**
1. Upper layers depend on lower layers
2. Lower layers NEVER depend on upper layers
3. Business logic in Domain Layer
4. UI components are thin

## Development Commands
```bash
npm run dev          # Development server
npm run dev:api      # Local API development
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Lint code
npm run test         # Run tests
```

## Project Structure

### Core Structure
```
/maity
├── src/
│   ├── features/        # Feature modules (auth, coach, dashboard, organizations, roleplay)
│   ├── components/      # Global components
│   ├── ui/              # shadcn/ui components
│   ├── contexts/        # Global contexts
│   ├── lib/env.ts       # Centralized environment variables
│   └── App.tsx
├── packages/shared/     # @maity/shared - Domain Layer
│   └── src/
│       ├── api/         # Supabase client
│       ├── domain/      # DDD layer (services, types, hooks)
│       ├── services/    # Infrastructure services
│       └── types/       # Shared types
├── api/                 # Serverless API Functions
└── supabase/migrations/ # Database schema
```

## Environment Variables
**ALWAYS use `src/lib/env.ts` in frontend, direct `process.env` in API**

Required:
- `SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `CORS_ORIGINS`, `COOKIE_DOMAIN`, `VITE_API_URL`

## Authentication & Authorization

### User Roles
- `admin`: Platform administrators
- `manager`: Organization managers
- `user`: Regular users

### Authentication Flow
1. OAuth Login → `/auth/callback`
2. Check `my_roles()` for admin/manager → `/dashboard`
3. Otherwise check `my_phase()`:
   - `ACTIVE` → `/dashboard`
   - `REGISTRATION` → `/registration`
   - `NO_COMPANY`/`PENDING` → `/pending`

### User Phases
- `ACTIVE`: Ready to use platform
- `REGISTRATION`: Needs registration
- `NO_COMPANY`/`PENDING`: Needs invitation
- `UNAUTHORIZED`: Not logged in

### Organization Assignment

Maity uses a **hybrid system** for assigning users to organizations:

#### 1. Autojoin by Domain (Primary Method)
- **When**: User completes OAuth login
- **How**: Extracts domain from email (e.g., `user@acme.com` → `acme.com`)
- **Process**:
  1. Checks if `maity.companies` has `domain = 'acme.com'` AND `auto_join_enabled = true`
  2. If match found AND user has NO `company_id` → Auto-assigns to company with role `user`
  3. If NO match OR user already has company → Falls back to invite system
- **Service**: `AutojoinService.tryAutojoinByDomain(email)`
- **RPC**: `try_autojoin_by_domain(p_email)`
- **Hook**: `useAutojoinCheck()` - Check if user has company

#### 2. Invitation System (Fallback Method)
- **When**: No autojoin match OR special cases (manager invites, etc.)
- **Process**:
  1. Accept Invite (`/api/accept-invite`): Sets HttpOnly cookie with invite token
  2. User Login → OAuth flow
  3. Finalize Invite (`/api/finalize-invite`): Reads cookie, links user to company
- **Service**: `finalizeInvite(accessToken)`
- **RPC**: `accept_invite(p_invite_token)`

#### Auth Callback Flow (src/features/auth/pages/AuthCallback.tsx)
```
OAuth Success → ensureUser()
             → try autojoin by domain
             → if no autojoin: try finalize invite (cookie)
             → if no invite: redirect to /pending
             → check my_roles() and my_phase()
             → redirect to appropriate page
```

## Database Functions (Supabase RPC)

**CRITICAL**: Functions in `maity` schema MUST have PUBLIC wrapper:
```sql
-- Step 1: Create in maity schema
CREATE FUNCTION maity.my_function(...) SECURITY DEFINER;

-- Step 2: Create PUBLIC wrapper (REQUIRED!)
CREATE FUNCTION public.my_function(...) AS $$
BEGIN
  RETURN maity.my_function(...);
END;
$$ SECURITY DEFINER;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.my_function TO authenticated;
```

Key functions: `my_phase()`, `my_roles()`, `get_user_role()`, `get_user_info()`, `otk()`, `create_evaluation()`, `try_autojoin_by_domain()`

### Autojoin Configuration

**Database Schema** (`maity.companies`):
- `domain` (TEXT): Email domain for autojoin (e.g., `acme.com`)
- `auto_join_enabled` (BOOLEAN): Enable/disable autojoin for this domain

**Security:**
- Only ONE company can claim a domain for autojoin (unique constraint)
- Only users WITHOUT existing `company_id` can autojoin (prevents transfers)
- Autojoin users always receive `user` role (not admin/manager)
- RLS policies: Users see own company, admins see/edit all

**Admin Configuration:**
To enable autojoin for a company:
```sql
UPDATE maity.companies
SET domain = 'acme.com',
    auto_join_enabled = true
WHERE id = 'company-uuid';
```

**Typical Use Cases:**
- Corporate domains: `@company.com` → Company organization
- Educational: `@university.edu` → University organization
- Teams: `@team.startup.io` → Team workspace

## Code Conventions

### Component Guidelines
- **Size Limits**: < 200 lines (target), 200-400 (warning), > 400 (MUST refactor)
- **Single Responsibility**: ONE reason to change
- **Separate concerns**: UI from business logic

```typescript
// ❌ DON'T: Mixed concerns
function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.from('users').select('*').then(data => setUser(data));
  }, []);
  return <div>{user?.name}</div>;
}

// ✅ DO: Separate concerns
function UserProfile() {
  const { user, isLoading } = useUserProfile();
  if (isLoading) return <Loading />;
  return <div>{user?.name}</div>;
}
```

### Naming Conventions
- **Components**: PascalCase (`UserDashboard`)
- **Files**: Match component name (`UserDashboard.tsx`)
- **Services**: `.service.ts` suffix
- **Hooks**: `use` prefix (`useUserProfile.ts`)
- **Types**: `.types.ts` suffix
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Hook Organization
```
src/features/*/hooks/          # Feature-specific UI hooks
packages/shared/src/hooks/     # Shared business hooks
packages/shared/src/domain/*/hooks/ # Domain logic hooks
```

### Export Patterns
- **Default exports**: Components
- **Named exports**: Utilities, hooks, services
- **Barrel exports**: Features (`index.ts`)

### Service Layer Patterns
```typescript
// ✅ Always use services for business logic
export class AuthService {
  static async getMyRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase.rpc('my_roles');
    if (error) throw error;
    return data || [];
  }
}

// Component uses service
function MyComponent() {
  const { data: roles } = useQuery({
    queryKey: ['user', 'roles'],
    queryFn: () => AuthService.getMyRoles(),
  });
}
```

### TypeScript Standards
- Always provide explicit types
- Use discriminated unions for state
- No implicit `any`

### Error Handling
```typescript
// Consistent pattern
try {
  const { data, error } = await supabase.rpc('my_function');
  if (error) {
    console.error('Error in my_function:', error);
    throw error;
  }
  return data;
} catch (err) {
  console.error('Unexpected error:', err);
  throw err;
}

// User-facing
import { toast } from '@/ui/components/ui/use-toast';
toast({
  variant: 'destructive',
  title: 'Error',
  description: 'Failed to create session. Please try again.',
});
```

## Testing Standards

### Testing Philosophy
All new features MUST include tests. Focus on:
- **Services**: >80% coverage (CRITICAL)
- **Hooks**: >70% coverage
- **Utilities**: >90% coverage
- **Components**: >50% coverage

### Basic Setup
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
```

### Example Test
```typescript
// Service test
describe('AuthService', () => {
  it('should return user roles', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: ['admin', 'user'],
      error: null,
    });
    const result = await AuthService.getMyRoles();
    expect(result).toEqual(['admin', 'user']);
  });
});
```

## Performance & Optimization

### Component Optimization
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable callbacks

### Code Splitting
```typescript
const RoleplayPage = lazy(() => import('@/features/roleplay/pages/RoleplayPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/roleplay" element={<RoleplayPage />} />
      </Routes>
    </Suspense>
  );
}
```

### React Query
```typescript
useQuery({
  queryKey: ['user', 'profile'],
  queryFn: () => UserService.getCurrentUser(),
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Common Antipatterns

### ❌ Massive Components
Components > 400 lines → Split into smaller components

### ❌ Business Logic in Components
Move to services and hooks

### ❌ Direct Supabase Calls
Always use services

### ❌ Prop Drilling
Use context or React Query

### ❌ Inconsistent Error Handling
Use standard pattern

### ❌ No TypeScript Types
Always use explicit types

## Important Notes

### Voice Evaluation System

**Current Architecture (OpenAI Direct):**
1. **Frontend**: Creates `voice_session` → ElevenLabs conversation
2. **Frontend**: Calls `/api/evaluate-session` with Bearer token
3. **Backend**: Calls OpenAI API directly (gpt-4o-mini)
4. **Backend**: Saves evaluation → Updates session
5. **Frontend**: Receives result synchronously (3-10s)

**Safeguards:**
- **Rate limiting**: 5 evaluations/min per user
- **Daily quota**: 50 evaluations/day per user
- **Retry logic**: 3 attempts with exponential backoff
- **Timeout**: 25s max per OpenAI call
- **Cost tracking**: Logged in backend console

**Environment variables:**
- `OPENAI_API_KEY` (server-side only, required)
- `VITE_OPENAI_MODEL` (optional, default: gpt-4o-mini)
- `VITE_ELEVENLABS_API_KEY_TEST`, `VITE_ELEVENLABS_AGENT_ID_TEST`

**Legacy (deprecated):**
- n8n webhook system (being phased out)
- `/api/evaluation-complete` endpoint (can be removed)

### User Level System
Maity includes a gamification system with 5 progression levels to motivate users.

**Levels:**
1. **Aprendiz** (Beginner) 🌱 - Starting level for all new users
2. **Promesa** (Promise) ⭐ - Shows potential and consistent progress
3. **Guerrero** (Warrior) ⚔️ - Faces challenges with courage
4. **Maestro** (Master) 👑 - Achieved notable excellence
5. **Leyenda** (Legend) 🏆 - Maximum mastery level

**Database:**
- Column: `maity.users.level` (INTEGER, default: 1)
- Constraint: CHECK (level >= 1 AND level <= 5)
- Index: `idx_users_level` for efficient queries

**Architecture:**
- Location: `src/features/levels/`
- Components: `LevelBadge`, `LevelsTable`, `LevelsIntroPage`
- Utils: `getLevelInfo()`, `getAllLevels()`, `getLevelName()`
- Types: `LevelNumber`, `LevelInfo`, `LEVEL_NAMES`

**User Flow:**
1. User completes registration form (20 questions including consent)
2. Redirected to `/levels-intro` page showing all 5 levels
3. User sees they start as "Aprendiz" (Level 1)
4. Dashboard displays current level in "Mi Nivel" card (replaces "Upcoming Sessions")

**Registration Form:**
- **20 questions total:** 4 personal + 12 Likert + 3 open-ended + 1 consent
- **Question 20 (q20):** Consent checkbox - "Acepto el uso de mis respuestas con fines de desarrollo personal. No se compartirán sin mi permiso."
- **Location:** `src/features/auth/pages/Registration.tsx`, `NativeRegistrationForm.tsx`
- **Types:** `packages/shared/src/domain/registration/registration.types.ts`

**Future Enhancement:**
- Level progression logic to be determined (may be based on diagnostic score, completed sessions, or combination)

### Tech Week - Admin Practice Section
Tech Week is a specialized voice practice feature for admin-only testing and demonstration.

**Key Features:**
- Simplified flow (no questionnaire, single scenario)
- Pink/rose color theme for visual distinction
- Admin-only access via `AdminRoute` component
- Uses dedicated agent ID: `agent_3301k8nsyp5jeqfb84n0y0p5jd2g`

**Architecture:**
- Location: `src/features/tech-week/`
- Routes: `/tech-week`, `/tech-week/sessions`, `/tech-week/sessions/:sessionId`
- Database: `voice_agent_profiles` (Tech Week), `voice_scenarios` (tech_week_general)
- Agent ID: `VITE_ELEVENLABS_TECH_WEEK_AGENT_ID`

**Components:**
- `TechWeekPage` - Main practice page
- `TechWeekVoiceAssistant` - Voice interaction (pink theme)
- `TechWeekParticleSphere` - Animated orb with pink colors
- `TechWeekInstructions` - Scenario instructions
- `TechWeekResultsPage` - Session results
- `TechWeekSessionsPage` - Session history

**Access Control:**
- Protected by `AdminRoute` component
- Only users with `admin` role can access
- Automatically redirects non-admins to dashboard

### Security
- HttpOnly cookies for invites
- CORS validation on all API endpoints
- Service role key server-side only
- No sensitive data client-side

### Registration & Tally Integration
- OTK/Token system for Tally forms
- Form submissions via tally-webhook.js
- Canonical URL: `https://www.maity.com.mx`

## Development Workflow

### Local Development
```bash
# Terminal 1 - API server
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

### Best Practices
1. Use todo list tool for complex tasks
2. Read existing code before changes
3. Follow established patterns
4. Test authentication flows
5. Use centralized env variables
6. Prefer editing over creating files
7. Write tests for new features
8. Keep components < 400 lines
9. Use services for business logic

### Development Checklist

**New Feature:**
- [ ] Feature folder in `src/features/[name]/`
- [ ] Domain services in `packages/shared/src/domain/[name]/`
- [ ] Types in `*.types.ts`
- [ ] Tests for services and hooks
- [ ] Update routing in `App.tsx`

**New Component:**
- [ ] < 400 lines (target < 200)
- [ ] Single responsibility
- [ ] Business logic in hooks/services
- [ ] TypeScript strict types
- [ ] Handle loading/error states

### API Development
- Use `process.env` directly (not `src/lib/env.ts`)
- Fallbacks: `process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL`
- CORS headers required
- Migrate to TypeScript + Zod validation

### API Template
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const RequestSchema = z.object({
  userId: z.string().uuid(),
});

const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin || '';
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    const body = RequestSchema.parse(req.body);
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Business logic
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
```

## Known Issues
- Invite cookies domain restrictions (`.maity.com.mx`)
- Role transitions may need page refresh
- CORS issues in dev resolved by local Vercel server
- OTK function requires service_role permissions

## Critical Reminders
- Usa siempre rutas propias
- No uses el color platino en diseños, solo para textos
- Cada vez que recuperes datos de la DB, exponer función RPC a public con wrapper
- Cada sección debe tener su propia ruta
- Memoriza proceso para agregar nuevas rutas
- Cuando vayamos a implementar algo que tenga que ver con la base de datos c:\maity\docs\database-structure-and-rls.md analiza ese documento antes de realizar la implementacion y basarte en lo que ya hay antes de las modificaciones
- siempre que hagas modificaciones de cualquier cosa que tenga que ver con la db actualiza el archivo c:\maity\docs\database-structure-and-rls.md con los cambios para que siempre este actualizado