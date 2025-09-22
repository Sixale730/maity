# Maity - Mental Wellness Platform

## Project Overview
Maity is a mental wellness platform built with React/TypeScript that provides role-based access for users, managers, and administrators. The platform features dashboards, session tracking, and organization management with a sophisticated authentication and invitation system.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui components, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RPC functions)
- **Charts**: Recharts
- **Routing**: React Router v6
- **State Management**: React Query, React Context
- **Forms**: React Hook Form + Zod validation

## Development Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Project Structure
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboards/           # Role-specific dashboard components
│   └── DashboardContent.tsx  # Main dashboard router
├── pages/
│   ├── Auth.tsx             # Login page with OAuth
│   ├── AuthCallback.tsx     # OAuth callback handler
│   ├── Registration.tsx     # User registration form
│   └── Pending.tsx          # Waiting for company invitation
├── hooks/
│   ├── useUserRole.ts       # User role management
│   └── useDashboardDataByRole.ts # Role-based data fetching
├── contexts/
│   └── LanguageContext.tsx  # Internationalization
├── lib/
│   └── env.ts              # Centralized environment variables
└── integrations/supabase/   # Supabase client config

api/
├── accept-invite.js         # Process invitation links (sets cookie)
└── finalize-invite.js       # Link user to company (consumes cookie)

supabase/migrations/         # Database schema and functions
```

## Environment Variables
**ALWAYS use centralized `src/lib/env.ts` instead of direct `process.env` access**

Required variables:
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `CORS_ORIGINS` (API endpoints)
- `COOKIE_DOMAIN` (invite system)

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

## Code Conventions

### Environment Variables
```typescript
// ❌ DON'T
const url = process.env.SUPABASE_URL;

// ✅ DO
import { env } from '@/lib/env';
const url = env.supabaseUrl;
```

### Role Checking
```typescript
// Check roles first for admin/manager
const { data: roles } = await supabase.rpc('my_roles');
if (roles?.includes('admin') || roles?.includes('manager')) {
  // Admin/manager flow
}

// Then check phase for regular users
const { data: phase } = await supabase.rpc('my_phase');
```

### Component Naming
- Use PascalCase for components
- Prefix with role for role-specific components: `PlatformAdminDashboard`, `UserDashboard`
- Use descriptive names: `DashboardContent`, `OrganizationsManager`

### File Organization
- Group related components in folders
- Keep role-specific logic in dedicated files
- Use barrel exports for cleaner imports

## Important Notes

### Canonical URL
- Production canonical URL: `https://www.maity.com.mx`
- Automatic HTTPS redirect in production
- Development bypasses canonical validation

### Removed Features
- **OTK/Token system**: Completely removed from registration flow
- **AuthCompany.tsx**: Deleted, functionality moved to invite system
- **Direct role assignment**: Now handled via invitation system

### Security
- HttpOnly cookies for invite tokens
- CORS validation on all API endpoints
- Service role key only for server-side operations
- No sensitive data in client-side code

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

## Development Workflow
1. Always use the todo list tool for tracking complex tasks
2. Read existing code before making changes
3. Follow established patterns for new features
4. Test authentication flows thoroughly
5. Use centralized environment variables
6. Prefer editing existing files over creating new ones