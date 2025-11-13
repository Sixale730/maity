# Manual Interview Evaluation Guide

## Overview
This guide explains how to manually trigger OpenAI evaluation for an existing interview session.

**Session ID:** `5d96fd9d-1760-4094-a94f-a75e35994bf8`

## Architecture

### Database Tables
1. **interview_sessions** - Stores interview sessions
   - `id` (UUID) - Session identifier
   - `user_id` (UUID) - User who owns the session
   - `raw_transcript` (TEXT) - Conversation transcript
   - `evaluation_id` (UUID) - Links to evaluation request

2. **interview_evaluations** - Stores evaluation results
   - `request_id` (UUID) - Primary key, tracks evaluation
   - `session_id` (UUID) - Links to interview session
   - `user_id` (UUID) - User being evaluated
   - `status` (TEXT) - 'pending', 'processing', 'complete', 'error'
   - `analysis_text` (TEXT) - Full JSON analysis from OpenAI
   - `rubrics` (JSONB) - Structured rubric scores (6 dimensions)
   - `amazing_comment` (TEXT) - Deep personality insight
   - `summary` (TEXT) - Overall summary
   - `is_complete` (BOOLEAN) - Whether interview had enough content

### API Endpoint
**URL:** `/api/evaluate-interview`
**Method:** POST
**Auth:** Bearer token (JWT)
**Body:**
```json
{
  "session_id": "uuid",
  "request_id": "uuid"
}
```

### Flow
1. Create evaluation record via `create_interview_evaluation()` RPC
   - Validates session exists and belongs to user
   - Returns `request_id` for tracking
2. Call `/api/evaluate-interview` with session_id and request_id
   - Updates status to 'processing'
   - Calls OpenAI with transcript
   - Saves structured results
   - Updates status to 'complete'

## Methods to Trigger Evaluation

### Method 1: Node.js Script (Recommended)
```bash
# Install dependencies if needed
npm install node-fetch

# Run the script
node trigger-interview-evaluation.js <session_id> <bearer_token>

# Example:
node trigger-interview-evaluation.js 5d96fd9d-1760-4094-a94f-a75e35994bf8 eyJhbGc...
```

**To get bearer token:**
1. Login to the app
2. Open browser DevTools > Application > Local Storage
3. Copy the `sb-<project>-auth-token` value
4. Extract the `access_token` from the JSON

### Method 2: Direct curl Command
```bash
# Step 1: Create evaluation record
curl -X POST https://nhlrtflkxoojvhbyocet.supabase.co/rest/v1/rpc/create_interview_evaluation \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "p_session_id": "5d96fd9d-1760-4094-a94f-a75e35994bf8",
    "p_user_id": "USER_ID_HERE"
  }'
# Returns: "request_id"

# Step 2: Trigger evaluation
curl -X POST http://localhost:3000/api/evaluate-interview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "5d96fd9d-1760-4094-a94f-a75e35994bf8",
    "request_id": "REQUEST_ID_FROM_STEP_1"
  }'
```

### Method 3: Supabase SQL Query
Run this in Supabase SQL Editor to check status and manually create evaluation:

```sql
-- 1. Check session exists and get user_id
SELECT id, user_id, status, LENGTH(raw_transcript) as transcript_length
FROM maity.interview_sessions
WHERE id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';

-- 2. Check if evaluation already exists
SELECT request_id, status, created_at
FROM maity.interview_evaluations
WHERE session_id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';

-- 3. Create evaluation record (if doesn't exist)
SELECT create_interview_evaluation(
  '5d96fd9d-1760-4094-a94f-a75e35994bf8'::uuid,  -- session_id
  'USER_ID_HERE'::uuid  -- user_id from step 1
);
-- Returns: request_id

-- 4. Then call API with the returned request_id
```

## Troubleshooting

### Error: "Session not found"
- Verify session ID is correct
- Check if session exists in database
- Run SQL query from check-interview-session.sql

### Error: "Invalid user_id"
- Make sure user_id matches the session owner
- User must be authenticated (valid bearer token)

### Error: "Session has no transcript"
- Session must have raw_transcript populated
- Interview must be completed (not just started)

### Error: "Rate limit exceeded"
- Limit: 5 evaluations/min, 50/day per user
- Wait before retrying

### Error: "Evaluation already exists"
- Check interview_evaluations table
- Delete existing record if re-evaluation needed:
```sql
DELETE FROM maity.interview_evaluations
WHERE session_id = '5d96fd9d-1760-4094-a94f-a75e35994bf8';
```

## Expected Output

### Rubrics (6 dimensions, scored 1-5):
1. **Claridad** - Clarity about personal ideas and values
2. **Adaptación** - Adaptability to situations
3. **Persuasión** - Quality of arguments and evidence
4. **Estructura** - Organization of thoughts
5. **Propósito** - Depth of motivations and meaning
6. **Empatía** - Understanding of others' perspectives

### Additional Fields:
- **amazing_comment** - Deep personality insight (non-obvious deduction)
- **summary** - 2-3 sentence overview of who the person is
- **is_complete** - true if interview had sufficient content (5+ messages)

## Files Created
- `trigger-interview-evaluation.js` - Automated script
- `check-interview-session.sql` - SQL queries
- `MANUAL_EVALUATION_GUIDE.md` - This guide
