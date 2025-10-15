# Maity Platform - Architecture Improvement Plan

**Based on Architecture Review:** 2025-10-15
**Overall Architecture Score:** 7.2/10
**Status:** In Progress

---

## Executive Summary

This plan addresses the **3 CRITICAL issues** identified in the architecture analysis:
1. ❌ TypeScript strict mode disabled
2. ❌ Hardcoded environment variables
3. ❌ Zero testing infrastructure

## Implementation Phases

### ✅ Phase 0: Authentication Fix (COMPLETED)
- [x] Created `ensure_user` RPC function
- [x] Applied migration to Supabase
- [x] Fixed 400 error in auth callback

**Result:** Login flow working correctly

---

### ✅ Phase 1: Environment Variable Management (COMPLETED)

**Priority:** CRITICAL
**Effort:** 6-10 hours
**Risk:** Low
**Completed:** 2025-10-15

#### Objectives
- ✅ Remove hardcoded credentials from codebase
- ✅ Create centralized, type-safe environment configuration
- ✅ Enable deployment to different environments without code changes

#### Tasks

- [x] **1.1 Create `src/lib/env.ts`**
  - Centralized environment variable access
  - Type-safe configuration
  - Required variable validation
  - Clear error messages

- [x] **1.2 Update `packages/shared/src/api/client/supabase.ts`**
  - Remove hardcoded SUPABASE_URL and SUPABASE_ANON_KEY
  - Create `initializeSupabase(config)` function
  - Export singleton instance after initialization

- [x] **1.3 Update `packages/shared/src/index.ts`**
  - Export new Supabase initialization functions
  - Export SupabaseConfig type

- [x] **1.4 Create `.env.example`**
  - Document all required environment variables
  - Add development defaults where appropriate
  - Include comments explaining each variable

- [x] **1.5 Update app entrypoint**
  - Initialize Supabase with env config in main.tsx
  - Ensure initialization happens before any auth calls
  - Use env.canonicalUrl for dynamic configuration

- [ ] **1.6 Update CLAUDE.md** (Optional - can be done later)
  - Fix outdated references to `src/lib/env.ts`
  - Document correct pattern for env vars

#### Results Achieved
- ✅ No secrets committed to git (removed hardcoded credentials)
- ✅ Easy environment switching (dev/staging/prod)
- ✅ Type-safe environment access via src/lib/env.ts
- ✅ Clear error messages for missing config
- ✅ Proper initialization order enforced

---

### 📋 Phase 2: TypeScript Strict Mode

**Priority:** CRITICAL
**Effort:** 40-80 hours (incremental over 2-3 sprints)
**Risk:** Low (incremental migration)

#### Objectives
- Enable TypeScript strict mode
- Fix type errors incrementally
- Prevent runtime null/undefined errors
- Improve code maintainability

#### Strategy

**Incremental Migration:**
1. Enable strict mode in tsconfig.json
2. Fix errors one feature at a time
3. Use `@ts-expect-error` for temporary bypasses
4. Prioritize service layer (high value, lower complexity)

#### Tasks

- [ ] **2.1 Enable strict mode in `tsconfig.json`**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```

- [ ] **2.2 Fix Service Layer (Sprint 1)**
  - [ ] packages/shared/src/domain/auth/auth.service.ts
  - [ ] packages/shared/src/domain/dashboard/dashboard.service.ts
  - [ ] packages/shared/src/domain/roleplay/roleplay.service.ts
  - [ ] packages/shared/src/domain/coach/coach.service.ts

- [ ] **2.3 Fix Feature Modules (Sprint 2)**
  - [ ] src/features/auth/
  - [ ] src/features/dashboard/
  - [ ] src/features/coach/
  - [ ] src/features/roleplay/

- [ ] **2.4 Fix API Endpoints (Sprint 3)**
  - [ ] Convert to TypeScript where beneficial
  - [ ] Add input validation with Zod
  - [ ] Type request/response interfaces

#### Expected Outcomes
- ✅ Catch type errors at compile time
- ✅ Better IDE autocomplete
- ✅ Safer refactoring
- ✅ Reduced runtime errors

---

### 🧪 Phase 3: Testing Infrastructure

**Priority:** HIGH
**Effort:** 16-24 hours initial setup
**Risk:** Low

#### Objectives
- Add unit testing capability
- Test critical business logic
- Enable safe refactoring
- Prevent regressions

#### Tasks

- [ ] **3.1 Install Testing Dependencies**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
  ```

- [ ] **3.2 Create Vitest Configuration**
  - Create `vitest.config.ts`
  - Configure test environment
  - Set up path aliases
  - Configure coverage reporting

- [ ] **3.3 Create Test Setup File**
  - Create `src/test/setup.ts`
  - Configure testing-library
  - Add custom matchers

- [ ] **3.4 Write Initial Tests**
  - [ ] AuthService tests
  - [ ] DashboardService tests
  - [ ] RoleplayService tests
  - [ ] Critical utility functions

- [ ] **3.5 Add npm scripts**
  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest --coverage"
    }
  }
  ```

- [ ] **3.6 CI Integration**
  - Add test step to GitHub Actions / CI pipeline
  - Fail builds on test failures
  - Generate coverage reports

#### Expected Outcomes
- ✅ 70%+ code coverage on service layer
- ✅ Automated regression prevention
- ✅ Confidence in refactoring
- ✅ Living documentation via tests

---

## Additional Improvements (Lower Priority)

### Phase 4: Structured Logging
**Effort:** 4-6 hours

- [ ] Install pino or winston
- [ ] Create logger utility
- [ ] Replace console.log in API endpoints
- [ ] Add request tracing

### Phase 5: Dependency Updates
**Effort:** 8-12 hours

- [ ] Upgrade @hookform/resolvers to 5.x
- [ ] Upgrade date-fns to 4.x
- [ ] Align ESLint versions across packages
- [ ] Run security audit

### Phase 6: Component Refactoring
**Effort:** 6-8 hours per large component

- [ ] Refactor Auth.tsx (567 lines)
- [ ] Extract custom hooks
- [ ] Split into smaller components

---

## Metrics & Success Criteria

### Phase 1 Success Metrics
- ✅ Zero hardcoded credentials in code
- ✅ All env vars accessed via src/lib/env.ts
- ✅ App runs in dev and prod with different configs
- ✅ Clear error if env var missing

### Phase 2 Success Metrics
- ✅ `tsc --noEmit` passes with no errors
- ✅ All services type-safe
- ✅ Zero `any` types in service layer
- ✅ Null checks enforced

### Phase 3 Success Metrics
- ✅ 70%+ test coverage on services
- ✅ All critical user flows tested
- ✅ Tests run in <30 seconds
- ✅ CI fails on test failure

---

## Timeline

| Phase | Duration | Start Date | Target Completion |
|-------|----------|------------|-------------------|
| Phase 0 | 2 hours | 2025-10-15 | ✅ 2025-10-15 |
| Phase 1 | 8 hours | 2025-10-15 | ✅ 2025-10-15 |
| Phase 2 | 40-80 hours | TBD | TBD (2-3 sprints) |
| Phase 3 | 16-24 hours | TBD | TBD |

---

## Risk Assessment

### Low Risk
- ✅ Phase 1 (Environment variables) - Well understood problem
- ✅ Phase 3 (Testing) - Isolated addition

### Medium Risk
- ⚠️ Phase 2 (TypeScript strict) - Many files to fix, but incremental
- ⚠️ Dependency upgrades - Breaking changes possible

### Mitigation Strategies
1. **Incremental changes** - One feature/service at a time
2. **Feature branches** - Test thoroughly before merging
3. **Rollback plan** - Keep git history clean for easy revert
4. **Pair review** - Critical changes reviewed by team

---

## Notes

- This plan is based on architecture review by Claude (Sonnet 4.5)
- Priorities may shift based on business needs
- Phase 2 can be done incrementally alongside feature work
- Testing infrastructure (Phase 3) enables safer execution of Phase 2

---

**Document Version:** 1.0
**Last Updated:** 2025-10-15
**Owner:** Development Team
