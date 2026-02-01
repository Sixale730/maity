---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__supabase__apply_migration, mcp__supabase__execute_sql, mcp__supabase__list_tables, mcp__supabase__list_migrations, mcp__supabase__get_advisors
argument-hint: <function_name> --params <name:type,...> --returns <type> [--service <service-name>]
description: Create a Supabase RPC function with maity schema + public wrapper + GRANT + migration + optional service method
---

# New RPC Function

Create a new Supabase RPC function following the project's mandatory pattern: **$ARGUMENTS**

## Parse Arguments

Extract from `$ARGUMENTS`:
- `function_name`: snake_case name (first positional arg, e.g., `get_user_achievements`)
- `--params`: comma-separated `name:type` pairs (e.g., `user_id:uuid,status:text`)
  - Supported types: `uuid`, `text`, `integer`, `bigint`, `boolean`, `jsonb`, `timestamp`, `date`, `numeric`
- `--returns`: return type (`json`, `jsonb`, `void`, `boolean`, `integer`, `text`, `table`, `setof`)
  - For `table` or `setof`, ask user for column definitions
- `--service`: (optional) domain service name to add method to (e.g., `dashboard`, `coach`, `learning-path`)

If `function_name` is missing, ask the user before proceeding.

## Pre-flight Checks

1. Use `mcp__supabase__list_tables` to understand the current schema
2. Use `mcp__supabase__list_migrations` to check existing migrations
3. Verify the function doesn't already exist:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_schema IN ('maity', 'public') AND routine_name = '{function_name}';
   ```

## SQL Generation

### Parameter naming conventions
- All parameters prefixed with `p_` (e.g., `p_user_id uuid`, `p_status text`)
- Local variables prefixed with `v_` (e.g., `v_result jsonb`)

### Generate the migration SQL

Follow the MANDATORY pattern from CLAUDE.md:

```sql
-- ============================================================================
-- Function: {function_name}
-- Description: {brief description}
-- Parameters: {param list}
-- Returns: {return type}
-- ============================================================================

-- 1. Main function in maity schema
CREATE OR REPLACE FUNCTION maity.{function_name}(
  {p_param1 type1},
  {p_param2 type2}
)
RETURNS {return_type}
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
DECLARE
  v_result {type};
BEGIN
  -- TODO: Implement function logic
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION maity.{function_name}({param types}) IS '{description}';

-- 2. Public wrapper (REQUIRED - exposes to PostgREST/Supabase client)
CREATE OR REPLACE FUNCTION public.{function_name}(
  {p_param1 type1},
  {p_param2 type2}
)
RETURNS {return_type}
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
  SELECT maity.{function_name}({p_param1}, {p_param2});
$$;

COMMENT ON FUNCTION public.{function_name}({param types}) IS 'Public wrapper for maity.{function_name}';

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.{function_name}({param types}) TO authenticated;
```

## Apply Migration

1. Apply via MCP: Use `mcp__supabase__apply_migration` with:
   - `name`: `create_fn_{function_name}`
   - `query`: the generated SQL

2. Save migration file locally: Write to `supabase/migrations/{timestamp}_create_fn_{function_name}.sql`
   - Timestamp format: `YYYYMMDDHHmmss` (current UTC time)

## Add Service Method (if --service provided)

1. Find the service file: `packages/shared/src/domain/{service}/{service}.service.ts`
2. Read the existing service to understand its structure
3. Add a new static method:

```typescript
/**
 * {Brief description of what the function does}
 */
static async {camelCaseName}({params with TS types}): Promise<{TS return type}> {
  const { data, error } = await supabase.rpc('{function_name}', {
    p_{param1}: {param1},
    p_{param2}: {param2},
  });

  if (error) {
    console.error('Error calling {function_name}:', error);
    throw error;
  }

  return data;
}
```

### TypeScript type mapping
| SQL Type | TypeScript Type |
|----------|----------------|
| `uuid` | `string` |
| `text` | `string` |
| `integer`, `bigint`, `numeric` | `number` |
| `boolean` | `boolean` |
| `jsonb`, `json` | `Record<string, unknown>` |
| `timestamp`, `date` | `string` |
| `void` | `void` |

## Security Check

After applying the migration, run `mcp__supabase__get_advisors` with type `security` and report any new advisories.

## Post-creation Summary

Output:
```
RPC Function: {function_name}
Migration: supabase/migrations/{timestamp}_create_fn_{function_name}.sql
Schema: maity.{function_name} + public.{function_name} (wrapper)
Grant: authenticated
Service method: {service}.{camelCaseName}() (if applicable)
Security check: {pass/warnings}
```

Remind the user:
1. The function body has a TODO placeholder - implement the actual logic
2. If the function queries specific tables, verify RLS policies allow access
3. Use `/db-docs-sync` to update database documentation after implementing
