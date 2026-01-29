---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__supabase__list_tables, mcp__supabase__execute_sql, mcp__supabase__list_migrations, mcp__supabase__get_advisors
argument-hint: [--update]
description: Compare live database schema vs docs, report discrepancies, optionally update docs
model: sonnet
---

# Database Documentation Sync

Compare the live Supabase database schema against `docs/database-structure-and-rls.md` and report discrepancies: **$ARGUMENTS**

## Determine Mode

- No arguments or empty `$ARGUMENTS`: **Report-only mode** (read-only)
- `--update` in `$ARGUMENTS`: **Update mode** (will modify the docs file)

## Step 1: Read Current Documentation

Read `docs/database-structure-and-rls.md` and extract:
- List of documented tables (with schema)
- List of documented columns per table
- RLS status per table (enabled/disabled)
- Documented RPC functions
- Documented policies
- Current document version (if present)

## Step 2: Query Live Schema

### 2a. Tables and columns
Use `mcp__supabase__list_tables` for schemas `['maity', 'public']`.

Then for detailed column info, use `mcp__supabase__execute_sql`:
```sql
SELECT
  t.table_schema,
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c
  ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE t.table_schema IN ('maity', 'public')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name, c.ordinal_position;
```

### 2b. RLS status
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname IN ('maity', 'public');
```

### 2c. RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname IN ('maity', 'public')
ORDER BY schemaname, tablename, policyname;
```

### 2d. Functions
```sql
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('maity', 'public')
  AND p.prokind = 'f'
ORDER BY n.nspname, p.proname;
```

### 2e. GRANTs on functions
```sql
SELECT
  n.nspname as schema,
  p.proname as function_name,
  r.rolname as grantee,
  has_function_privilege(r.oid, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND r.rolname = 'authenticated'
  AND has_function_privilege(r.oid, p.oid, 'EXECUTE')
ORDER BY p.proname;
```

## Step 3: Compare and Report

### 3a. Tables
- **New tables**: In live schema but not in docs
- **Removed tables**: In docs but not in live schema
- **Column changes**: New/removed/modified columns

### 3b. RLS
- **Tables without RLS**: `rowsecurity = false` (security risk!)
- **RLS policy changes**: New/removed policies

### 3c. Functions
- **maity functions without public wrapper**: Functions in `maity` schema that have no corresponding `public` function
- **Missing GRANTs**: Public functions without `GRANT EXECUTE ... TO authenticated`
- **New functions**: In live schema but not documented
- **Removed functions**: In docs but not in live schema

## Step 4: Security Advisors

Run `mcp__supabase__get_advisors` with type `security` and include findings in the report.

## Step 5: Output Report

```markdown
# Database Schema Sync Report

## Summary
| Metric | Count |
|--------|-------|
| Tables in docs | {n} |
| Tables in live DB | {n} |
| New tables (undocumented) | {n} |
| Removed tables (stale docs) | {n} |
| Tables missing RLS | {n} |
| Functions missing public wrapper | {n} |
| Functions missing GRANT | {n} |

## New Tables (not in docs)
| Schema | Table | Columns | RLS |
|--------|-------|---------|-----|
| maity | {name} | {count} | {yes/no} |

## Removed Tables (in docs, not in DB)
- `maity.{table_name}`

## Column Changes
### {schema}.{table_name}
- Added: `column_name` ({type})
- Removed: `column_name`

## RLS Issues
### Tables without RLS enabled
- `maity.{table_name}` — **SECURITY RISK**

### Missing/Changed Policies
- `maity.{table_name}`: policy `{name}` not documented

## Function Issues
### maity functions without public wrapper
- `maity.{function_name}()` — needs `public.{function_name}()` wrapper

### Public functions without GRANT to authenticated
- `public.{function_name}()` — needs `GRANT EXECUTE TO authenticated`

## Security Advisors
{Include output from get_advisors}

## Recommendations
1. {Specific actionable items}
```

## Step 6: Update Docs (if --update)

If `--update` was specified:
1. Read `docs/database-structure-and-rls.md`
2. Update the document to reflect the live schema:
   - Add new tables with their columns, types, and RLS status
   - Remove stale table references
   - Update column definitions
   - Add new functions
   - Update version header (increment or add date)
3. Write the updated file using Edit tool
4. Confirm what was changed

If `--update` was NOT specified, just output the report and suggest running with `--update` if changes are needed.
