# Linking Evaluations to Voice Sessions

## Overview

The `evaluations` table now supports an optional `session_id` column to link transcript evaluations to voice practice sessions. This provides complete traceability between practice sessions and their AI-generated feedback.

---

## Database Schema

### Relationship

```sql
maity.evaluations
├── id (UUID, primary key)
├── user_id (UUID, references maity.users)
├── request_id (UUID, unique)
├── session_id (UUID, references maity.voice_sessions) -- NEW!
├── status (enum: pending, processing, complete, error)
├── result (JSONB)
├── error_message (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### Foreign Key

```sql
ALTER TABLE maity.evaluations
ADD COLUMN session_id UUID REFERENCES maity.voice_sessions(id) ON DELETE SET NULL;
```

**Important**: `ON DELETE SET NULL` ensures that if a voice_session is deleted, the evaluation record is preserved but the link is removed.

---

## Usage Patterns

### Pattern 1: Standalone Evaluation (No Session)

Use this when evaluating transcripts that aren't part of a formal practice session:

```typescript
const requestId = crypto.randomUUID();

// Create evaluation without session_id
await createEvaluation(requestId, maityUserId);

// Send to n8n
await fetch(n8nWebhook, {
  method: 'POST',
  body: JSON.stringify({
    request_id: requestId,
    transcript: transcript
  })
});
```

---

### Pattern 2: Evaluation Linked to Voice Session

Use this for formal practice sessions with voice agents:

```typescript
// 1. Create voice session first
const { data: session } = await supabase
  .schema('maity')
  .from('voice_sessions')
  .insert({
    user_id: maityUserId,
    company_id: companyId,
    profile_scenario_id: scenarioId,
    status: 'in_progress'
  })
  .select()
  .single();

// 2. Create evaluation linked to session
const requestId = crypto.randomUUID();
await createEvaluation(requestId, maityUserId, session.id);

// 3. Send to n8n with session context
await fetch(n8nWebhook, {
  method: 'POST',
  body: JSON.stringify({
    request_id: requestId,
    session_id: session.id, // Include for context
    transcript: transcript,
    metadata: {
      profile: 'CEO',
      scenario: 'first_visit',
      difficulty: 'medium'
    }
  })
});

// 4. After evaluation completes, update session
const { data: evaluation } = await supabase
  .schema('maity')
  .from('evaluations')
  .select('*')
  .eq('request_id', requestId)
  .single();

if (evaluation.status === 'complete') {
  await supabase
    .schema('maity')
    .from('voice_sessions')
    .update({
      status: 'completed',
      score: evaluation.result.score,
      processed_feedback: evaluation.result,
      ended_at: new Date().toISOString()
    })
    .eq('id', session.id);
}
```

---

## Querying with Joins

### Get Evaluation with Session Details

```typescript
const { data } = await supabase
  .schema('maity')
  .from('evaluations')
  .select(`
    *,
    voice_session:voice_sessions (
      id,
      status,
      started_at,
      duration_seconds,
      profile_scenario:voice_profile_scenarios (
        profile:voice_agent_profiles (name),
        scenario:voice_scenarios (name),
        difficulty:voice_difficulty_levels (level, name)
      )
    )
  `)
  .eq('request_id', requestId)
  .single();

console.log('Evaluation for session:', data.voice_session.id);
console.log('Practice with:', data.voice_session.profile_scenario.profile.name);
console.log('Score:', data.result.score);
```

### Get All Evaluations for a Session

```typescript
const { data: evaluations } = await supabase
  .schema('maity')
  .from('evaluations')
  .select('*')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: true });

// Multiple evaluations per session (e.g., re-evaluations with different prompts)
```

### Get Session with Latest Evaluation

```typescript
const { data: session } = await supabase
  .schema('maity')
  .from('voice_sessions')
  .select(`
    *,
    evaluations:evaluations (
      id,
      request_id,
      status,
      result,
      created_at
    )
  `)
  .eq('id', sessionId)
  .single();

const latestEval = session.evaluations?.[0]; // Assuming ordered by created_at desc
```

---

## Benefits of Linking

### 1. **Traceability**
Track which evaluation belongs to which practice session.

### 2. **Context for LLM**
n8n can access session metadata (profile, scenario, difficulty) to provide more contextual feedback.

### 3. **Analytics**
Query evaluations by session type, profile, scenario, difficulty level.

```sql
-- Average score by profile
SELECT
  vap.name as profile,
  AVG((e.result->>'score')::numeric) as avg_score,
  COUNT(*) as total_evaluations
FROM maity.evaluations e
JOIN maity.voice_sessions vs ON e.session_id = vs.id
JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
WHERE e.status = 'complete'
GROUP BY vap.name;
```

### 4. **Historical Tracking**
See evaluation history for each session (useful if re-evaluating with improved prompts).

---

## Migration Considerations

### Existing Evaluations

Existing evaluations without `session_id` will have `NULL` value, which is fine. They represent standalone evaluations not tied to a formal session.

### Backward Compatibility

The `session_id` is **optional**. Code that doesn't pass it will continue to work:

```typescript
// Old code (still works)
await createEvaluation(requestId, maityUserId);

// New code (with session linking)
await createEvaluation(requestId, maityUserId, sessionId);
```

---

## Best Practices

### 1. **Always Link for Voice Sessions**

If the evaluation is for a `voice_sessions` practice, always pass the `session_id`:

```typescript
// ✅ Good
const session = await createVoiceSession(...);
await createEvaluation(requestId, maityUserId, session.id);

// ❌ Bad (loses traceability)
const session = await createVoiceSession(...);
await createEvaluation(requestId, maityUserId); // Missing session_id
```

### 2. **Update Session After Evaluation**

When evaluation completes, update the corresponding `voice_sessions` record:

```typescript
// In Realtime callback
onComplete: async (result) => {
  if (sessionId) {
    await supabase
      .schema('maity')
      .from('voice_sessions')
      .update({
        score: result.score,
        processed_feedback: result,
        status: 'completed'
      })
      .eq('id', sessionId);
  }
}
```

### 3. **Send Session Context to n8n**

Include session metadata in the n8n webhook payload for better LLM context:

```typescript
{
  request_id: requestId,
  session_id: sessionId,
  transcript: transcript,
  metadata: {
    profile: 'CEO',
    scenario: 'first_visit',
    difficulty: 'medium',
    user_skill_level: 'intermediate'
  }
}
```

---

## Example: Complete Voice Session Flow

```typescript
import { createEvaluation, useEvaluationRealtime } from '@/hooks/useEvaluationRealtime';
import { supabase } from '@/integrations/supabase/client';

async function startVoiceSession(
  maityUserId: string,
  companyId: string,
  profileScenarioId: string,
  transcript: string
) {
  // 1. Create voice session
  const { data: session } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .insert({
      user_id: maityUserId,
      company_id: companyId,
      profile_scenario_id: profileScenarioId,
      status: 'evaluating' // Changed from 'in_progress' to indicate evaluation phase
    })
    .select()
    .single();

  console.log('✅ Session created:', session.id);

  // 2. Create evaluation linked to session
  const requestId = crypto.randomUUID();
  await createEvaluation(requestId, maityUserId, session.id);

  console.log('✅ Evaluation created:', requestId);

  // 3. Listen for evaluation updates
  const { evaluation } = useEvaluationRealtime({
    requestId,
    onComplete: async (result) => {
      console.log('✅ Evaluation complete!', result);

      // 4. Update session with results
      await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          status: 'completed',
          score: result.score,
          processed_feedback: result,
          ended_at: new Date().toISOString()
        })
        .eq('id', session.id);

      console.log('✅ Session updated with evaluation results');
    },
    onError: async (errorMessage) => {
      console.error('❌ Evaluation failed:', errorMessage);

      // Mark session as failed
      await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({ status: 'abandoned' })
        .eq('id', session.id);
    }
  });

  // 5. Send transcript to n8n
  await fetch('https://n8n-webhook-url', {
    method: 'POST',
    body: JSON.stringify({
      request_id: requestId,
      session_id: session.id,
      transcript: transcript
    })
  });

  return { session, requestId, evaluation };
}
```

---

## Summary

- ✅ `session_id` column added to `maity.evaluations`
- ✅ Optional parameter in `createEvaluation()` function
- ✅ Backward compatible (existing code continues to work)
- ✅ Enables powerful analytics and traceability
- ✅ Supports session context in n8n for better LLM prompts
- ✅ Allows querying evaluations by session, profile, scenario, etc.