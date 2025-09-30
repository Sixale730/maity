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
├── accept-invite.js             # Process invitation links (sets cookie)
├── finalize-invite.js           # Link user to company (consumes cookie)
├── tally-link.js                # Generate Tally form URLs with OTK tokens
├── tally-webhook.js             # Handle Tally form submissions
├── evaluation-complete.js       # Update evaluation results from n8n (POST with request_id in body)
└── elevenlabs-signed-url.js    # Generate signed URLs for ElevenLabs voice agent

supabase/migrations/         # Database schema and functions
```

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

// ✅ OK (API endpoints)
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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

### API Development Notes
- API endpoints must use `process.env` directly, not `src/lib/env.ts`
- Use fallbacks for environment variables: `process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL`
- OTK generation requires `admin.rpc()` with service_role permissions
- CORS headers must be set for all API endpoints
- Usa siempre rutas propias