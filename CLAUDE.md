# Maity - Mental Wellness Platform

## Project Overview
Maity is a mental wellness platform built with React/TypeScript that provides role-based access for users, managers, and administrators. The platform features dashboards, session tracking, and organization management with a sophisticated authentication and invitation system.

**Architecture Score: 7.5/10** (as of 2025-10-16)
- ✅ Feature-based architecture
- ✅ Domain-Driven Design in monorepo
- ✅ TypeScript strict mode (0 errors)
- ⚠️ Testing infrastructure needed

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui components, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RPC functions)
- **Charts**: Recharts
- **Routing**: React Router v6
- **State Management**: React Query, React Context
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library (to be implemented)

## Architecture Principles

### Feature-Based Architecture
Maity follows a **feature-based architecture** where code is organized by business domain rather than by technical type. Each feature is self-contained with its own pages, components, hooks, and logic.

**Benefits:**
- ✅ Better code organization and discoverability
- ✅ Easier to scale and maintain
- ✅ Clear boundaries between features
- ✅ Facilitates parallel development

### Domain-Driven Design (DDD)
The `@maity/shared` package follows DDD principles with a clear domain layer:

```
packages/shared/src/domain/
├── auth/           # Authentication domain
│   ├── auth.service.ts
│   ├── auth.types.ts
│   └── hooks/
├── roleplay/       # Roleplay domain
│   ├── roleplay.service.ts
│   ├── roleplay.types.ts
│   └── hooks/
└── ...
```

**Domain Layer Responsibilities:**
- **Services**: Business logic and data operations
- **Types**: Domain models and interfaces
- **Hooks**: Reusable logic for components

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (src/features) │  ← UI Components, Pages
├─────────────────────────────────────┤
│   Domain Layer (@maity/shared)      │  ← Business Logic, Services
├─────────────────────────────────────┤
│   API Layer (api/)                  │  ← Serverless Functions
├─────────────────────────────────────┤
│   Data Layer (Supabase)             │  ← Database, RPC Functions
└─────────────────────────────────────┘
```

**Layer Rules:**
1. Upper layers can depend on lower layers
2. Lower layers NEVER depend on upper layers
3. Business logic stays in Domain Layer
4. UI components in Presentation Layer are thin

### Monorepo Structure
```
/maity
├── src/                    # Main application (Presentation Layer)
├── packages/
│   └── shared/            # Shared code (Domain Layer)
└── api/                   # Serverless functions (API Layer)
```

## Development Commands
```bash
# Development server
npm run dev

# Local API development (Vercel dev server)
npm run dev:api

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview

# Run tests (when implemented)
npm run test
npm run test:coverage
```

## Project Structure

### Complete Directory Structure
```
/maity
├── src/                          # Main Application (Presentation Layer)
│   ├── features/                 # ⭐ Feature-based modules
│   │   ├── auth/                 # Authentication feature
│   │   │   ├── components/       # Auth-specific components
│   │   │   ├── pages/            # Auth pages (Auth, Callback, Registration, etc.)
│   │   │   └── index.ts          # Barrel export
│   │   ├── coach/                # Coach feature
│   │   │   ├── components/       # Coach components
│   │   │   ├── pages/            # Coach pages
│   │   │   └── index.ts
│   │   ├── dashboard/            # Dashboard feature
│   │   │   ├── components/       # Dashboard components
│   │   │   ├── hooks/            # Dashboard-specific hooks
│   │   │   ├── pages/            # Dashboard pages by role
│   │   │   └── index.ts
│   │   ├── organizations/        # Organizations management
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   └── roleplay/            # Roleplay & voice practice feature
│   │       ├── components/       # Roleplay components
│   │       ├── pages/            # Roleplay pages
│   │       └── index.ts
│   ├── components/              # Global components
│   │   ├── FinalizeInviteWatcher.tsx
│   │   ├── LandingPage.tsx
│   │   └── PlatformTour.tsx
│   ├── ui/                      # shadcn/ui components
│   │   └── components/ui/       # 48 UI components
│   ├── contexts/                # Global contexts
│   │   ├── LanguageContext.tsx  # Internationalization
│   │   ├── PlatformTourContext.tsx
│   │   └── UserContext.tsx
│   ├── hooks/                   # App-specific hooks (UI-related)
│   ├── layouts/                 # Layout components
│   │   └── AppLayout.tsx
│   ├── lib/                     # Configuration & utilities
│   │   └── env.ts              # ⭐ Centralized environment variables
│   ├── pages/                   # Utility pages (Error, NotFound)
│   ├── routes/                  # Routing utilities
│   │   └── ProtectedRoute.tsx
│   ├── shared/                  # Shared utilities (consider moving to @maity/shared)
│   ├── types/                   # Type definitions
│   └── App.tsx
│
├── packages/                    # Monorepo packages
│   └── shared/                  # ⭐ @maity/shared - Shared code (Domain Layer)
│       └── src/
│           ├── api/             # Supabase client initialization
│           │   └── client.ts
│           ├── constants/       # Global constants
│           ├── contexts/        # Shared contexts
│           ├── domain/          # ⭐ Domain-Driven Design layer
│           │   ├── auth/
│           │   │   ├── auth.service.ts      # Auth business logic
│           │   │   ├── auth.types.ts        # Auth domain types
│           │   │   └── hooks/               # useAuthGuard, etc.
│           │   ├── coach/
│           │   │   ├── coach.service.ts
│           │   │   ├── coach.types.ts
│           │   │   └── hooks/
│           │   ├── dashboard/
│           │   ├── organizations/
│           │   ├── roleplay/
│           │   │   ├── roleplay.service.ts  # Roleplay business logic
│           │   │   ├── roleplay.types.ts
│           │   │   └── hooks/
│           │   └── users/
│           ├── hooks/           # Shared reusable hooks
│           ├── services/        # Infrastructure services
│           ├── types/           # Shared types (database types, etc.)
│           └── utils/           # Utility functions
│
├── api/                         # Serverless API Functions (API Layer)
│   ├── accept-invite.js         # Process invitation links (sets cookie)
│   ├── complete-short-evaluation.js  # Complete short evaluations
│   ├── decode-opus.js           # Audio decoding
│   ├── elevenlabs-conversation-token.js  # ElevenLabs token generation
│   ├── elevenlabs-signed-url.js # Generate signed URLs for ElevenLabs
│   ├── evaluation-complete.js   # Update evaluation results from n8n
│   ├── finalize-invite.js       # Link user to company (consumes cookie)
│   ├── tally-link.js            # Generate Tally form URLs with OTK tokens
│   ├── tally-webhook.js         # Handle Tally form submissions
│   └── test-tally-fields.js     # Test endpoint (remove in production)
│
└── supabase/
    └── migrations/              # Database schema and functions (86 migrations)
```

### Key Organization Patterns

**Features (`src/features/`):**
- Each feature is self-contained
- Structure: `pages/`, `components/`, `hooks/`, `index.ts`
- Example: `roleplay/` contains all roleplay-related UI code

**Domain Layer (`packages/shared/src/domain/`):**
- Business logic separated from UI
- Each domain: service, types, hooks
- Example: `AuthService.getMyRoles()` handles auth logic

**Shared Package (`@maity/shared`):**
- Reusable code across features
- Domain services, types, hooks
- Infrastructure utilities

## Environment Variables
**ALWAYS use centralized `src/lib/env.ts` instead of direct `process.env` access**

Required variables:
- `SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `CORS_ORIGINS` (API endpoints)
- `COOKIE_DOMAIN` (invite system)
- `VITE_API_URL` (local development API endpoint)
- `TALLY_FORM_URL` (Tally form integration)
- `TALLY_WEBHOOK_SECRET` (Tally webhook validation)

## Authentication & Authorization

### User Roles
- `admin` (formerly platform_admin): Platform administrators
- `manager` (formerly org_admin): Organization managers
- `user`: Regular users

### Authentication Flow
1. **OAuth Login** → `Auth.tsx` → `/auth/callback`
2. **Callback Processing** → `AuthCallback.tsx`:
   - First check `my_roles()` for admin/manager → direct to `/dashboard`
   - Otherwise check `my_phase()`:
     - `ACTIVE` → `/dashboard`
     - `REGISTRATION` → `/registration`
     - `NO_COMPANY`/`PENDING` → `/pending`

### User Phases (my_phase RPC function)
- `ACTIVE`: User ready to use platform
- `REGISTRATION`: User needs to complete registration form
- `NO_COMPANY`/`PENDING`: User needs company invitation
- `UNAUTHORIZED`: Not logged in

### Invitation System
1. **Accept Invite** (`/api/accept-invite`): Sets HttpOnly cookie with invite token
2. **User Login** → OAuth flow
3. **Finalize Invite** (`/api/finalize-invite`):
   - Links user to company
   - Assigns role based on invite audience
   - Clears invite cookie

## Database Functions (Supabase RPC)
- `my_phase()`: Returns user's current phase/status
- `my_roles()`: Returns array of user roles
- `get_user_role()`: Returns primary user role
- `get_user_info()`: Returns user profile data
- `otk(p_auth_id, p_ttl_minutes)`: Generates one-time tokens for Tally form integration
- `create_evaluation(p_request_id, p_user_id, p_session_id)`: Creates evaluation records for voice transcript processing

### Important RPC Pattern
⚠️ **ALWAYS use RPC functions for operations that require special permissions or bypass RLS**. Direct table operations from the frontend will fail with permission errors.

**CRITICAL**: Functions in `maity` schema MUST have a PUBLIC wrapper function to be accessible from the Supabase client:
```sql
-- Step 1: Create function in maity schema
CREATE FUNCTION maity.my_function(...) RETURNS ... AS $$ ... $$ SECURITY DEFINER;

-- Step 2: Create PUBLIC wrapper (REQUIRED!)
CREATE FUNCTION public.my_function(...) RETURNS ... AS $$
BEGIN
  RETURN maity.my_function(...);
END;
$$ SECURITY DEFINER;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.my_function TO authenticated;
```

Common patterns:
- Creating records in restricted tables → Use RPC wrapper function
- Complex operations with multiple table updates → Use RPC transaction
- Operations requiring service role permissions → Use RPC with SECURITY DEFINER

## Code Conventions

### Environment Variables
```typescript
// ❌ DON'T (Frontend)
const url = process.env.SUPABASE_URL;

// ✅ DO (Frontend)
import { env } from '@/lib/env';
const url = env.supabaseUrl;

// ✅ OK (API endpoints - they can't import from src/)
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
```

### Component Guidelines

#### Size Limits
**CRITICAL:** Keep components maintainable by limiting their size:
- ✅ **Target**: < 200 lines per component
- ⚠️ **Warning**: 200-400 lines (consider refactoring)
- ❌ **Critical**: > 400 lines (MUST refactor)

**How to Reduce Component Size:**
1. Extract custom hooks for complex logic
2. Split into smaller sub-components
3. Create context providers for shared state
4. Move business logic to domain services

```typescript
// ❌ DON'T: 1000+ line component with everything
export function RoleplayPage() {
  // 17 useState declarations
  // 15+ useEffect hooks
  // Mixed concerns: questionnaire, voice, results, evaluation
}

// ✅ DO: Split into focused components
export function RoleplayPage() {
  return (
    <RoleplayProvider>
      <RoleplayLayout>
        <RoleplayQuestionnaire />
        <RoleplayVoiceSession />
        <RoleplayResults />
      </RoleplayLayout>
    </RoleplayProvider>
  );
}
```

#### Component Responsibilities
**Single Responsibility Principle (SRP):**
- Each component should have ONE reason to change
- Separate UI rendering from business logic
- Use services for data operations
- Use hooks for reusable logic

```typescript
// ❌ DON'T: Mix concerns
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Business logic in component
    supabase.from('users').select('*').then(data => setUser(data));
  }, []);

  return <div>{user?.name}</div>;
}

// ✅ DO: Separate concerns
function UserProfile() {
  const { user, isLoading } = useUserProfile(); // Hook handles logic

  if (isLoading) return <Loading />;
  return <div>{user?.name}</div>;
}

// In packages/shared/src/domain/users/hooks/useUserProfile.ts
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => UserService.getCurrentUser(),
  });
}
```

### Naming Conventions

#### Components
- **PascalCase**: `UserDashboard`, `RoleplaySession`
- **Descriptive**: Name should describe what it does
- **Role-specific prefix**: `AdminDashboard`, `ManagerView`
- **No abbreviations**: `UserProfile` not `UsrProf`

#### Files
```typescript
// ✅ Component files match component name
UserDashboard.tsx          → export default function UserDashboard()
RoleplaySession.tsx        → export default function RoleplaySession()

// ✅ Service files use .service.ts
auth.service.ts            → export class AuthService
roleplay.service.ts        → export class RoleplayService

// ✅ Hook files use camelCase with 'use' prefix
useUserProfile.ts          → export function useUserProfile()
useRoleplaySession.ts      → export function useRoleplaySession()

// ✅ Type files use .types.ts
auth.types.ts              → export interface User, UserRole, etc.
```

#### Variables and Functions
```typescript
// ✅ camelCase for variables and functions
const userName = "John";
const fetchUserData = async () => {};

// ✅ UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const API_BASE_URL = "https://api.example.com";

// ✅ PascalCase for types and interfaces
interface UserProfile { }
type UserRole = 'admin' | 'manager' | 'user';
```

### Hook Organization

**Where to place hooks:**

```
src/hooks/                           # ❌ Avoid (legacy location)

src/features/*/hooks/                # ✅ Feature-specific hooks
├── auth/hooks/
│   └── useAuthForm.ts              # Only used in auth feature

packages/shared/src/hooks/           # ✅ Shared business hooks
├── useUserRole.ts                   # Used across multiple features
└── usePlatformTour.ts

packages/shared/src/domain/*/hooks/  # ✅ Domain-specific hooks
├── auth/hooks/
│   └── useAuthGuard.ts             # Auth domain logic
└── roleplay/hooks/
    └── useRoleplaySession.ts       # Roleplay domain logic
```

**Hook Rules:**
1. **UI Hooks** → `src/features/*/hooks/` (feature-specific UI logic)
2. **Business Hooks** → `packages/shared/src/hooks/` (cross-feature reusable)
3. **Domain Hooks** → `packages/shared/src/domain/*/hooks/` (domain logic)

### Export Patterns

**Prefer default exports for components:**
```typescript
// ✅ DO: Default export for components
export default function UserDashboard() { }

// ❌ AVOID: Named exports for page components
export function UserDashboard() { }  // Harder for code splitting
```

**Use named exports for utilities, hooks, services:**
```typescript
// ✅ DO: Named exports for utilities
export function formatDate(date: Date): string { }
export function validateEmail(email: string): boolean { }

// ✅ DO: Named exports for services
export class AuthService { }
export class RoleplayService { }
```

**Barrel exports for features:**
```typescript
// src/features/auth/index.ts
export { default as AuthPage } from './pages/Auth';
export { default as AuthCallbackPage } from './pages/AuthCallback';
export { default as RegistrationPage } from './pages/Registration';
export * from './components'; // Export all components
```

### Service Layer Patterns

**Always use services for business logic:**

```typescript
// ✅ DO: Service handles business logic
// packages/shared/src/domain/auth/auth.service.ts
export class AuthService {
  static async getMyRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase.rpc('my_roles');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting user roles:', err);
      throw err;
    }
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

```typescript
// ❌ DON'T: Business logic in component
function MyComponent() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    supabase.rpc('my_roles').then(({ data }) => setRoles(data));
  }, []);
}
```

### TypeScript Standards

**Always provide explicit types:**
```typescript
// ❌ DON'T: Implicit any
function fetchUser(id) {
  return supabase.from('users').select('*').eq('id', id);
}

// ✅ DO: Explicit types
async function fetchUser(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

**Use discriminated unions for state:**
```typescript
// ✅ DO: Discriminated union for loading states
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function MyComponent() {
  const [state, setState] = useState<AsyncState<User>>({ status: 'idle' });

  // TypeScript knows 'data' exists when status is 'success'
  if (state.status === 'success') {
    console.log(state.data.name);
  }
}
```

### Error Handling

**Consistent error handling pattern:**
```typescript
// ✅ DO: Standard error handling
try {
  const { data, error } = await supabase.rpc('my_function');

  if (error) {
    console.error('Error in my_function:', error);
    throw error;
  }

  return data;
} catch (err) {
  console.error('Unexpected error:', err);
  // Optional: Send to error tracking service
  throw err;
}
```

**User-facing errors:**
```typescript
// ✅ DO: User-friendly error messages
import { toast } from '@/ui/components/ui/use-toast';

try {
  await RoleplayService.createSession(userId, profileName);
  toast({ title: 'Success', description: 'Session created!' });
} catch (error) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Failed to create session. Please try again.',
  });
}
```

### Role Checking

**Use centralized role checking:**
```typescript
// ✅ DO: Use AuthService
import { AuthService } from '@maity/shared';

const roles = await AuthService.getMyRoles();
if (roles.includes('admin') || roles.includes('manager')) {
  // Admin/manager flow
}

// ✅ DO: Use hook for components
function AdminPanel() {
  const { isAdmin, isLoading } = useUserRole();

  if (isLoading) return <Loading />;
  if (!isAdmin) return <Unauthorized />;

  return <AdminContent />;
}

// ❌ DON'T: Direct RPC calls in components
const { data: roles } = await supabase.rpc('my_roles');
```

## Testing Standards

### Testing Philosophy
**CRITICAL:** All new features MUST include tests. Testing is not optional.

**Testing Pyramid:**
```
        ┌──────────────┐
        │   E2E Tests  │  ← Few, critical user flows
        ├──────────────┤
        │ Integration  │  ← Some, test feature interactions
        ├──────────────┤
        │ Unit Tests   │  ← Many, test individual units
        └──────────────┘
```

### Setup (To Be Implemented)

**Install dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
```

**Configuration files:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.config.ts', '**/types/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@maity/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@maity/shared', () => ({
  supabase: {
    auth: { getSession: vi.fn(), getUser: vi.fn() },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
  AuthService: {
    getMyRoles: vi.fn(),
    getMyPhase: vi.fn(),
  },
}));
```

### What to Test

#### ✅ MUST TEST (High Priority)

**1. Services (Domain Layer):**
```typescript
// packages/shared/src/domain/auth/__tests__/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { supabase } from '@maity/shared';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyRoles', () => {
    it('should return user roles', async () => {
      const mockRoles = ['admin', 'user'];
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockRoles,
        error: null,
      });

      const result = await AuthService.getMyRoles();

      expect(result).toEqual(mockRoles);
      expect(supabase.rpc).toHaveBeenCalledWith('my_roles');
    });

    it('should handle errors', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      await expect(AuthService.getMyRoles()).rejects.toThrow('Database error');
    });
  });
});
```

**2. Custom Hooks:**
```typescript
// packages/shared/src/domain/auth/__tests__/useUserRole.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUserRole } from '../hooks/useUserRole';
import { AuthService } from '../auth.service';

describe('useUserRole', () => {
  it('should return user role', async () => {
    vi.mocked(AuthService.getMyRoles).mockResolvedValueOnce(['admin']);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

**3. Utilities:**
```typescript
// packages/shared/src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '../formatters';

describe('Formatters', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('15/01/2025');
    });
  });
});
```

#### ⚠️ SHOULD TEST (Medium Priority)

**4. Complex Components:**
```typescript
// src/features/auth/pages/__tests__/Auth.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthPage from '../Auth';

describe('AuthPage', () => {
  it('should render login form', () => {
    render(<AuthPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should handle OAuth login', async () => {
    render(<AuthPage />);
    const googleButton = screen.getByRole('button', { name: /google/i });
    fireEvent.click(googleButton);
    // Assert OAuth flow initiated
  });
});
```

#### 🔵 OPTIONAL (Low Priority)

**5. Simple UI Components:**
- Only test if they have complex logic
- Simple presentational components usually don't need tests

### Coverage Requirements

**Minimum coverage targets:**
```
✅ Services:     >80% coverage (CRITICAL)
✅ Hooks:        >70% coverage (HIGH)
✅ Utilities:    >90% coverage (HIGH)
⚠️ Components:   >50% coverage (MEDIUM)
🔵 Types:        N/A (no runtime code)
```

**Check coverage:**
```bash
npm run test:coverage
```

### Testing Patterns

#### Pattern 1: Mocking Supabase
```typescript
import { vi } from 'vitest';
import { supabase } from '@maity/shared';

// Mock successful response
vi.mocked(supabase.rpc).mockResolvedValueOnce({
  data: mockData,
  error: null,
});

// Mock error
vi.mocked(supabase.rpc).mockResolvedValueOnce({
  data: null,
  error: new Error('Something went wrong'),
});
```

#### Pattern 2: Testing React Query Hooks
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const { result } = renderHook(() => useUserProfile(), {
  wrapper: createWrapper(),
});
```

#### Pattern 3: Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const promise = AuthService.login('user@example.com');

  // Use waitFor for async assertions
  await waitFor(() => {
    expect(mockLoginFunction).toHaveBeenCalled();
  });

  const result = await promise;
  expect(result).toBeDefined();
});
```

### Test Checklist

Before submitting code, ensure:
- [ ] All services have tests
- [ ] All custom hooks have tests
- [ ] All utilities have tests
- [ ] Complex components have tests
- [ ] Coverage meets minimum requirements
- [ ] All tests pass: `npm run test`
- [ ] No console errors or warnings in tests

## Important Notes

### Canonical URL
- Production canonical URL: `https://www.maity.com.mx`
- Automatic HTTPS redirect in production
- Development bypasses canonical validation

### Registration & Tally Integration
- **OTK/Token system**: Used for Tally form integration and validation
- **Tally Forms**: Registration completion handled via external Tally forms
- **Webhook Integration**: Form submissions processed via tally-webhook.js

### Security
- HttpOnly cookies for invite tokens
- CORS validation on all API endpoints
- Service role key only for server-side operations
- No sensitive data in client-side code

### Voice Evaluation System
The platform includes a voice roleplay evaluation system that integrates ElevenLabs for voice AI and n8n for transcript processing:

1. **Frontend Flow**:
   - User starts voice practice session → Creates `voice_session` record
   - Conversation with ElevenLabs agent → Real-time transcription
   - Session ends → Creates `evaluation` record with `pending` status
   - Sends webhook to n8n with `request_id` and transcript

2. **n8n Processing**:
   - Receives webhook at configured URL
   - Processes transcript with LLM chain
   - POSTs results back to API endpoint

3. **Backend Update** (`/api/evaluation-complete`):
   ```bash
   curl -X POST https://api.maity.com.mx/api/evaluation-complete \
     -H "Content-Type: application/json" \
     -H "X-N8N-Secret: your-secret-here" \
     -d '{
       "request_id": "550e8400-e29b-41d4-a716-446655440000",
       "status": "complete",
       "result": {
         "score": 85,
         "feedback": "Great communication",
         "areas": {"clarity": 90, "confidence": 80}
       }
     }'
   ```

4. **Environment Variables Required**:
   - `VITE_N8N_WEBHOOK_URL`: n8n webhook endpoint
   - `N8N_BACKEND_SECRET`: Secret for n8n authentication
   - `VITE_ELEVENLABS_API_KEY_TEST`: ElevenLabs API key
   - `VITE_ELEVENLABS_AGENT_ID_TEST`: ElevenLabs agent ID

## Common Operations

### Adding New Role
1. Update `UserRole` type in `useUserRole.ts`
2. Add role logic to `my_phase()` SQL function
3. Update role checking in components
4. Add translations in `LanguageContext.tsx`

### Adding New Dashboard
1. Create component in `src/components/dashboards/`
2. Add route logic to `DashboardContent.tsx`
3. Add role-specific data fetching
4. Update sidebar navigation

### Testing Authentication
1. Clear all cookies/localStorage
2. Test each role's invite flow
3. Verify phase transitions
4. Check returnTo parameter handling

## Deployment
- Platform: Vercel (inferred from API structure)
- Build command: `npm run build`
- API routes in `/api` folder
- Environment variables configured in deployment platform

## Known Issues & Considerations
- Invite cookies have domain restrictions (`.maity.com.mx`)
- Role transitions require page refresh in some cases
- Complex phase/role logic requires careful testing
- Database migrations must be applied manually
- CORS issues in development resolved by using local Vercel dev server
- OTK function requires service_role permissions for proper token generation

## Development Workflow

### Local Development Setup
```bash
# Terminal 1 - Start API server
npm run dev:api

# Terminal 2 - Start frontend
npm run dev
```

### Best Practices
1. Always use the todo list tool for tracking complex tasks
2. Read existing code before making changes
3. Follow established patterns for new features
4. Test authentication flows thoroughly
5. Use centralized environment variables
6. Prefer editing existing files over creating new ones
7. Test CORS-sensitive features in production or with local Vercel dev server
8. **Write tests for all new features** (services, hooks, utilities)
9. Keep components under 400 lines
10. Use services for business logic, not components

### Development Checklist

**When adding a new feature:**
- [ ] Create feature folder in `src/features/[feature-name]/`
- [ ] Add pages in `pages/` subdirectory
- [ ] Add components in `components/` subdirectory
- [ ] Create domain services in `packages/shared/src/domain/[feature-name]/`
- [ ] Add types in `*.types.ts` files
- [ ] Create reusable hooks if needed
- [ ] Add barrel export `index.ts`
- [ ] Write tests for services and hooks
- [ ] Update routing in `App.tsx`
- [ ] Add translations if needed
- [ ] Test thoroughly before committing

**When adding a new component:**
- [ ] Keep under 400 lines (target: < 200)
- [ ] Single responsibility only
- [ ] Extract business logic to hooks/services
- [ ] Use TypeScript strict types
- [ ] Handle loading and error states
- [ ] Add prop types documentation
- [ ] Consider React.memo for expensive renders
- [ ] Write tests if component is complex

**When refactoring:**
- [ ] Read and understand existing code first
- [ ] Identify what needs to change and why
- [ ] Write tests before refactoring (if none exist)
- [ ] Make incremental changes
- [ ] Test after each change
- [ ] Verify no regressions
- [ ] Update documentation

### API Development Notes
- API endpoints must use `process.env` directly, not `src/lib/env.ts`
- Use fallbacks for environment variables: `process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL`
- OTK generation requires `admin.rpc()` with service_role permissions
- CORS headers must be set for all API endpoints
- **TODO:** Migrate all APIs to TypeScript + Zod validation
- Usa siempre rutas propias
- No uses el color platino en los diseños, solo para textos o titulos
- recuerda que cada que recuperes datos de la database debes exponer la funcion rpc a public con un wrapper
- Cada seccion debe tener su propia ruta
- memoriza este proceso para agregar nuevas rutas

### API TypeScript Migration (Recommended)

**Template for new TypeScript API endpoints:**
```typescript
// api/my-endpoint.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Input validation schema
const RequestSchema = z.object({
  userId: z.string().uuid(),
  data: z.object({
    // Define your schema
  }),
});

// CORS configuration
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',');

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  const origin = req.headers.origin || '';
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Validate input
    const body = RequestSchema.parse(req.body);

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Your business logic here
    const result = await doSomething(body);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        details: error.errors,
      });
    }

    console.error('API error:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
```

## Performance & Optimization

### Component Optimization

**React.memo for expensive components:**
```typescript
// ✅ DO: Memoize expensive renders
import { memo } from 'react';

interface Props {
  data: ComplexData[];
  onSelect: (id: string) => void;
}

export const ExpensiveList = memo(function ExpensiveList({ data, onSelect }: Props) {
  return (
    <div>
      {data.map(item => (
        <ExpensiveItem key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data === nextProps.data;
});
```

**useMemo for expensive calculations:**
```typescript
// ✅ DO: Memoize expensive calculations
function DataDashboard({ rawData }: Props) {
  const processedData = useMemo(() => {
    // Expensive transformation
    return rawData.map(item => complexTransform(item));
  }, [rawData]);

  const statistics = useMemo(() => {
    return calculateStatistics(processedData);
  }, [processedData]);

  return <Chart data={processedData} stats={statistics} />;
}
```

**useCallback for stable callbacks:**
```typescript
// ✅ DO: Stabilize callbacks with useCallback
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback((id: string) => {
    console.log('Clicked', id);
    // Expensive operation
  }, []); // Stable reference

  return <MemoizedChild onClick={handleClick} />;
}
```

### Code Splitting & Lazy Loading

**Lazy load routes:**
```typescript
// ✅ DO: Lazy load feature routes
import { lazy, Suspense } from 'react';

const RoleplayPage = lazy(() => import('@/features/roleplay/pages/RoleplayPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/roleplay" element={<RoleplayPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Lazy load heavy components:**
```typescript
// ✅ DO: Lazy load charts and heavy UI
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <Summary />
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

### React Query Optimization

**Stale time and cache configuration:**
```typescript
// ✅ DO: Configure appropriate stale times
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
```

**Prefetching for better UX:**
```typescript
// ✅ DO: Prefetch data on hover
function DashboardLink() {
  const queryClient = useQueryClient();

  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'data'],
      queryFn: DashboardService.getData,
    });
  };

  return (
    <Link to="/dashboard" onMouseEnter={prefetchDashboard}>
      Dashboard
    </Link>
  );
}
```

### Bundle Size Optimization

**Check bundle size:**
```bash
npm run build
npx vite-bundle-visualizer
```

**Optimize imports:**
```typescript
// ❌ DON'T: Import entire library
import _ from 'lodash';

// ✅ DO: Import specific functions
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

### Image Optimization

```typescript
// ✅ DO: Lazy load images
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
/>

// ✅ DO: Use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

## Common Pitfalls & Antipatterns

### ❌ Antipattern 1: Massive Components

**Problem:**
```typescript
// ❌ 1000+ lines, multiple responsibilities
export function RoleplayPage() {
  const [questionnaire, setQuestionnaire] = useState(...);
  const [voiceSession, setVoiceSession] = useState(...);
  const [evaluation, setEvaluation] = useState(...);
  const [transcript, setTranscript] = useState(...);
  // 15+ more useState
  // 20+ useEffect
  // Mixed UI + business logic
  // Impossible to test or maintain
}
```

**Solution:** Break into smaller components with single responsibilities (see Component Guidelines above).

### ❌ Antipattern 2: Business Logic in Components

**Problem:**
```typescript
// ❌ Business logic mixed with UI
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    supabase.from('users')
      .select('*')
      .then(({ data }) => {
        // Complex filtering logic
        const filtered = data.filter(u => u.active && u.role !== 'admin');
        // Complex transformation
        const transformed = filtered.map(u => ({ ...u, displayName: `${u.firstName} ${u.lastName}` }));
        setUsers(transformed);
      });
  }, []);

  return <div>{/* render */}</div>;
}
```

**Solution:**
```typescript
// ✅ Move logic to service and hook
function UserList() {
  const { users, isLoading } = useActiveUsers();

  if (isLoading) return <Loading />;
  return <div>{/* render */}</div>;
}

// In domain layer
export function useActiveUsers() {
  return useQuery({
    queryKey: ['users', 'active'],
    queryFn: () => UserService.getActiveUsers(),
  });
}
```

### ❌ Antipattern 3: Direct Supabase Calls in Components

**Problem:**
```typescript
// ❌ Scattered database calls
function MyComponent() {
  const { data } = await supabase.rpc('my_roles');
  const { data: phase } = await supabase.rpc('my_phase');
  // Direct RPC calls everywhere
}
```

**Solution:** Always use services (see Service Layer Patterns above).

### ❌ Antipattern 4: Prop Drilling

**Problem:**
```typescript
// ❌ Passing props through many levels
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <Profile user={user} />
    </Sidebar>
  </Layout>
</App>
```

**Solution:**
```typescript
// ✅ Use context or React Query
<UserProvider>
  <App>
    <Layout>
      <Sidebar>
        <Profile /> {/* Gets user from useUserRole() */}
      </Sidebar>
    </Layout>
  </App>
</UserProvider>
```

### ❌ Antipattern 5: Inconsistent Error Handling

**Problem:**
```typescript
// ❌ Different error handling everywhere
try { /* ... */ } catch (e) { console.log(e); }
try { /* ... */ } catch (error) { alert(error); }
try { /* ... */ } catch (err) { /* ignored */ }
```

**Solution:** Use consistent error handling (see Error Handling section above).

### ❌ Antipattern 6: Magic Numbers and Strings

**Problem:**
```typescript
// ❌ Magic values scattered
if (user.role === 'admin') { }
if (status === 3) { }
setTimeout(() => {}, 5000);
```

**Solution:**
```typescript
// ✅ Use constants
import { USER_ROLES, SESSION_STATUS, TIMEOUTS } from '@/constants';

if (user.role === USER_ROLES.ADMIN) { }
if (status === SESSION_STATUS.COMPLETED) { }
setTimeout(() => {}, TIMEOUTS.RETRY);
```

### ❌ Antipattern 7: No TypeScript Types

**Problem:**
```typescript
// ❌ Using 'any' everywhere
function process(data: any): any {
  return data.map((item: any) => item.value);
}
```

**Solution:** Always use explicit types (see TypeScript Standards above).

### ⚠️ Warning Signs Your Code Needs Refactoring

1. **Component > 400 lines** → Split it
2. **Multiple useEffect with dependencies** → Extract to hook
3. **Copy-pasted code** → Extract to utility/hook
4. **Nested ternaries** → Extract to function or component
5. **Long parameter lists (>3)** → Use object parameter
6. **Callback hell** → Use async/await or React Query
7. **No error handling** → Add try/catch and user feedback