---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: <feature-name> --route <path> --role <user|manager|admin> --icon <LucideIcon> --group <profile|practice|progress|team|config|admin>
description: Scaffold a new feature with UI pages, domain layer, routes, navigation, and i18n keys
---

# New Feature Scaffold

Create a complete feature scaffold for the Maity platform: **$ARGUMENTS**

## Parse Arguments

Extract from `$ARGUMENTS`:
- `feature-name`: kebab-case name (first positional arg). Derive:
  - `PascalName`: PascalCase version (e.g., `user-progress` → `UserProgress`)
  - `snake_name`: snake_case version (e.g., `user-progress` → `user_progress`)
  - `camelName`: camelCase version (e.g., `user-progress` → `userProgress`)
- `--route`: URL path (e.g., `/user-progress`)
- `--role`: minimum role — determines roles array:
  - `user` → `['admin', 'manager', 'user']`
  - `manager` → `['admin', 'manager']`
  - `admin` → `['admin']`
- `--icon`: Lucide icon component name (e.g., `TrendingUp`)
- `--group`: navigation group (`profile`, `practice`, `progress`, `team`, `config`, `admin`)

If any required argument is missing, ask the user before proceeding.

## Pre-flight Checks

1. Read `src/App.tsx` to understand current lazy imports and route structure
2. Read `src/features/navigation/data/navigation-items.ts` to find the highest `order` value
3. Read `src/contexts/LanguageContext.tsx` to understand translation key structure
4. Verify `src/features/{feature-name}/` does NOT already exist (abort if it does)

## Files to Create

### 1. Feature barrel export
**File:** `src/features/{feature-name}/index.ts`
```typescript
export { {PascalName}Page } from './pages/{PascalName}Page';
```

### 2. Page component
**File:** `src/features/{feature-name}/pages/{PascalName}Page.tsx`

Follow the pattern from existing pages (e.g., `AIResourcesPage.tsx`):
```typescript
import { {Icon} } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function {PascalName}Page() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <{Icon} className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('{snake_name}.title')}</h1>
          <p className="text-muted-foreground">{t('{snake_name}.description')}</p>
        </div>
      </div>

      <div className="text-muted-foreground">
        {t('{snake_name}.coming_soon') || 'Coming soon...'}
      </div>
    </div>
  );
}
```

### 3. Domain types
**File:** `packages/shared/src/domain/{feature-name}/{feature-name}.types.ts`
```typescript
/**
 * Types for {PascalName} feature
 */

export interface {PascalName} {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface {PascalName}Row {
  id: string;
  created_at: string;
  updated_at: string;
}
```

### 4. Domain service
**File:** `packages/shared/src/domain/{feature-name}/{feature-name}.service.ts`

Follow the pattern from existing services:
```typescript
import { supabase } from '../../api/client/supabase';
import type { {PascalName} } from './{feature-name}.types';

export class {PascalName}Service {
  /**
   * Get all {feature-name} items
   */
  static async getAll(): Promise<{PascalName}[]> {
    const { data, error } = await supabase.rpc('get_{snake_name}_list');

    if (error) {
      console.error('Error fetching {feature-name}:', error);
      throw error;
    }

    return data || [];
  }
}
```

### 5. Domain hook
**File:** `packages/shared/src/domain/{feature-name}/hooks/use{PascalName}.ts`

Follow the pattern from existing hooks:
```typescript
import { useQuery } from '@tanstack/react-query';
import { {PascalName}Service } from '../{feature-name}.service';

const {UPPER_SNAKE}_KEY = ['{feature-name}'];

/**
 * Hook to fetch {feature-name} data
 */
export function use{PascalName}() {
  return useQuery({
    queryKey: {UPPER_SNAKE}_KEY,
    queryFn: () => {PascalName}Service.getAll(),
  });
}
```

### 6. Domain barrel export
**File:** `packages/shared/src/domain/{feature-name}/index.ts`
```typescript
export * from './{feature-name}.service';
export * from './hooks/use{PascalName}';
```

## Files to Modify

### 7. Add lazy import + route to `src/App.tsx`

Add lazy import alongside existing imports:
```typescript
const {PascalName}Page = lazy(() => import("./features/{feature-name}").then(m => ({ default: m.{PascalName}Page })));
```

Add `<Route>` inside the `<ProtectedRoute>` + `<AppLayout>` block.
- If role is `admin`, wrap in `<AdminRoute>`:
  ```tsx
  <Route path="{route}" element={<AdminRoute><{PascalName}Page /></AdminRoute>} />
  ```
- Otherwise:
  ```tsx
  <Route path="{route}" element={<{PascalName}Page />} />
  ```

### 8. Add navigation item to `src/features/navigation/data/navigation-items.ts`

Add to the correct array (`userNavigationItems`, `managerNavigationItems`, or `adminNavigationItems`) based on role:
- Import the icon from `lucide-react` if not already imported
- Use `order` = highest existing order + 1
- Follow the exact NavigationItem interface:
```typescript
{
  id: '{feature-name}',
  titleKey: 'nav.{snake_name}',
  descriptionKey: 'nav.desc.{snake_name}',
  url: '{route}',
  icon: {Icon},
  roles: [{roles array}],
  group: '{group}',
  order: {next_order},
},
```

### 9. Add i18n keys to `src/contexts/LanguageContext.tsx`

Add to BOTH `es` and `en` translation objects:
```typescript
// Navigation keys
'nav.{snake_name}': '{Feature Title in Spanish/English}',
'nav.desc.{snake_name}': '{Feature description in Spanish/English}',

// Feature keys
'{snake_name}.title': '{Title in Spanish/English}',
'{snake_name}.description': '{Description in Spanish/English}',
'{snake_name}.coming_soon': 'Pr{o}ximamente... / Coming soon...',
```

Use the feature name to generate sensible Spanish and English translations.

## Post-scaffold Summary

After creating all files, output a summary table:
```
| File | Action | Status |
|------|--------|--------|
| src/features/{name}/index.ts | Created | OK |
| src/features/{name}/pages/{Pascal}Page.tsx | Created | OK |
| packages/shared/src/domain/{name}/{name}.types.ts | Created | OK |
| packages/shared/src/domain/{name}/{name}.service.ts | Created | OK |
| packages/shared/src/domain/{name}/hooks/use{Pascal}.ts | Created | OK |
| packages/shared/src/domain/{name}/index.ts | Created | OK |
| src/App.tsx | Modified | OK |
| navigation-items.ts | Modified | OK |
| LanguageContext.tsx | Modified | OK |
```

Remind the user to:
1. Create RPC functions if the service calls them (use `/new-rpc`)
2. Flesh out the page component with real UI
3. Add domain-specific types and service methods
