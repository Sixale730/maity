# Maity Monorepo Reorganization Plan

**Status**: In Progress
**Last Updated**: 2025-10-14
**Estimated Timeline**: 4-6 weeks (phased approach)

---

## Executive Summary

This document outlines a comprehensive plan to properly reorganize the Maity monorepo from its current incomplete state into a clean, maintainable architecture. The previous reorganization attempt was incomplete and has left the codebase in a partially migrated state with broken imports and unused code.

### Current Problems
- **Zero usage** of `@maity/shared` package despite files being moved there
- **29 files** imported from `@/integrations/supabase` (should use shared)
- **65 files** imported from `@/lib/*` (duplicates shared package)
- **Code duplication**: `src/lib/env.ts` duplicates `packages/shared/constants/env.ts`
- **No feature boundaries**: 21 pages still in `src/pages/`, features have no index.ts exports
- **Business logic in UI**: Components directly call Supabase instead of services
- **Incomplete migrations**: Files moved but imports never updated

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Revert Strategy](#revert-strategy)
3. [Migration Phases](#migration-phases)
4. [Detailed Task Checklist](#detailed-task-checklist)
5. [File Movement Matrix](#file-movement-matrix)
6. [Import Update Strategy](#import-update-strategy)
7. [Testing Strategy](#testing-strategy)
8. [Success Metrics](#success-metrics)
9. [Rollback Plan](#rollback-plan)
10. [Timeline & Resource Estimates](#timeline--resource-estimates)

---

## Current State Analysis

### File Inventory

| Location | Count | Status | Notes |
|----------|-------|--------|-------|
| `src/pages/` | 21 files | Should migrate | Old page location |
| `src/components/` | 3 files | Should migrate | Should be in features or shared |
| `src/features/` | 37 files | Partially migrated | No index.ts, wrong imports |
| `src/lib/` | 2 files | **DELETE** | Duplicates shared package |
| `src/ui/components/ui/` | 48 files | Keep | shadcn/ui components (correct location) |
| `packages/shared/src/` | 29 files | Exists but unused | Created but never imported |
| Total TS/TSX files | 128 files | - | Web app only |

### Import Dependency Analysis

**Direct Supabase imports** (WRONG - should use shared):
```typescript
// Found in 29 files
import { supabase } from "@/integrations/supabase/client"
```

**Direct lib imports** (WRONG - should use shared):
```typescript
// Found in 65 files
import { env } from "@/lib/env"
import { resolveBaseOrigin } from "@/lib/urlHelpers"
```

**Shared package imports** (CORRECT - but only 0 files use it):
```typescript
// Found in 0 files currently
import { supabase, env } from "@maity/shared"
```

### Duplication Inventory

| File | Location 1 | Location 2 | Action |
|------|-----------|-----------|--------|
| `env.ts` | `src/lib/env.ts` (34 lines) | `packages/shared/constants/env.ts` (43 lines) | Delete src/lib, use shared |
| `supabase client` | `src/integrations/supabase/client.ts` | `packages/shared/api/client/supabase.ts` | Use shared version |
| UI components | `src/components/ui/` | `src/ui/components/ui/` | Already moved to src/ui |

### What Was Attempted vs What Works

#### Attempted ✅ (Structure Created)
- Created `packages/shared/src/domain/` with service files
- Created `src/features/` folders (auth, coach, roleplay, dashboard, organizations)
- Moved some pages to `src/features/*/pages/`
- Created `packages/shared/src/index.ts` with exports

#### Not Working ❌ (Implementation Incomplete)
- NO files import from `@maity/shared` (0 usage)
- Features have no `index.ts` (no public APIs)
- All imports still use old paths (`@/lib/*`, `@/integrations/supabase`)
- Business logic still in components (not using services)
- `src/lib/` still exists and is imported everywhere

---

## Revert Strategy

### Phase 0: Safe Revert (Week 1, Days 1-2)

#### What to Revert

**DO NOT revert** (these are good):
- ✅ `packages/shared/` structure (good foundation)
- ✅ `src/features/` folder structure (correct approach)
- ✅ `tsconfig` path mappings (already configured)
- ✅ `src/ui/components/ui/` (shadcn components correctly placed)

**DO revert** (incomplete migrations):
- ❌ Individual file moves without import updates
- ❌ Broken feature imports

#### Revert Commands

```bash
# 1. Create a snapshot before reverting
git tag pre-revert-snapshot

# 2. Check what was changed in recent refactor commits
git log --oneline --since="2025-10-10" --grep="refactor\|reorganize\|migrate"

# 3. For each incomplete file move, we'll fix imports instead of reverting
# (Less risky than git revert which could break working code)

# 4. Instead of reverting, we'll:
# - Keep files in new locations
# - Update ALL imports to be consistent
# - This is safer than moving files back and forth
```

**Decision**: Skip full revert, proceed with forward-fixing imports instead. This is safer.

---

## Migration Phases

### Phase 1: Foundation & Cleanup (Week 1-2)

**Goal**: Establish clean foundation without duplication

**Tasks**:
1. ✅ Keep current file locations (don't move back)
2. 🔧 Fix all imports to use centralized paths
3. 🗑️ Remove duplicate files (src/lib/*)
4. 📝 Document import conventions
5. 🧪 Ensure build passes after cleanup

**Deliverables**:
- Single source of truth for env, types, utilities
- All imports point to correct locations
- No duplicate code
- Build passes, all pages work

---

### Phase 2: Shared Package Completion (Week 2-3)

**Goal**: Make `@maity/shared` the single source of truth for business logic

**Tasks**:

#### 2.1 Complete Shared Package Structure
```
packages/shared/src/
├── index.ts                    # Main export file (enhance)
├── api/
│   └── client/
│       └── supabase.ts        # ✅ Already exists
├── constants/
│   ├── env.ts                 # ✅ Already exists
│   ├── colors.ts              # ✅ Already exists
│   ├── translations.ts        # ✅ Already exists
│   └── appUrl.ts              # ✅ Already exists
├── domain/
│   ├── auth/
│   │   ├── auth.service.ts    # ✅ Already exists (enhance)
│   │   ├── auth.types.ts      # 🆕 Create
│   │   └── hooks/
│   │       └── useStatusValidation.ts  # ✅ Exists
│   ├── organizations/
│   │   ├── organization.service.ts     # 🆕 Create
│   │   ├── company.persistence.ts      # ✅ Exists
│   │   ├── invite.service.ts           # ✅ Exists
│   │   └── organization.types.ts       # 🆕 Create
│   ├── roleplay/
│   │   ├── roleplay.service.ts         # 🆕 Create
│   │   ├── session.service.ts          # 🆕 Create
│   │   ├── evaluation.service.ts       # 🆕 Create
│   │   └── roleplay.types.ts           # 🆕 Create
│   ├── coach/
│   │   ├── coach.service.ts            # 🆕 Create
│   │   ├── voice.service.ts            # 🆕 Create
│   │   └── coach.types.ts              # 🆕 Create
│   └── dashboard/
│       ├── dashboard.service.ts        # 🆕 Create
│       └── dashboard.types.ts          # 🆕 Create
├── types/
│   ├── user.types.ts          # ✅ Already exists
│   └── database.types.ts      # ✅ Already exists
└── utils/
    ├── cn.ts                  # ✅ Already exists
    ├── urlHelpers.ts          # ✅ Already exists
    └── jwt.ts                 # ✅ Already exists
```

#### 2.2 Create Service Layer Pattern

**Service Template**:
```typescript
// packages/shared/src/domain/auth/auth.service.ts
import { supabase } from '../../api/client/supabase';
import type { AuthUser, LoginCredentials } from './auth.types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data.user;
  }

  static async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
```

#### 2.3 Update packages/shared/src/index.ts

```typescript
// ===== API Layer =====
export { supabase } from './api/client/supabase';

// ===== Constants =====
export * from './constants/env';
export * from './constants/colors';
export * from './constants/translations';
export * from './constants/appUrl';

// ===== Types =====
export * from './types/user.types';
export * from './types/database.types';

// ===== Utils =====
export * from './utils/cn';
export * from './utils/urlHelpers';
export * from './utils/jwt';

// ===== Domain: Auth =====
export { AuthService } from './domain/auth/auth.service';
export * from './domain/auth/auth.types';
export * from './domain/auth/hooks/useStatusValidation';

// ===== Domain: Organizations =====
export { OrganizationService } from './domain/organizations/organization.service';
export * from './domain/organizations/organization.types';
export * from './domain/organizations/invite.service';
export * from './domain/organizations/company.persistence';

// ===== Domain: Roleplay =====
export { RoleplayService } from './domain/roleplay/roleplay.service';
export { SessionService } from './domain/roleplay/session.service';
export * from './domain/roleplay/roleplay.types';

// ===== Domain: Coach =====
export { CoachService } from './domain/coach/coach.service';
export * from './domain/coach/coach.types';
export * from './domain/coach/hooks/useElevenLabsVoice';

// ===== Domain: Dashboard =====
export { DashboardService } from './domain/dashboard/dashboard.service';
export * from './domain/dashboard/dashboard.types';

// ===== Hooks =====
export { useUserRole } from './hooks/useUserRole';

// ===== Contexts =====
export * from './contexts/LanguageContext';
```

---

### Phase 3: Web Feature-Slice Implementation (Week 3-4)

**Goal**: Organize web app into clean feature modules with public APIs

#### 3.1 Feature Structure Template

Each feature follows this pattern:
```
src/features/[feature-name]/
├── index.ts              # 🆕 Public API (barrel export)
├── pages/                # ✅ Route components
│   └── [Feature]Page.tsx
├── components/           # Feature-specific components
│   └── [Component].tsx
└── hooks/               # Feature-specific hooks (optional)
    └── use[Hook].ts
```

#### 3.2 Create Feature Index Files

**Example**: `src/features/auth/index.ts`
```typescript
// Public API for auth feature
export { default as AuthPage } from './pages/Auth';
export { default as AuthCallbackPage } from './pages/AuthCallback';
export { default as RegistrationPage } from './pages/Registration';
export { default as OnboardingPage } from './pages/Onboarding';
export { default as PendingPage } from './pages/Pending';
```

#### 3.3 Update All Feature Imports

**BEFORE** (❌ Wrong):
```typescript
// In src/App.tsx
import Auth from './features/auth/pages/Auth';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/lib/env';
```

**AFTER** (✅ Correct):
```typescript
// In src/App.tsx
import { AuthPage } from './features/auth';
import { supabase, env } from '@maity/shared';
```

---

### Phase 4: Monorepo Structure (Week 5 - Optional)

**Goal**: Move web app to packages/web/ for consistency

**Note**: This phase is OPTIONAL and can be deferred. The current structure with web at root and mobile in packages/ works fine.

```
packages/
├── web/                  # Move current src/ here
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── mobile/               # ✅ Already here
└── shared/               # ✅ Already here
```

**Why defer?**
- Current structure works
- Deployment configs would need updates
- High risk, low immediate value
- Focus on code quality first

---

### Phase 5: Mobile Alignment (Week 6)

**Goal**: Apply same patterns to mobile app

**Tasks**:
1. Update mobile to import from `@maity/shared`
2. Create mobile feature structure
3. Share more code (services, types, constants)
4. Remove mobile duplicates

---

## Detailed Task Checklist

### Phase 1: Foundation & Cleanup ⚙️

#### Week 1, Day 1-2: Import Consolidation

- [ ] **Task 1.1**: Update all imports from `@/lib/env` to `@maity/shared`
  - [ ] Find all usages: `@/lib/env` (65 files)
  - [ ] Replace with: `import { env } from '@maity/shared'`
  - [ ] Verify build passes

- [ ] **Task 1.2**: Update all imports from `@/integrations/supabase` to `@maity/shared`
  - [ ] Find all usages: `@/integrations/supabase/client` (29 files)
  - [ ] Replace with: `import { supabase } from '@maity/shared'`
  - [ ] Verify build passes

- [ ] **Task 1.3**: Update all imports from `@/lib/urlHelpers`
  - [ ] Replace with: `import { resolveBaseOrigin, rebaseUrlToOrigin } from '@maity/shared'`

- [ ] **Task 1.4**: Update all imports from `@/lib/supabase`
  - [ ] Replace with: `import { supabase } from '@maity/shared'`

#### Week 1, Day 3: Cleanup Duplicates

- [ ] **Task 1.5**: Delete `src/lib/env.ts`
  - [ ] Ensure all imports updated first (Task 1.1 complete)
  - [ ] Delete file
  - [ ] Verify build passes

- [ ] **Task 1.6**: Delete `src/lib/supabase.ts`
  - [ ] Ensure all imports updated first (Task 1.2 complete)
  - [ ] Delete file
  - [ ] Verify build passes

- [ ] **Task 1.7**: Delete `src/lib/` directory if empty
  - [ ] Confirm no remaining files
  - [ ] Remove directory

#### Week 1, Day 4-5: Verify & Test

- [ ] **Task 1.8**: Run full build
  ```bash
  npm run build
  ```

- [ ] **Task 1.9**: Test all authentication flows
  - [ ] OAuth login (Google)
  - [ ] OAuth login (Microsoft)
  - [ ] Email/password login
  - [ ] Registration
  - [ ] Logout

- [ ] **Task 1.10**: Test all main features
  - [ ] Dashboard (all roles: admin, manager, user)
  - [ ] Coach page
  - [ ] Roleplay page
  - [ ] Organizations page

---

### Phase 2: Shared Package Completion 📦

#### Week 2, Day 1-2: Create Service Classes

- [ ] **Task 2.1**: Create `AuthService`
  - [ ] File: `packages/shared/src/domain/auth/auth.service.ts`
  - [ ] Methods: `login()`, `logout()`, `getSession()`, `signUp()`
  - [ ] Export from `packages/shared/src/index.ts`

- [ ] **Task 2.2**: Create `auth.types.ts`
  - [ ] File: `packages/shared/src/domain/auth/auth.types.ts`
  - [ ] Types: `LoginCredentials`, `SignUpData`, `AuthUser`, `AuthSession`

- [ ] **Task 2.3**: Create `OrganizationService`
  - [ ] File: `packages/shared/src/domain/organizations/organization.service.ts`
  - [ ] Methods: `getAll()`, `getById()`, `create()`, `update()`, `delete()`
  - [ ] Methods: `getUsers()`, `inviteUser()`, `removeUser()`

- [ ] **Task 2.4**: Create `organization.types.ts`
  - [ ] Types: `Organization`, `OrganizationMember`, `InviteData`

- [ ] **Task 2.5**: Create `RoleplayService`
  - [ ] File: `packages/shared/src/domain/roleplay/roleplay.service.ts`
  - [ ] Methods: `getSessions()`, `getSessionById()`, `createSession()`

- [ ] **Task 2.6**: Create `SessionService`
  - [ ] File: `packages/shared/src/domain/roleplay/session.service.ts`
  - [ ] Methods: `start()`, `end()`, `getTranscript()`, `getEvaluation()`

- [ ] **Task 2.7**: Create `roleplay.types.ts`
  - [ ] Types: `RoleplaySession`, `Transcript`, `Evaluation`

- [ ] **Task 2.8**: Create `CoachService`
  - [ ] File: `packages/shared/src/domain/coach/coach.service.ts`
  - [ ] Methods: `startConversation()`, `sendMessage()`, `getHistory()`

- [ ] **Task 2.9**: Create `coach.types.ts`
  - [ ] Types: `Conversation`, `Message`, `VoiceSession`

- [ ] **Task 2.10**: Create `DashboardService`
  - [ ] File: `packages/shared/src/domain/dashboard/dashboard.service.ts`
  - [ ] Methods: `getStats()`, `getRecentActivity()`, `getMetrics()`

- [ ] **Task 2.11**: Create `dashboard.types.ts`
  - [ ] Types: `DashboardStats`, `Activity`, `Metric`

#### Week 2, Day 3-4: Update Shared Index

- [ ] **Task 2.12**: Update `packages/shared/src/index.ts`
  - [ ] Add all new service exports
  - [ ] Add all new type exports
  - [ ] Organize by domain
  - [ ] Add JSDoc comments

- [ ] **Task 2.13**: Verify shared package exports
  ```bash
  # Test that imports work
  node -e "const shared = require('./packages/shared/src/index.ts'); console.log(Object.keys(shared));"
  ```

#### Week 2, Day 5: Testing

- [ ] **Task 2.14**: Create unit tests for services
  - [ ] Test AuthService.login()
  - [ ] Test AuthService.logout()
  - [ ] Test OrganizationService.getAll()
  - [ ] Test RoleplayService.getSessions()

- [ ] **Task 2.15**: Run tests
  ```bash
  npm test
  ```

---

### Phase 3: Web Feature Implementation 🌐

#### Week 3: Auth Feature

- [ ] **Task 3.1**: Create `src/features/auth/index.ts`
  ```typescript
  export { default as AuthPage } from './pages/Auth';
  export { default as AuthCallbackPage } from './pages/AuthCallback';
  export { default as RegistrationPage } from './pages/Registration';
  export { default as OnboardingPage } from './pages/Onboarding';
  export { default as PendingPage } from './pages/Pending';
  ```

- [ ] **Task 3.2**: Update `src/features/auth/pages/Auth.tsx`
  - [ ] Replace direct supabase calls with `AuthService`
  - [ ] Update imports to use `@maity/shared`
  - [ ] Test login flow

- [ ] **Task 3.3**: Update `src/features/auth/pages/AuthCallback.tsx`
  - [ ] Update imports to use `@maity/shared`
  - [ ] Use `AuthService` for session checks
  - [ ] Test OAuth callback flow

- [ ] **Task 3.4**: Update `src/features/auth/pages/Registration.tsx`
  - [ ] Update imports to use `@maity/shared`
  - [ ] Test registration flow

- [ ] **Task 3.5**: Update `src/features/auth/pages/Onboarding.tsx`
  - [ ] Update imports to use `@maity/shared`
  - [ ] Test onboarding flow

- [ ] **Task 3.6**: Update `src/features/auth/pages/Pending.tsx`
  - [ ] Update imports to use `@maity/shared`
  - [ ] Test pending state

- [ ] **Task 3.7**: Update `src/App.tsx` to use auth feature exports
  ```typescript
  import { AuthPage, AuthCallbackPage } from './features/auth';
  ```

#### Week 4: Dashboard Feature

- [ ] **Task 3.8**: Create `src/features/dashboard/index.ts`
  ```typescript
  export { default as DashboardPage } from './pages/Dashboard';
  export { DashboardContent } from './components/DashboardContent';
  ```

- [ ] **Task 3.9**: Update dashboard components to use `DashboardService`
  - [ ] `src/features/dashboard/pages/Dashboard.tsx`
  - [ ] `src/features/dashboard/components/DashboardContent.tsx`
  - [ ] `src/features/dashboard/components/dashboards/PlatformAdminDashboard.tsx`
  - [ ] `src/features/dashboard/components/dashboards/TeamDashboard.tsx`
  - [ ] `src/features/dashboard/components/dashboards/UserDashboard.tsx`

- [ ] **Task 3.10**: Update dashboard hooks
  - [ ] `src/features/dashboard/hooks/useDashboardData.ts`
  - [ ] `src/features/dashboard/hooks/useDashboardDataByRole.ts`

#### Week 4: Organizations Feature

- [ ] **Task 3.11**: Create `src/features/organizations/index.ts`
  ```typescript
  export { default as OrganizationsPage } from './pages/Organizations';
  export { OrganizationsManager } from './components/OrganizationsManager';
  ```

- [ ] **Task 3.12**: Update organizations components
  - [ ] `src/features/organizations/pages/Organizations.tsx`
  - [ ] `src/features/organizations/components/OrganizationsManager.tsx`
  - [ ] Use `OrganizationService` instead of direct supabase calls

#### Week 4: Roleplay Feature

- [ ] **Task 3.13**: Create `src/features/roleplay/index.ts`
  ```typescript
  export { default as RoleplayPage } from './pages/RoleplayPage';
  export { default as SessionResultsPage } from './pages/SessionResultsPage';
  ```

- [ ] **Task 3.14**: Update roleplay components (10 files)
  - [ ] Update all imports to `@maity/shared`
  - [ ] Use `RoleplayService` and `SessionService`

#### Week 4: Coach Feature

- [ ] **Task 3.15**: Create `src/features/coach/index.ts`
  ```typescript
  export { default as CoachPage } from './pages/CoachPage';
  ```

- [ ] **Task 3.16**: Update coach components (9 files)
  - [ ] Update all imports to `@maity/shared`
  - [ ] Use `CoachService` for business logic

---

### Phase 4: Monorepo Structure (Optional) 📁

**⚠️ DEFER THIS PHASE** until Phase 1-3 are complete and stable.

- [ ] **Task 4.1**: Create `packages/web/` structure
- [ ] **Task 4.2**: Move `src/` to `packages/web/src/`
- [ ] **Task 4.3**: Update root `package.json` workspaces
- [ ] **Task 4.4**: Update Vercel deployment config
- [ ] **Task 4.5**: Update tsconfig references
- [ ] **Task 4.6**: Test deployment

---

### Phase 5: Mobile Alignment 📱

#### Week 6: Mobile Refactor

- [ ] **Task 5.1**: Update mobile imports to use `@maity/shared`
  - [ ] Replace mobile Supabase client with shared
  - [ ] Use shared constants (env, colors, translations)
  - [ ] Use shared services

- [ ] **Task 5.2**: Create mobile features structure
  ```
  packages/mobile/src/
  ├── features/
  │   ├── auth/
  │   ├── coach/
  │   └── roleplay/
  ```

- [ ] **Task 5.3**: Remove mobile duplicates
  - [ ] Remove duplicate type definitions
  - [ ] Remove duplicate utilities
  - [ ] Remove duplicate constants

- [ ] **Task 5.4**: Test mobile app
  - [ ] Test auth flow
  - [ ] Test coach feature
  - [ ] Test roleplay feature

---

## File Movement Matrix

### Files to Keep (No Movement)

| Current Location | Status | Notes |
|-----------------|--------|-------|
| `src/features/auth/pages/Auth.tsx` | ✅ Keep | Update imports only |
| `src/features/auth/pages/AuthCallback.tsx` | ✅ Keep | Update imports only |
| `src/features/auth/pages/Registration.tsx` | ✅ Keep | Update imports only |
| `src/features/auth/pages/Onboarding.tsx` | ✅ Keep | Update imports only |
| `src/features/auth/pages/Pending.tsx` | ✅ Keep | Update imports only |
| `src/features/dashboard/*` | ✅ Keep | Update imports only |
| `src/features/organizations/*` | ✅ Keep | Update imports only |
| `src/features/roleplay/*` | ✅ Keep | Update imports only |
| `src/features/coach/*` | ✅ Keep | Update imports only |
| `src/ui/components/ui/*` | ✅ Keep | shadcn components, correct location |
| `packages/shared/src/*` | ✅ Keep | Add more files here |

### Files to Delete (Duplicates)

| Current Location | Action | Reason | Replacement |
|-----------------|--------|--------|-------------|
| `src/lib/env.ts` | 🗑️ DELETE | Duplicate | `packages/shared/constants/env.ts` |
| `src/lib/supabase.ts` | 🗑️ DELETE | Duplicate | `packages/shared/api/client/supabase.ts` |
| `src/lib/` (directory) | 🗑️ DELETE | After files deleted | N/A |

### Files to Migrate (From Old Pages)

| Current Location | Target Location | Status | Dependencies |
|-----------------|----------------|--------|--------------|
| `src/pages/Achievements.tsx` | `src/features/dashboard/pages/AchievementsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Analytics.tsx` | `src/features/dashboard/pages/AnalyticsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Documents.tsx` | `src/features/dashboard/pages/DocumentsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Reports.tsx` | `src/features/dashboard/pages/ReportsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Settings.tsx` | `src/features/dashboard/pages/SettingsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Team.tsx` | `src/features/organizations/pages/TeamPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Users.tsx` | `src/features/organizations/pages/UsersPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Demo.tsx` | `src/features/coach/pages/DemoPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/DemoTraining.tsx` | `src/features/roleplay/pages/DemoTrainingPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/MyProgress.tsx` | `src/features/dashboard/pages/MyProgressPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Plan.tsx` | `src/features/dashboard/pages/PlanPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Plans.tsx` | `src/features/dashboard/pages/PlansPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Sessions.tsx` | `src/features/roleplay/pages/SessionsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Trends.tsx` | `src/features/dashboard/pages/TrendsPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/Index.tsx` | `src/features/dashboard/pages/IndexPage.tsx` | 📋 To migrate | Update imports |
| `src/pages/NotFound.tsx` | Keep in `src/pages/` | ✅ Keep | System page, not a feature |
| `src/pages/InvitationConflict.tsx` | Keep in `src/pages/` | ✅ Keep | System page |
| `src/pages/InvitationRequired.tsx` | Keep in `src/pages/` | ✅ Keep | System page |
| `src/pages/OnboardingSuccess.tsx` | `src/features/auth/pages/OnboardingSuccessPage.tsx` | 📋 To migrate | Part of auth flow |
| `src/pages/UserStatusError.tsx` | Keep in `src/pages/` | ✅ Keep | System error page |
| `src/pages/OAuthTest.tsx` | Keep in `src/pages/` | ✅ Keep | Dev/test page |

### Files to Create (New Services)

| Target Location | Purpose | Priority |
|----------------|---------|----------|
| `packages/shared/src/domain/auth/auth.service.ts` | Auth operations | 🔴 High |
| `packages/shared/src/domain/auth/auth.types.ts` | Auth types | 🔴 High |
| `packages/shared/src/domain/organizations/organization.service.ts` | Org operations | 🔴 High |
| `packages/shared/src/domain/organizations/organization.types.ts` | Org types | 🔴 High |
| `packages/shared/src/domain/roleplay/roleplay.service.ts` | Roleplay operations | 🟡 Medium |
| `packages/shared/src/domain/roleplay/session.service.ts` | Session operations | 🟡 Medium |
| `packages/shared/src/domain/roleplay/roleplay.types.ts` | Roleplay types | 🟡 Medium |
| `packages/shared/src/domain/coach/coach.service.ts` | Coach operations | 🟡 Medium |
| `packages/shared/src/domain/coach/coach.types.ts` | Coach types | 🟡 Medium |
| `packages/shared/src/domain/dashboard/dashboard.service.ts` | Dashboard operations | 🟢 Low |
| `packages/shared/src/domain/dashboard/dashboard.types.ts` | Dashboard types | 🟢 Low |
| `src/features/auth/index.ts` | Auth feature exports | 🔴 High |
| `src/features/dashboard/index.ts` | Dashboard feature exports | 🔴 High |
| `src/features/organizations/index.ts` | Organizations feature exports | 🔴 High |
| `src/features/roleplay/index.ts` | Roleplay feature exports | 🟡 Medium |
| `src/features/coach/index.ts` | Coach feature exports | 🟡 Medium |

---

## Import Update Strategy

### Pattern 1: Supabase Client

**BEFORE** ❌:
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.auth.signIn({ email, password });
```

**AFTER** ✅:
```typescript
import { supabase } from "@maity/shared";

const { data, error } = await supabase.auth.signIn({ email, password });
```

**Even Better** ✅✅:
```typescript
import { AuthService } from "@maity/shared";

const user = await AuthService.login({ email, password });
```

### Pattern 2: Environment Variables

**BEFORE** ❌:
```typescript
import { env } from "@/lib/env";

const apiUrl = env.apiUrl;
```

**AFTER** ✅:
```typescript
import { env } from "@maity/shared";

const apiUrl = env.apiUrl;
```

### Pattern 3: Utilities

**BEFORE** ❌:
```typescript
import { resolveBaseOrigin } from "@/lib/urlHelpers";
import { getAppUrl } from "@/lib/appUrl";
```

**AFTER** ✅:
```typescript
import { resolveBaseOrigin, getAppUrl } from "@maity/shared";
```

### Pattern 4: UI Components (Correct - Don't Change)

**CURRENT** ✅ (Keep as-is):
```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

**Note**: UI components are framework-specific (shadcn/ui for web, React Native Paper for mobile), so they should NOT be in shared package.

### Pattern 5: Feature Components

**BEFORE** ❌:
```typescript
import Auth from './features/auth/pages/Auth';
import Dashboard from './features/dashboard/pages/Dashboard';
```

**AFTER** ✅:
```typescript
import { AuthPage } from './features/auth';
import { DashboardPage } from './features/dashboard';
```

### Pattern 6: Hooks

**BEFORE** ❌:
```typescript
import { useUserRole } from "@/hooks/useUserRole";
```

**AFTER** ✅:
```typescript
import { useUserRole } from "@maity/shared";
```

### Automated Find & Replace

Use these commands to update imports:

```bash
# 1. Update Supabase imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|from "@/integrations/supabase/client"|from "@maity/shared"|g' {} +

# 2. Update env imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|from "@/lib/env"|from "@maity/shared"|g' {} +

# 3. Update urlHelpers imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|from "@/lib/urlHelpers"|from "@maity/shared"|g' {} +

# 4. Update appUrl imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|from "@/lib/appUrl"|from "@maity/shared"|g' {} +

# 5. Update hook imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|from "@/hooks/useUserRole"|from "@maity/shared"|g' {} +
```

**⚠️ Warning**: Test thoroughly after automated replacements!

---

## Testing Strategy

### Unit Tests

#### Test Structure
```
packages/shared/src/domain/
├── auth/
│   ├── __tests__/
│   │   ├── auth.service.test.ts
│   │   └── auth.types.test.ts
│   ├── auth.service.ts
│   └── auth.types.ts
```

#### Example Test
```typescript
// packages/shared/src/domain/auth/__tests__/auth.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../auth.service';
import { supabase } from '../../../api/client/supabase';

vi.mock('../../../api/client/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    }
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null
      });

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toEqual(mockUser);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should throw error on invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Integration Tests

Test full user flows:

```typescript
// src/features/auth/__tests__/auth-flow.integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPage } from '../index';

describe('Auth Flow Integration', () => {
  it('should complete full login flow', async () => {
    render(<AuthPage />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Wait for redirect
    await waitFor(() => {
      expect(window.location.pathname).toBe('/auth/callback');
    });
  });
});
```

### Manual Testing Checklist

#### Phase 1 Testing (After Import Updates)
- [ ] **Build**: Run `npm run build` - should complete without errors
- [ ] **Dev Server**: Run `npm run dev` - should start without errors
- [ ] **Page Load**: Visit http://localhost:8080 - should load landing page
- [ ] **Navigation**: Click through all main routes - should work

#### Phase 2 Testing (After Service Creation)
- [ ] **Auth Service**: Test login with email/password
- [ ] **Auth Service**: Test OAuth login (Google)
- [ ] **Auth Service**: Test OAuth login (Microsoft)
- [ ] **Auth Service**: Test logout
- [ ] **Organization Service**: Test org listing (as admin)
- [ ] **Organization Service**: Test org creation (as admin)
- [ ] **Dashboard Service**: Test stats loading (all roles)

#### Phase 3 Testing (After Feature Migration)
- [ ] **Auth Feature**: Complete registration flow
- [ ] **Auth Feature**: Complete onboarding flow
- [ ] **Dashboard Feature**: View as admin
- [ ] **Dashboard Feature**: View as manager
- [ ] **Dashboard Feature**: View as user
- [ ] **Organizations Feature**: Manage organizations (admin)
- [ ] **Organizations Feature**: Invite user
- [ ] **Roleplay Feature**: Start roleplay session
- [ ] **Roleplay Feature**: View session results
- [ ] **Coach Feature**: Start coach conversation
- [ ] **Coach Feature**: View coach history

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

---

## Success Metrics

### Code Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Files importing from `@maity/shared` | 0 (0%) | 128 (100%) | 🔴 Not started |
| Files importing from `@/lib/*` | 65 | 0 | 🔴 Not started |
| Files importing from `@/integrations/supabase` | 29 | 0 | 🔴 Not started |
| Features with `index.ts` | 0 (0%) | 5 (100%) | 🔴 Not started |
| Service classes created | 4 | 11 | 🟡 Partial |
| Code duplication (files) | 2 | 0 | 🔴 Not started |
| Build time | ~45s | <60s | ✅ Acceptable |

### Architecture Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Business logic in components | High | None | 🔴 Not started |
| Separation of concerns | Poor | Excellent | 🔴 Not started |
| Feature independence | Low | High | 🔴 Not started |
| Code reusability | Low | High | 🔴 Not started |
| Type safety | Medium | High | 🔴 Not started |

### Completion Criteria

#### Phase 1 Complete ✅ When:
- [ ] Zero files import from `@/lib/*`
- [ ] Zero files import from `@/integrations/supabase` directly
- [ ] All files import from `@maity/shared` for core functionality
- [ ] No duplicate files exist
- [ ] Build passes without errors
- [ ] All main user flows work

#### Phase 2 Complete ✅ When:
- [ ] All 11 service classes created
- [ ] All service classes have type definitions
- [ ] All services exported from `packages/shared/src/index.ts`
- [ ] Services have unit tests (>80% coverage)
- [ ] Documentation exists for all services

#### Phase 3 Complete ✅ When:
- [ ] All 5 features have `index.ts` with public API
- [ ] All feature components use services (not direct Supabase)
- [ ] All feature imports use `@maity/shared`
- [ ] All pages migrated from `src/pages/` to features
- [ ] All user flows tested and working

#### Phase 4 Complete ✅ When:
- [ ] Web app in `packages/web/`
- [ ] Workspace configuration updated
- [ ] Deployment successful
- [ ] All paths updated

#### Phase 5 Complete ✅ When:
- [ ] Mobile uses `@maity/shared`
- [ ] Mobile features structured like web
- [ ] No mobile code duplication
- [ ] Mobile app tested and working

---

## Rollback Plan

### Per-Phase Rollback

#### Phase 1 Rollback
If imports break:
```bash
# 1. Revert import changes
git checkout HEAD~1 -- src/

# 2. Restore src/lib/ if deleted
git checkout HEAD~1 -- src/lib/

# 3. Test
npm run build
npm run dev
```

#### Phase 2 Rollback
If services break:
```bash
# 1. Remove service files
rm -rf packages/shared/src/domain/*/!(hooks)

# 2. Revert index.ts
git checkout HEAD~1 -- packages/shared/src/index.ts

# 3. Components will still use direct Supabase (from Phase 1)
```

#### Phase 3 Rollback
If features break:
```bash
# 1. Remove feature index files
find src/features -name "index.ts" -delete

# 2. Revert component changes
git checkout HEAD~1 -- src/features/

# 3. Keep using @maity/shared for basics (from Phase 1)
```

### Emergency Full Rollback

If everything is broken:
```bash
# 1. Create backup of current state
git branch backup/failed-migration

# 2. Checkout pre-migration commit
git checkout pre-revert-snapshot

# 3. Force reset
git reset --hard pre-revert-snapshot

# 4. Clean node_modules
rm -rf node_modules packages/*/node_modules
npm install

# 5. Test
npm run build
npm run dev
```

### Gradual Rollback Strategy

Instead of full rollback:

1. **Identify what broke**: Specific feature? Service? Import?
2. **Isolate the issue**: Comment out broken code
3. **Revert only that part**: Use `git checkout HEAD~1 -- path/to/file`
4. **Test incrementally**: Verify each revert fixes the issue
5. **Document the problem**: Add to "Known Issues" section

---

## Timeline & Resource Estimates

### Timeline Overview

```
Week 1: Foundation & Cleanup
├── Days 1-2: Import consolidation (Tasks 1.1-1.4)
├── Day 3: Delete duplicates (Tasks 1.5-1.7)
└── Days 4-5: Verify & test (Tasks 1.8-1.10)

Week 2: Shared Package Completion
├── Days 1-2: Create services (Tasks 2.1-2.11)
├── Days 3-4: Update index (Tasks 2.12-2.13)
└── Day 5: Testing (Tasks 2.14-2.15)

Week 3: Web Features - Auth & Dashboard
├── Days 1-2: Auth feature (Tasks 3.1-3.7)
└── Days 3-5: Dashboard feature (Tasks 3.8-3.10)

Week 4: Web Features - Organizations, Roleplay, Coach
├── Days 1-2: Organizations feature (Tasks 3.11-3.12)
├── Days 3-4: Roleplay feature (Tasks 3.13-3.14)
└── Day 5: Coach feature (Tasks 3.15-3.16)

Week 5: Monorepo Structure (Optional - can defer)
└── If pursued: Tasks 4.1-4.6

Week 6: Mobile Alignment
└── Tasks 5.1-5.4
```

### Resource Requirements

#### Developer Time

| Phase | Tasks | Estimated Hours | Calendar Time |
|-------|-------|----------------|---------------|
| Phase 1: Foundation | 10 tasks | 16-24 hours | 3-5 days |
| Phase 2: Services | 15 tasks | 24-32 hours | 5 days |
| Phase 3: Features | 16 tasks | 32-40 hours | 8-10 days |
| Phase 4: Monorepo | 6 tasks | 8-16 hours | 2-4 days |
| Phase 5: Mobile | 4 tasks | 8-16 hours | 2-4 days |
| **Total** | **51 tasks** | **88-128 hours** | **20-28 days** |

#### Team Composition

**Recommended**:
- 1 Senior Developer (lead)
- 1 Mid-level Developer (implementation)
- 1 QA Engineer (testing)

**Minimal**:
- 1 Senior Developer (solo, extended timeline)

#### Risk Buffer

Add 20% buffer for:
- Unexpected issues
- Testing iterations
- Code review cycles
- Documentation

**Total with buffer**: 24-34 calendar days (5-7 weeks)

### Milestones & Checkpoints

| Milestone | Completion Criteria | Deadline |
|-----------|-------------------|----------|
| M1: Imports Fixed | All files use `@maity/shared` | End of Week 1 |
| M2: Services Ready | All 11 services implemented | End of Week 2 |
| M3: Features Complete | All 5 features refactored | End of Week 4 |
| M4: Monorepo Setup | Web moved to packages (optional) | End of Week 5 |
| M5: Mobile Aligned | Mobile uses shared code | End of Week 6 |

### Checkpoint Reviews

**Weekly Review Questions**:
1. Are we on schedule?
2. Have any blockers emerged?
3. Is code quality improving?
4. Are tests passing?
5. Do we need to adjust the plan?

**Go/No-Go Decision Points**:
- **After Phase 1**: If builds fail, stop and fix before continuing
- **After Phase 2**: If services are buggy, don't proceed to Phase 3
- **After Phase 3**: If features break, don't attempt Phase 4

---

## Appendix

### A. Common Patterns

#### Service Pattern
```typescript
export class MyService {
  static async getAll(): Promise<T[]> { }
  static async getById(id: string): Promise<T> { }
  static async create(data: CreateT): Promise<T> { }
  static async update(id: string, data: UpdateT): Promise<T> { }
  static async delete(id: string): Promise<void> { }
}
```

#### Feature Index Pattern
```typescript
// Public API exports
export { default as FeaturePage } from './pages/FeaturePage';
export { FeatureComponent } from './components/FeatureComponent';
export { useFeature } from './hooks/useFeature';
```

### B. Git Workflow

```bash
# Create feature branch
git checkout -b refactor/phase-1-imports

# Work on tasks
git add -A
git commit -m "refactor: update imports to use @maity/shared"

# Push and create PR
git push origin refactor/phase-1-imports

# After review and approval
git checkout main
git merge refactor/phase-1-imports
git push origin main
```

### C. Code Review Checklist

- [ ] All imports use correct paths (`@maity/shared` not `@/lib/*`)
- [ ] Services are used instead of direct Supabase calls
- [ ] Types are properly defined
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No console.log statements (use proper logging)
- [ ] Error handling is present
- [ ] Loading states are handled
- [ ] Accessibility is maintained

### D. Documentation Updates

After each phase, update:
- [ ] `CLAUDE.md` (project instructions)
- [ ] `README.md` (if exists)
- [ ] API documentation
- [ ] Architecture diagrams
- [ ] This migration plan (mark tasks complete)

---

## Change Log

| Date | Phase | Changes | Author |
|------|-------|---------|--------|
| 2025-10-14 | Initial | Created migration plan | Claude |
| | | | |
| | | | |

---

## Notes & Decisions

### Why Not Revert First?
**Decision**: Fix forward instead of reverting
**Reason**:
- Files are already in good locations (src/features/)
- Reverting would require moving files back, then forward again
- Forward-fixing is less risky and faster

### Why Defer Monorepo Phase?
**Decision**: Make Phase 4 optional
**Reason**:
- Current structure works fine (web at root, mobile in packages)
- Moving to packages/web/ adds risk without immediate value
- Focus on code quality first, structure second
- Can be done later if needed

### Why Service Layer?
**Decision**: Extract business logic into services
**Reason**:
- Separation of concerns (UI vs business logic)
- Reusability (same logic for web and mobile)
- Testability (easier to unit test services)
- Maintainability (changes in one place)

---

**End of Migration Plan**

For questions or issues during migration, refer to:
- `CLAUDE.md` for project conventions
- This document for step-by-step guidance
- Git history for "before" examples
