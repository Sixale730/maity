---
allowed-tools: Read, Glob, Grep, Bash
argument-hint: (no arguments needed)
description: Audit i18n translation completeness across es/en languages (read-only)
model: sonnet
---

# i18n Translation Audit

Perform a comprehensive audit of translation completeness in the Maity platform. This is a **read-only** operation that reports discrepancies without making changes.

## Step 1: Extract Defined Translation Keys

Read `src/contexts/LanguageContext.tsx` and extract ALL keys defined in:
- The `es` (Spanish) translation object
- The `en` (English) translation object

Build two sets: `esKeys` and `enKeys`.

## Step 2: Scan Code for Used Translation Keys

Search across `src/**/*.{ts,tsx}` for translation key usage patterns:

1. **Static keys**: `t('key')` and `t("key")` — extract the literal string
2. **Template literal keys**: `` t(`key.${var}`) `` — mark as "dynamic, cannot verify"
3. **Object access patterns**: `t(someVar)` where the key comes from a variable — mark as "dynamic"

Use Grep to find all `t(` usages, then parse each match to extract the key.

Build a set: `usedKeys` (only static string keys).

## Step 3: Cross-Reference Analysis

### 3a. Missing keys (used in code but not defined)
```
missingInEs = usedKeys - esKeys
missingInEn = usedKeys - enKeys
```

### 3b. Orphaned keys (defined but never used in code)
```
orphanedEs = esKeys - usedKeys
orphanedEn = enKeys - usedKeys
```
Note: Some orphaned keys may be used dynamically. Flag but don't treat as errors.

### 3c. Language mismatch (defined in one language but not the other)
```
missingFromEn = esKeys - enKeys  (in Spanish but not English)
missingFromEs = enKeys - esKeys  (in English but not Spanish)
```

## Step 4: Coverage Calculation

```
Total unique keys = esKeys + enKeys + usedKeys (union)
Es coverage = |esKeys ∩ usedKeys| / |usedKeys| * 100
En coverage = |enKeys ∩ usedKeys| / |usedKeys| * 100
Parity = |esKeys ∩ enKeys| / |esKeys ∪ enKeys| * 100
```

## Step 5: Section Breakdown

Group keys by prefix (first segment before `.`):
- `nav.*` — Navigation
- `dashboard.*` — Dashboard
- `coach.*` — Coach
- `gamified.*` — Gamified Dashboard
- `roleplay.*` — Roleplay
- `auth.*` — Authentication
- `avatar.*` — Avatar
- `levels.*` — Levels
- `common.*` — Common/Shared
- Other sections as found

For each section, report count of keys per language and any mismatches.

## Step 6: Dynamic Key Detection

List all `t()` calls that use template literals or variables:
```
src/features/coach/components/DiagnosticResults.tsx:42  t(`competency.${comp.name}`)  → DYNAMIC
```

These cannot be verified statically but should be noted.

## Output Report

```markdown
# i18n Audit Report

## Summary
| Metric | Value |
|--------|-------|
| Total defined keys (ES) | {count} |
| Total defined keys (EN) | {count} |
| Keys used in code (static) | {count} |
| Dynamic key usages | {count} |
| ES coverage | {x}% |
| EN coverage | {x}% |
| Language parity | {x}% |

## Missing Keys (used but not defined)
### Missing from ES
- `key.name` — used in `src/path/File.tsx:line`
### Missing from EN
- `key.name` — used in `src/path/File.tsx:line`

## Language Mismatch (defined in one, missing from other)
### In ES but not EN
- `key.name`
### In EN but not ES
- `key.name`

## Orphaned Keys (defined but not found in code)
> Note: Some may be used dynamically
- `key.name` (es only / en only / both)

## Section Breakdown
| Section | ES Keys | EN Keys | Used | Missing |
|---------|---------|---------|------|---------|
| nav | {n} | {n} | {n} | {n} |
| dashboard | {n} | {n} | {n} | {n} |
| ... | ... | ... | ... | ... |

## Dynamic Key Usages
| File | Line | Expression |
|------|------|------------|
| path | line | t(`...${var}`) |

## Recommendations
1. {Specific actionable recommendations based on findings}
```

Do NOT modify any files. This is a reporting-only command.
