---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: <endpoint-name> --method <POST|GET> --fields <name:type,...> [--rate-limit] [--no-auth]
description: Scaffold a Vercel API endpoint with CORS, Zod validation, Supabase client, and error handling
---

# New API Endpoint

Create a new Vercel API endpoint following the project's established patterns: **$ARGUMENTS**

## Parse Arguments

Extract from `$ARGUMENTS`:
- `endpoint-name`: kebab-case name (first positional arg, e.g., `evaluate-achievement`)
- `--method`: HTTP method (`POST` or `GET`, default: `POST`)
- `--fields`: comma-separated `name:type` pairs (e.g., `userId:uuid,achievementId:string,score:number`)
  - Type suffix `?` makes it optional (e.g., `notes:string?`)
- `--rate-limit`: include rate limiting (5/min, 50/day per user)
- `--no-auth`: skip authentication block (for webhooks or public endpoints)

If `endpoint-name` is missing, ask the user before proceeding.

## Pre-flight Checks

1. Verify `api/{endpoint-name}.ts` does NOT already exist
2. Read `api/evaluate.ts` as the reference pattern
3. Read `lib/cors.ts`, `lib/types/api/errors.ts`, `lib/types/api/common.ts` to confirm imports

## Zod Type Mapping

Map `--fields` types to Zod validators:
| Field Type | Zod Validator |
|------------|---------------|
| `uuid` | `z.string().uuid()` |
| `string` | `z.string()` |
| `number` | `z.number()` |
| `boolean` | `z.boolean()` |
| `email` | `z.string().email()` |
| `url` | `z.string().url()` |

Trailing `?` makes the field optional: `z.{type}().optional()`

## Generate Endpoint File

**File:** `api/{endpoint-name}.ts`

```typescript
/**
 * {Endpoint Title} Endpoint
 *
 * {Brief description based on endpoint name}
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { setCors } from '../lib/cors.js';
import {
  ApiError,
  withErrorHandler,
  validateMethod,
} from '../lib/types/api/errors.js';
import { getEnv } from '../lib/types/api/common.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const {camelName}Schema = z.object({
  {field_name}: {zod_validator},
  // ... for each field
});

type {PascalName}Request = z.infer<typeof {camelName}Schema>;
```

### If `--rate-limit` is specified, add:
```typescript
// ============================================================================
// RATE LIMITING
// ============================================================================

async function checkRateLimits(supabase: any, userId: string): Promise<void> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Rate limit per minute (5/min)
  const { count: countPerMinute } = await supabase
    .schema('maity')
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (countPerMinute && countPerMinute >= 5) {
    throw ApiError.tooManyRequests(
      'Rate limit exceeded: 5 requests per minute. Please wait.'
    );
  }

  // Daily quota (50/day)
  const { count: countPerDay } = await supabase
    .schema('maity')
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  if (countPerDay && countPerDay >= 50) {
    throw ApiError.tooManyRequests(
      'Daily limit of 50 requests exceeded. Try again tomorrow.'
    );
  }
}
```

### Main handler:
```typescript
// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate HTTP method
  validateMethod(req.method, ['{METHOD}']);

  // Parse and validate request body
  let body: {PascalName}Request;
  try {
    body = {camelName}Schema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid request body', error.errors);
    }
    throw error;
  }
```

### If authentication is included (default, no `--no-auth`):
```typescript
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }
  const accessToken = authHeader.substring(7);

  // Initialize Supabase client with service role
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'maity',
    },
  });

  // Verify token and get auth user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !authUser) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // Get maity user_id from auth_id
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    console.error('User lookup error:', userError);
    throw ApiError.notFound('User');
  }

  const userId = maityUser.id;
```

### If `--no-auth`, use simpler Supabase init:
```typescript
  // Initialize Supabase client with service role (no auth required)
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'maity',
    },
  });
```

### If `--rate-limit`, add after auth:
```typescript
  // Check rate limits
  await checkRateLimits(supabase, userId);
```

### Closing:
```typescript
  // TODO: Implement endpoint logic here

  // Return success response
  res.status(200).json({
    ok: true,
    data: {},
  });
}

// Export handler wrapped with error handler
export default withErrorHandler(handler);
```

## Post-creation Summary

Output:
```
API Endpoint: api/{endpoint-name}.ts
Method: {METHOD}
Auth: {yes/no}
Rate limiting: {yes/no}
Fields: {field list with types}
```

Remind the user:
1. The handler has a TODO placeholder — implement the actual business logic
2. If calling RPC functions, use `/new-rpc` to create them
3. Add any needed environment variables to `.env` and Vercel dashboard
4. Test locally with `npm run dev:api`
